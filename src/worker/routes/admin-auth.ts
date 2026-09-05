import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { ADMIN_COOKIE_NAME } from "../lib/admin";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();

const COOKIE = { httpOnly: true, path: "/", sameSite: "lax", secure: true } as const;

function adminToken() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return "adm_" + Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

function expectedPassword(c: { env?: unknown }) {
  return (c.env as any)?.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
}

// Standalone admin login — one shared password, no e-mail / user account.
r.post("/api/admin/login", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  const expected = expectedPassword(c);

  if (!expected) {
    return c.json({ error: "ADMIN_PASSWORD não configurado no servidor." }, 500);
  }
  if (password !== expected) {
    await new Promise((res) => setTimeout(res, 350)); // slow down guessing
    return c.json({ error: "Senha incorreta." }, 401);
  }

  const token = adminToken();
  await c.env.DB.prepare(
    "INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES (?, '__admin__', 'admin', 'Admin', NOW() + INTERVAL '30 days')",
  ).bind(token).run();
  setCookie(c, ADMIN_COOKIE_NAME, token, { ...COOKIE, maxAge: 30 * 24 * 60 * 60 });
  return c.json({ success: true });
});

// Is the current visitor an authenticated admin? (drives the /admin gate)
r.get("/api/admin/me", async (c) => {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (!token) return c.json({ admin: false });
  const row = await c.env.DB.prepare(
    "SELECT 1 AS ok FROM sessions WHERE token = ? AND user_id = '__admin__' AND expires_at > NOW()",
  ).bind(token).first();
  return c.json({ admin: !!row });
});

r.post("/api/admin/logout", async (c) => {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (token) await c.env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  setCookie(c, ADMIN_COOKIE_NAME, "", { ...COOKIE, maxAge: 0 });
  return c.json({ success: true });
});

export default r;
