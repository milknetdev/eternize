import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// DASHBOARD STATS
// =====================

// Gift Orders - fetch all orders for the wedding
r.get("/api/gift-orders", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const orders = await c.env.DB.prepare(`
    SELECT go.*, wg.name as gift_name, wg.image_url as gift_image
    FROM gift_orders go
    LEFT JOIN wedding_gifts wg ON go.gift_id = wg.id
    WHERE go.wedding_id = ?
    ORDER BY go.created_at DESC
  `).bind(wedding.id).all();

  return c.json({ orders: orders.results || [] });
});

// Get available balance (paid orders not yet converted)
r.get("/api/balance", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id, pix_key FROM weddings WHERE user_id = ?"
  ).bind(userId).first<{ id: number; pix_key: string }>();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const available = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE"
  ).bind(wedding.id).first<{ total: number }>();

  const converted = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = TRUE"
  ).bind(wedding.id).first<{ total: number }>();

  const pending = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM cash_withdrawals WHERE wedding_id = ? AND status = 'pending'"
  ).bind(wedding.id).first<{ total: number }>();

  return c.json({
    availableBalance: available?.total || 0,
    convertedTotal: converted?.total || 0,
    pendingWithdrawal: pending?.total || 0,
    pixKey: wedding.pix_key || null,
  });
});

// Get withdrawal history
r.get("/api/withdrawals", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const withdrawals = await c.env.DB.prepare(
    "SELECT * FROM cash_withdrawals WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();

  return c.json({ withdrawals: withdrawals.results || [] });
});

// Request a cash withdrawal
r.post("/api/withdrawals", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id, pix_key FROM weddings WHERE user_id = ?"
  ).bind(userId).first<{ id: number; pix_key: string }>();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { amount, pixKey, pixKeyType } = await c.req.json<{
    amount: number;
    pixKey: string;
    pixKeyType: string;
  }>();

  // Check available balance
  const available = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE"
  ).bind(wedding.id).first<{ total: number }>();

  if (!available?.total || amount > available.total) {
    return c.json({ error: "Insufficient balance" }, 400);
  }

  // Create withdrawal request
  const result = await c.env.DB.prepare(`
    INSERT INTO cash_withdrawals (wedding_id, amount, pix_key, pix_key_type, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(wedding.id, amount, pixKey, pixKeyType).run();

  // Mark orders as converted (up to the withdrawal amount)
  const ordersToConvert = await c.env.DB.prepare(`
    SELECT id, amount FROM gift_orders 
    WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE
    ORDER BY created_at ASC
  `).bind(wedding.id).all<{ id: number; amount: number }>();

  let remaining = amount;
  for (const order of ordersToConvert.results || []) {
    if (remaining <= 0) break;
    await c.env.DB.prepare(`
      UPDATE gift_orders SET is_converted = TRUE, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(order.id).run();
    remaining -= order.amount;
  }

  return c.json({ success: true, withdrawalId: result.meta?.last_row_id });
});

export default r;
