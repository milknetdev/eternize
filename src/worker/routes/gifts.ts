import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// GIFTS ROUTES
// =====================

r.get("/api/gifts", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_gifts WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results);
});

r.post("/api/gifts", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_gifts (wedding_id, name, description, price, image_url, category, quota_total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.description, body.price,
    body.image_url, body.category, body.quota_total || 1
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

r.put("/api/gifts/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();

  const res = await c.env.DB.prepare(`
    UPDATE wedding_gifts SET
      name = ?, description = ?, price = ?, image_url = ?,
      category = ?, is_available = ?, quota_total = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name, body.description, body.price, body.image_url,
    body.category, body.is_available ? true : false, body.quota_total, id, weddingId
  ).run();

  if (!res.meta.changes) return c.json({ error: "Gift not found" }, 404);
  return c.json({ success: true });
});

r.delete("/api/gifts/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_gifts WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Gift not found" }, 404);
  return c.json({ success: true });
});

export default r;
