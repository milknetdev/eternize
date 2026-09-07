import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { sumOrders } from "./platform";

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

  // A guest counts as confirmed via the public RSVP flow (is_confirmed) OR when
  // the couple flips their status in the dashboard (rsvp_status).
  const guestsCount = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN is_confirmed = TRUE OR rsvp_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed
    FROM guests WHERE wedding_id = ?
  `).bind(wedding.id).first<{ total: number; confirmed: number }>();

  // A companion only counts as confirmed when its guest actually confirmed AND
  // that companion was ticked on the RSVP — never on a stale default.
  const companionsCount = await c.env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN gc.is_confirmed = TRUE AND g.is_confirmed = TRUE THEN 1 ELSE 0 END) as confirmed
    FROM guest_companions gc
    INNER JOIN guests g ON gc.guest_id = g.id
    WHERE g.wedding_id = ?
  `).bind(wedding.id).first<{ total: number; confirmed: number }>();

  // Postgres COUNT()/SUM() come back as bigint -> JS strings via the Neon driver.
  // Without Number() the "+" below concatenates ("1" + "6" = "16").
  const n = (v: unknown) => Number(v) || 0;
  const guestsStats = {
    total: n(guestsCount?.total) + n(companionsCount?.total),
    confirmed: n(guestsCount?.confirmed) + n(companionsCount?.confirmed),
  };

  const giftsCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_gifts WHERE wedding_id = ?"
  ).bind(wedding.id).first<{ count: number }>();

  const messagesCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guest_messages WHERE wedding_id = ?"
  ).bind(wedding.id).first<{ count: number }>();

  const totalAmount = await sumOrders(
    c,
    "couple_amount",
    "wedding_id = ? AND payment_status = 'paid'",
    [wedding.id],
    "amount",
  );

  return c.json({
    totalGuests: guestsStats.total,
    confirmedGuests: guestsStats.confirmed,
    totalGifts: n(giftsCount?.count),
    totalMessages: n(messagesCount?.count),
    totalAmount,
  });
});

export default r;
