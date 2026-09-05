import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { SUPPORT_COOKIE_NAME } from "../local-auth-backend";
import { adminMiddleware } from "../lib/admin";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();

const COOKIE = {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: true,
} as const;

function supportToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return "sup_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

// Admin: start acting as a couple. Creates a 12h session in a *separate* cookie
// so the admin's own login is never touched; authMiddleware prefers it.
r.post("/api/admin/couples/:id/impersonate", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const w = await c.env.DB.prepare(
    `SELECT w.id, w.partner1_name, w.partner2_name, u.id AS user_id, u.email, u.name
     FROM weddings w JOIN users u ON u.id = w.user_id WHERE w.id = ?`,
  ).bind(id).first<{ user_id: string; email: string; name: string }>();
  if (!w) return c.json({ error: "Couple not found" }, 404);

  const token = supportToken();
  await c.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES (?, ?, ?, ?, NOW() + INTERVAL '12 hours')",
  ).bind(token, w.user_id, w.email, w.name).run();

  setCookie(c, SUPPORT_COOKIE_NAME, token, { ...COOKIE, maxAge: 12 * 60 * 60 });
  console.log(`[support] ${c.get("user")?.email} -> wedding ${id} (${w.email})`);
  return c.json({ success: true });
});

// Public: is a support session active? Drives the banner shown across the app.
r.get("/api/support/context", async (c) => {
  const token = getCookie(c, SUPPORT_COOKIE_NAME);
  if (!token) return c.json({ impersonating: false });

  const s = await c.env.DB.prepare(
    "SELECT user_id, name FROM sessions WHERE token = ? AND expires_at > NOW()",
  ).bind(token).first<{ user_id: string; name: string }>();
  if (!s) return c.json({ impersonating: false });

  const w = await c.env.DB.prepare(
    "SELECT partner1_name, partner2_name, custom_url FROM weddings WHERE user_id = ? LIMIT 1",
  ).bind(s.user_id).first<{ partner1_name: string | null; partner2_name: string | null; custom_url: string | null }>();

  return c.json({
    impersonating: true,
    account: s.name,
    couple: w ? `${w.partner1_name ?? ""} & ${w.partner2_name ?? ""}`.replace(/^ & | & $/g, "").trim() || s.name : s.name,
    customUrl: w?.custom_url ?? null,
  });
});

// Stop acting as the couple. The admin's eternize_session cookie is untouched,
// so they're immediately back to being themselves.
r.post("/api/support/stop", async (c) => {
  const token = getCookie(c, SUPPORT_COOKIE_NAME);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  setCookie(c, SUPPORT_COOKIE_NAME, "", { ...COOKIE, maxAge: 0 });
  return c.json({ success: true });
});

export default r;
