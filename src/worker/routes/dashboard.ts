import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// DASHBOARD STATS
// =====================

r.get("/api/dashboard/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) {
    return c.json({
      totalGuests: 0,
      confirmedGuests: 0,
      totalGifts: 0,
      totalMessages: 0,
      totalAmount: 0,
    });
  }

  // Count guests from guests table
  const guestsCount = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_confirmed = TRUE THEN 1 ELSE 0 END) as confirmed
    FROM guests WHERE wedding_id = ?
  `).bind(wedding.id).first<{ total: number; confirmed: number }>();

  // Count companions from guest_companions table
  const companionsCount = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN gc.is_confirmed = TRUE THEN 1 ELSE 0 END) as confirmed
    FROM guest_companions gc
    INNER JOIN guests g ON gc.guest_id = g.id
    WHERE g.wedding_id = ?
  `).bind(wedding.id).first<{ total: number; confirmed: number }>();

  const guestsStats = {
    total: (guestsCount?.total || 0) + (companionsCount?.total || 0),
    confirmed: (guestsCount?.confirmed || 0) + (companionsCount?.confirmed || 0)
  };

  const giftsCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_gifts WHERE wedding_id = ?"
  ).bind(wedding.id).first();

  const messagesCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guest_messages WHERE wedding_id = ?"
  ).bind(wedding.id).first();

  const ordersSum = await c.env.DB.prepare(
    "SELECT SUM(couple_amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid'"
  ).bind(wedding.id).first();

  return c.json({
    totalGuests: guestsStats?.total || 0,
    confirmedGuests: guestsStats?.confirmed || 0,
    totalGifts: giftsCount?.count || 0,
    totalMessages: messagesCount?.count || 0,
    totalAmount: ordersSum?.total || 0,
  });
});

export default r;
