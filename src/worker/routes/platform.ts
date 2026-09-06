import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { adminMiddleware } from "../lib/admin";

const r = new Hono<AppEnv>();

// =====================
// PLATFORM MONETIZATION
//  - commission % on gift purchases
//  - paid gift-card tiers (100% to the platform)
//  - flat maintenance fee per checkout (100% to the platform)
// Everything is a bookkeeping ledger; payment stays manual PIX.
// =====================

const DEFAULTS = { commission_pct: 2, maintenance_fee: 12 };

async function readSettings(c: any): Promise<{ commission_pct: number; maintenance_fee: number }> {
  try {
    const row = (await c.env.DB.prepare(
      "SELECT commission_pct, maintenance_fee FROM platform_settings WHERE id = 1"
    ).first()) as { commission_pct: number; maintenance_fee: number } | null;
    if (row) {
      return {
        commission_pct: Number(row.commission_pct) || 0,
        maintenance_fee: Number(row.maintenance_fee) || 0,
      };
    }
  } catch {
    /* table may not exist yet — fall through to defaults */
  }
  return { ...DEFAULTS };
}

/**
 * SUM a gift_orders money column, tolerating a database where the monetization
 * migration hasn't run yet (the split columns don't exist). Falls back to
 * `fallback` (or 0 when null).
 */
export async function sumOrders(
  c: any,
  column: string,
  where: string,
  binds: unknown[],
  fallback: string | null,
): Promise<number> {
  const run = async (col: string) => {
    const row = (await c.env.DB.prepare(
      `SELECT COALESCE(SUM(${col}), 0) AS total FROM gift_orders WHERE ${where}`,
    )
      .bind(...binds)
      .first()) as { total: number } | null;
    return Number(row?.total) || 0;
  };
  try {
    return await run(column);
  } catch {
    return fallback ? run(fallback) : 0;
  }
}

/** Shared by the gift-order route to compute the split for one line item. */
export async function computeSplit(
  c: any,
  amount: number,
  cardPrice: number,
  applyMaintenanceFee: boolean,
) {
  const { commission_pct, maintenance_fee } = await readSettings(c);
  const gift = Number(amount) || 0;
  const card = Number(cardPrice) || 0;
  const fee = applyMaintenanceFee ? maintenance_fee : 0;
  const commission_amount = Math.round(gift * commission_pct) / 100;
  const platform_amount = Math.round((commission_amount + card + fee) * 100) / 100;
  const couple_amount = Math.round((gift - commission_amount) * 100) / 100;
  return { commission_pct, maintenance_fee: fee, commission_amount, platform_amount, couple_amount };
}

// ── Public: config for the checkout page ───────────────────────────────
r.get("/api/public/platform-config", async (c) => {
  const settings = await readSettings(c);
  let cardOptions: unknown[] = [];
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, name, price, description FROM gift_card_options WHERE is_active = TRUE ORDER BY sort_order, id"
    ).all();
    cardOptions = results || [];
  } catch {
    /* table missing — checkout falls back to a single free card */
  }
  if (cardOptions.length === 0) {
    cardOptions = [{ id: 0, name: "Grátis", price: 0, description: "Cartão simples com seu nome e mensagem" }];
  }
  return c.json({
    commissionPct: settings.commission_pct,
    maintenanceFee: settings.maintenance_fee,
    cardOptions,
  });
});

// ── Admin: settings ───────────────────────────────────────────────────
r.get("/api/admin/platform/settings", adminMiddleware, async (c) => {
  return c.json(await readSettings(c));
});

r.put("/api/admin/platform/settings", adminMiddleware, async (c) => {
  const body = await c.req.json();
  const commission = Math.max(0, Math.min(100, Number(body.commission_pct) || 0));
  const fee = Math.max(0, Number(body.maintenance_fee) || 0);
  try {
    await c.env.DB.prepare(`
      INSERT INTO platform_settings (id, commission_pct, maintenance_fee, updated_at)
      VALUES (1, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        commission_pct = EXCLUDED.commission_pct,
        maintenance_fee = EXCLUDED.maintenance_fee,
        updated_at = CURRENT_TIMESTAMP
    `).bind(commission, fee).run();
  } catch {
    return c.json({ error: "Rode a migração de monetização no banco antes de configurar." }, 503);
  }
  return c.json({ success: true, commission_pct: commission, maintenance_fee: fee });
});

// ── Admin: gift-card tiers CRUD ───────────────────────────────────────
r.get("/api/admin/platform/cards", adminMiddleware, async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM gift_card_options ORDER BY sort_order, id"
    ).all();
    return c.json({ cards: results || [] });
  } catch {
    return c.json({ cards: [] });
  }
});

r.post("/api/admin/platform/cards", adminMiddleware, async (c) => {
  const body = await c.req.json();
  if (!body.name?.trim()) return c.json({ error: "Nome obrigatório" }, 400);
  try {
  const max = await c.env.DB.prepare(
    "SELECT COALESCE(MAX(sort_order), -1) AS m FROM gift_card_options"
  ).first<{ m: number }>();
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_card_options (name, price, description, sort_order, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    body.name.trim(),
    Math.max(0, Number(body.price) || 0),
    body.description || null,
    (max?.m ?? -1) + 1,
    body.is_active === false ? false : true,
  ).run();
  return c.json({ success: true, id: result.meta.last_row_id });
  } catch {
    return c.json({ error: "Rode a migração de monetização no banco antes de gerenciar cartões." }, 503);
  }
});

r.put("/api/admin/platform/cards/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const res = await c.env.DB.prepare(`
    UPDATE gift_card_options SET
      name = ?, price = ?, description = ?, sort_order = ?, is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name,
    Math.max(0, Number(body.price) || 0),
    body.description || null,
    Number(body.sort_order) || 0,
    body.is_active === false ? false : true,
    id,
  ).run();
  if (!res.meta.changes) return c.json({ error: "Cartão não encontrado" }, 404);
  return c.json({ success: true });
});

r.delete("/api/admin/platform/cards/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const res = await c.env.DB.prepare(
    "DELETE FROM gift_card_options WHERE id = ?"
  ).bind(id).run();
  if (!res.meta.changes) return c.json({ error: "Cartão não encontrado" }, 404);
  return c.json({ success: true });
});

// ── Admin: revenue summary ───────────────────────────────────────────
r.get("/api/admin/platform/revenue", adminMiddleware, async (c) => {
  let row: Record<string, number> | null = null;
  try {
    row = await c.env.DB.prepare(`
      SELECT
        COUNT(*)                          AS order_count,
        COALESCE(SUM(commission_amount),0) AS commission_total,
        COALESCE(SUM(card_price),0)        AS card_total,
        COALESCE(SUM(maintenance_fee),0)   AS fee_total,
        COALESCE(SUM(platform_amount),0)   AS platform_total,
        COALESCE(SUM(couple_amount),0)     AS couple_total,
        COALESCE(SUM(amount),0)            AS gross_total
      FROM gift_orders
      WHERE payment_status = 'paid'
    `).first<Record<string, number>>();
  } catch {
    row = null;
  }
  return c.json({
    orderCount: row?.order_count || 0,
    commissionTotal: row?.commission_total || 0,
    cardTotal: row?.card_total || 0,
    feeTotal: row?.fee_total || 0,
    platformTotal: row?.platform_total || 0,
    coupleTotal: row?.couple_total || 0,
    grossTotal: row?.gross_total || 0,
  });
});

export default r;
