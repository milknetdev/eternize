import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// TABLES ROUTES
// =====================

r.get("/api/tables", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_tables WHERE wedding_id = ? ORDER BY table_number, name"
  ).bind(wedding.id).all();
  
  return c.json(results || []);
});

r.post("/api/tables", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_tables (wedding_id, name, capacity, shape, table_number)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    wedding.id, 
    body.name, 
    body.capacity || 10, 
    body.shape || "round",
    body.table_number || null
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

r.put("/api/tables/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();

  const res = await c.env.DB.prepare(`
    UPDATE wedding_tables SET
      name = ?, capacity = ?, shape = ?, table_number = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(body.name, body.capacity, body.shape, body.table_number || null, id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Table not found" }, 404);
  return c.json({ success: true });
});

r.delete("/api/tables/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

  const table = await c.env.DB.prepare(
    "SELECT id FROM wedding_tables WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).first();
  if (!table) return c.json({ error: "Table not found" }, 404);

  // Clear table_id from this wedding's guests assigned to this table
  await c.env.DB.prepare(
    "UPDATE guests SET table_id = NULL WHERE table_id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();

  // Delete the table
  await c.env.DB.prepare(
    "DELETE FROM wedding_tables WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();

  return c.json({ success: true });
});

export default r;
