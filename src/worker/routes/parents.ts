import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// PARENTS (PAIS) ROUTES
// =====================

r.get("/api/parents", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_parents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json(results);
});

r.post("/api/parents", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_parents (wedding_id, name, role, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.role, body.image_url, body.sort_order || 0
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

r.put("/api/parents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();

  const res = await c.env.DB.prepare(`
    UPDATE wedding_parents SET
      name = ?, role = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name, body.role, body.image_url, body.sort_order || 0, id, weddingId
  ).run();

  if (!res.meta.changes) return c.json({ error: "Parent not found" }, 404);
  return c.json({ success: true });
});

r.delete("/api/parents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_parents WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Parent not found" }, 404);
  return c.json({ success: true });
});

r.get("/api/public/wedding/:customUrl/parents", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, role, image_url, sort_order FROM wedding_parents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json({ parents: results || [] });
});

export default r;
