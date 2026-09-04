import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { adminMiddleware } from "../lib/admin";

const r = new Hono<AppEnv>();

// =====================
// ADMIN ROUTES
// =====================

// Admin stats
r.get("/api/admin/stats", authMiddleware, adminMiddleware, async (c) => {
  const totalWeddings = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM weddings"
  ).first<{ count: number }>();

  const publishedWeddings = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM weddings WHERE is_published = TRUE"
  ).first<{ count: number }>();

  const totalGuests = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guests"
  ).first<{ count: number }>();

  const totalGiftsValue = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE payment_status = 'paid'"
  ).first<{ total: number }>();

  const pendingWithdrawals = await c.env.DB.prepare(
    "SELECT COUNT(*) as count, SUM(amount) as total FROM cash_withdrawals WHERE status = 'pending'"
  ).first<{ count: number; total: number }>();

  return c.json({
    totalWeddings: totalWeddings?.count || 0,
    publishedWeddings: publishedWeddings?.count || 0,
    totalGuests: totalGuests?.count || 0,
    totalGiftsValue: totalGiftsValue?.total || 0,
    pendingWithdrawals: pendingWithdrawals?.count || 0,
    pendingWithdrawalsAmount: pendingWithdrawals?.total || 0,
    totalRevenue: totalGiftsValue?.total || 0,
  });
});

// Admin - list all weddings
r.get("/api/admin/weddings", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      w.*,
      (SELECT COUNT(*) FROM guests WHERE wedding_id = w.id) as guest_count,
      (SELECT COALESCE(SUM(amount), 0) FROM gift_orders WHERE wedding_id = w.id AND payment_status = 'paid') as gifts_total
    FROM weddings w
    ORDER BY w.created_at DESC
  `).all();

  return c.json({ weddings: results || [] });
});

// Admin - list all withdrawals
r.get("/api/admin/withdrawals", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      cw.*,
      w.partner1_name,
      w.partner2_name
    FROM cash_withdrawals cw
    JOIN weddings w ON cw.wedding_id = w.id
    ORDER BY 
      CASE WHEN cw.status = 'pending' THEN 0 ELSE 1 END,
      cw.created_at DESC
  `).all();

  return c.json({ withdrawals: results || [] });
});

// Admin - approve withdrawal
r.post("/api/admin/withdrawals/:id/approve", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'approved', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true });
});

// Admin - reject withdrawal
r.post("/api/admin/withdrawals/:id/reject", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  // Get the withdrawal to find amounts to un-convert
  const withdrawal = await c.env.DB.prepare(
    "SELECT wedding_id, amount FROM cash_withdrawals WHERE id = ?"
  ).bind(id).first<{ wedding_id: number; amount: number }>();

  if (withdrawal) {
    // Un-convert orders (mark them as available again)
    let remaining = withdrawal.amount;
    const orders = await c.env.DB.prepare(`
      SELECT id, amount FROM gift_orders 
      WHERE wedding_id = ? AND is_converted = TRUE
      ORDER BY converted_at DESC
    `).bind(withdrawal.wedding_id).all<{ id: number; amount: number }>();

    for (const order of orders.results || []) {
      if (remaining <= 0) break;
      await c.env.DB.prepare(`
        UPDATE gift_orders SET is_converted = FALSE, converted_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(order.id).run();
      remaining -= order.amount;
    }
  }

  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'rejected', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true });
});

export default r;
