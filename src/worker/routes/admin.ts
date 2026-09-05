import { Hono } from "hono";
import * as bcrypt from "bcryptjs";
import type { AppEnv } from "../lib/types";
import { adminMiddleware } from "../lib/admin";

const r = new Hono<AppEnv>();

// =====================
// ADMIN ROUTES
// =====================

// Admin stats
r.get("/api/admin/stats", adminMiddleware, async (c) => {
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
r.get("/api/admin/weddings", adminMiddleware, async (c) => {
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
r.get("/api/admin/withdrawals", adminMiddleware, async (c) => {
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
r.post("/api/admin/withdrawals/:id/approve", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'approved', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true });
});

// Admin - reject withdrawal
r.post("/api/admin/withdrawals/:id/reject", adminMiddleware, async (c) => {
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

// =====================
// SUPPORT CONSOLE
// =====================

// Search couples by e-mail / name / partner names / site URL
r.get("/api/admin/couples", adminMiddleware, async (c) => {
  const q = (c.req.query("q") || "").trim();
  const like = `%${q}%`;
  const { results } = await c.env.DB.prepare(
    `SELECT w.id, w.partner1_name, w.partner2_name, w.custom_url, w.wedding_date,
            w.is_published, w.created_at, w.user_id,
            u.email AS user_email, u.name AS user_name,
            (SELECT COUNT(*) FROM guests WHERE wedding_id = w.id) AS guest_count,
            (SELECT COALESCE(SUM(amount),0) FROM gift_orders WHERE wedding_id = w.id AND payment_status = 'paid') AS gifts_total
     FROM weddings w
     JOIN users u ON u.id = w.user_id
     WHERE ? = ''
        OR u.email ILIKE ? OR u.name ILIKE ?
        OR w.partner1_name ILIKE ? OR w.partner2_name ILIKE ?
        OR w.custom_url ILIKE ?
     ORDER BY w.created_at DESC
     LIMIT 50`,
  ).bind(q, like, like, like, like, like).all();
  return c.json({ couples: results || [] });
});

// Full record for one couple
r.get("/api/admin/couples/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const wedding = await c.env.DB.prepare(
    `SELECT w.*, u.email AS user_email, u.name AS user_name
     FROM weddings w JOIN users u ON u.id = w.user_id WHERE w.id = ?`,
  ).bind(id).first();
  if (!wedding) return c.json({ error: "Couple not found" }, 404);

  const counts = await c.env.DB.prepare(
    `SELECT
       (SELECT COUNT(*) FROM guests WHERE wedding_id = ?) AS guests,
       (SELECT COUNT(*) FROM guests WHERE wedding_id = ? AND is_confirmed = TRUE) AS confirmed,
       (SELECT COUNT(*) FROM wedding_gifts WHERE wedding_id = ?) AS gifts,
       (SELECT COUNT(*) FROM wedding_photos WHERE wedding_id = ?) AS photos,
       (SELECT COUNT(*) FROM guest_messages WHERE wedding_id = ?) AS messages`,
  ).bind(id, id, id, id, id).first();

  const orders = await c.env.DB.prepare(
    `SELECT id, guest_name, amount, payment_status, is_converted, created_at
     FROM gift_orders WHERE wedding_id = ? ORDER BY created_at DESC LIMIT 20`,
  ).bind(id).all();

  const withdrawals = await c.env.DB.prepare(
    `SELECT id, amount, pix_key, pix_key_type, status, created_at, processed_at
     FROM cash_withdrawals WHERE wedding_id = ? ORDER BY created_at DESC`,
  ).bind(id).all();

  return c.json({
    wedding,
    counts,
    orders: orders.results || [],
    withdrawals: withdrawals.results || [],
  });
});

// Edit a couple's record on their behalf (support). Partial whitelist.
r.patch("/api/admin/couples/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const TEXT_COLS = ["partner1_name", "partner2_name", "wedding_date", "venue_name",
    "venue_address", "custom_url", "pix_key"];
  const BOOL_COLS = ["is_published", "show_story", "show_gallery", "show_timeline",
    "show_location", "show_dresscode", "show_gifts", "show_rsvp", "show_messages",
    "show_godparents", "show_parents", "show_accommodations"];

  const sets: string[] = [];
  const values: unknown[] = [];
  for (const col of TEXT_COLS) {
    if (body[col] === undefined) continue;
    sets.push(`${col} = ?`);
    values.push(body[col] || null);
  }
  for (const col of BOOL_COLS) {
    if (body[col] === undefined) continue;
    sets.push(`${col} = ?`);
    const v = body[col];
    values.push(!(v === 0 || v === false || v === "0" || v === "false"));
  }
  if (sets.length === 0) return c.json({ success: true });

  sets.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);
  const res = await c.env.DB.prepare(
    `UPDATE weddings SET ${sets.join(", ")} WHERE id = ?`,
  ).bind(...values).run();
  if (!res.meta.changes) return c.json({ error: "Couple not found" }, 404);
  return c.json({ success: true });
});

// Issue a temporary password for a user and drop their sessions.
r.post("/api/admin/users/:id/reset-password", adminMiddleware, async (c) => {
  const userId = c.req.param("id");
  const user = await c.env.DB.prepare("SELECT id, email FROM users WHERE id = ?")
    .bind(userId).first<{ id: string; email: string }>();
  if (!user) return c.json({ error: "User not found" }, 404);

  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  const tempPassword = "Et-" + Array.from(bytes, (b) => b.toString(36)).join("").slice(0, 10);
  const hash = await bcrypt.hash(tempPassword, 12);

  await c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(hash, userId).run();
  await c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();

  return c.json({ success: true, email: user.email, tempPassword });
});

export default r;
