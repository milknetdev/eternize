import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// ACCOMMODATIONS (ESTADIA) ROUTES
// =====================

r.get("/api/accommodations", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_accommodations WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json(results);
});

r.post("/api/accommodations", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_accommodations (wedding_id, name, description, address, phone, website, price_range, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.description, body.address,
    body.phone, body.website, body.price_range, body.image_url, body.sort_order || 0
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

r.put("/api/accommodations/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();

  const res = await c.env.DB.prepare(`
    UPDATE wedding_accommodations SET
      name = ?, description = ?, address = ?, phone = ?, website = ?,
      price_range = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name, body.description, body.address, body.phone,
    body.website, body.price_range, body.image_url, body.sort_order || 0, id, weddingId
  ).run();

  if (!res.meta.changes) return c.json({ error: "Accommodation not found" }, 404);
  return c.json({ success: true });
});

r.delete("/api/accommodations/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_accommodations WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Accommodation not found" }, 404);
  return c.json({ success: true });
});

r.get("/api/public/wedding/:customUrl/accommodations", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, description, address, phone, website, price_range, image_url, sort_order FROM wedding_accommodations WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json({ accommodations: results || [] });
});


// List contributions for the user's wedding

export default r;
