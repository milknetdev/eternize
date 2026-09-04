import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// MESSAGES ROUTES (Dashboard)
// =====================

r.get("/api/messages", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM guest_messages WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results);
});

r.put("/api/messages/:id/approve", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "UPDATE guest_messages SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Message not found" }, 404);
  return c.json({ success: true });
});

r.put("/api/messages/:id/reject", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "UPDATE guest_messages SET is_approved = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Message not found" }, 404);
  return c.json({ success: true });
});

r.delete("/api/messages/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM guest_messages WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Message not found" }, 404);
  return c.json({ success: true });
});

export default r;
