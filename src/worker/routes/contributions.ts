import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";
import { computeSplit } from "./platform";

const r = new Hono<AppEnv>();
r.get("/api/contributions", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM pix_contributions WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results || []);
});

// Mark contribution as paid
r.put("/api/contributions/:id/confirm", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(`
    UPDATE pix_contributions
    SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Contribution not found" }, 404);
  return c.json({ success: true });
});

// Delete a contribution
r.delete("/api/contributions/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const res = await c.env.DB.prepare(
    "DELETE FROM pix_contributions WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();
  if (!res.meta.changes) return c.json({ error: "Contribution not found" }, 404);
  return c.json({ success: true });
});

// Public - Get contributions for a wedding (approved only)
r.get("/api/public/wedding/:customUrl/contributions", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) return c.json({ contributions: [] });

  const { results } = await c.env.DB.prepare(`
    SELECT contributor_name, amount, message, is_anonymous, created_at
    FROM pix_contributions 
    WHERE wedding_id = ? AND payment_status = 'paid'
    ORDER BY created_at DESC
  `).bind(wedding.id).all();
  
  return c.json({ contributions: results || [] });
});

// Public - Submit a contribution
r.post("/api/public/wedding/:customUrl/contributions", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  const result = await c.env.DB.prepare(`
    INSERT INTO pix_contributions (wedding_id, contributor_name, amount, message, is_anonymous, payment_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).bind(
    wedding.id,
    body.contributor_name,
    body.amount,
    body.message || null,
    body.is_anonymous ? true : false
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Public: Submit gift order with personalized card
r.post("/api/public/gift-order", async (c) => {
  const body = await c.req.json();

  if (!body.wedding_id || !body.gift_id || !body.guest_name) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const amount = Number(body.amount) || 0;
  const cardPrice = Number(body.card_price) || 0;
  // The flat maintenance fee is charged once per checkout — the client sets this
  // flag on the first cart item only.
  const split = await computeSplit(c, amount, cardPrice, !!body.apply_maintenance_fee);

  const result = await c.env.DB.prepare(`
    INSERT INTO gift_orders (
      wedding_id, gift_id, guest_name, guest_email, amount, message,
      card_type, card_sender_name, card_message, card_price,
      maintenance_fee, commission_pct, commission_amount, platform_amount, couple_amount,
      payment_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    body.wedding_id,
    body.gift_id,
    body.guest_name,
    body.guest_email || null,
    amount,
    body.message || null,
    body.card_type || 'gratis',
    body.card_sender_name || body.guest_name,
    body.card_message || null,
    cardPrice,
    split.maintenance_fee,
    split.commission_pct,
    split.commission_amount,
    split.platform_amount,
    split.couple_amount
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

export default r;
