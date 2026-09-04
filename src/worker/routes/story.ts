import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// STORY ITEMS
// =====================

r.get("/api/story-items", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);
  
  const items = await c.env.DB.prepare(
    "SELECT * FROM wedding_story_items WHERE wedding_id = ? ORDER BY sort_order ASC"
  ).bind(wedding.id).all();
  
  return c.json(items.results || []);
});

r.post("/api/story-items", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  const body = await c.req.json();
  const { title, description, story_date, image_url } = body;
  
  // Get max sort_order
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max_order FROM wedding_story_items WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  const sortOrder = ((maxOrder?.max_order as number) || 0) + 1;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_story_items (wedding_id, title, description, story_date, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(wedding.id, title, description || null, story_date || null, image_url || null, sortOrder).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

r.put("/api/story-items/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const { title, description, story_date, image_url } = body;
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  await c.env.DB.prepare(`
    UPDATE wedding_story_items 
    SET title = ?, description = ?, story_date = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(title, description || null, story_date || null, image_url || null, id, wedding.id).run();
  
  return c.json({ success: true });
});

r.delete("/api/story-items/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  await c.env.DB.prepare(
    "DELETE FROM wedding_story_items WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).run();
  
  return c.json({ success: true });
});

r.put("/api/story-items/reorder", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const { items } = body as { items: { id: number; sort_order: number }[] };
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  for (const item of items) {
    await c.env.DB.prepare(
      "UPDATE wedding_story_items SET sort_order = ? WHERE id = ? AND wedding_id = ?"
    ).bind(item.sort_order, item.id, wedding.id).run();
  }
  
  return c.json({ success: true });
});

export default r;
