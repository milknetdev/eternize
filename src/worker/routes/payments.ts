import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { sumOrders } from "./platform";
import { isConfigured, createPixCharge, getCharge } from "../lib/pix/validapay";

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

// Couple confirms (or un-confirms) that a gift payment landed. Payment is manual
// PIX, so nothing flips a pending order to "paid" automatically — this is it.
r.put("/api/gift-orders/:id/status", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first<{ id: number }>();
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  const body = await c.req.json().catch(() => ({}));
  const paid = !!body.paid;

  // Only the pending<->paid toggle; never touch an order already converted to PIX.
  const res = await c.env.DB.prepare(`
    UPDATE gift_orders
    SET payment_status = ?, paid_at = ${paid ? "CURRENT_TIMESTAMP" : "NULL"}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ? AND is_converted = FALSE
  `).bind(paid ? "paid" : "pending", id, wedding.id).run();

  if (!res.meta.changes) return c.json({ error: "Pedido não encontrado" }, 404);

  // Defensive: make sure the couple's net share is set for legacy rows.
  if (paid) {
    try {
      await c.env.DB.prepare(
        "UPDATE gift_orders SET couple_amount = amount WHERE id = ? AND (couple_amount IS NULL OR couple_amount = 0)"
      ).bind(id).run();
    } catch { /* pre-migration schema — ignore */ }
  }

  return c.json({ success: true, paid });
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

  // Balances are the couple's NET share (gift value minus the platform commission).
  // sumOrders() tolerates a DB where the monetization migration hasn't run yet.
  const availableBalance = await sumOrders(
    c, "couple_amount",
    "wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE",
    [wedding.id], "amount",
  );
  const convertedTotal = await sumOrders(
    c, "couple_amount",
    "wedding_id = ? AND payment_status = 'paid' AND is_converted = TRUE",
    [wedding.id], "amount",
  );
  const serviceFeesTotal = await sumOrders(
    c, "commission_amount",
    "wedding_id = ? AND payment_status = 'paid'",
    [wedding.id], null,
  );

  const pending = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM cash_withdrawals WHERE wedding_id = ? AND status = 'pending'"
  ).bind(wedding.id).first<{ total: number }>();

  return c.json({
    availableBalance,
    convertedTotal,
    pendingWithdrawal: pending?.total || 0,
    serviceFeesTotal,
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

  // Check available balance (couple's net share)
  const availableTotal = await sumOrders(
    c, "couple_amount",
    "wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE",
    [wedding.id], "amount",
  );

  if (!availableTotal || amount > availableTotal) {
    return c.json({ error: "Insufficient balance" }, 400);
  }

  // Create withdrawal request
  const result = await c.env.DB.prepare(`
    INSERT INTO cash_withdrawals (wedding_id, amount, pix_key, pix_key_type, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(wedding.id, amount, pixKey, pixKeyType).run();

  // Mark orders as converted (up to the withdrawal amount, by couple share).
  // Fall back to `amount` if the split columns aren't in the DB yet.
  let ordersToConvert: { results: { id: number; share: number }[] };
  try {
    ordersToConvert = await c.env.DB.prepare(`
      SELECT id, couple_amount AS share FROM gift_orders
      WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE
      ORDER BY created_at ASC
    `).bind(wedding.id).all<{ id: number; share: number }>();
  } catch {
    ordersToConvert = await c.env.DB.prepare(`
      SELECT id, amount AS share FROM gift_orders
      WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE
      ORDER BY created_at ASC
    `).bind(wedding.id).all<{ id: number; share: number }>();
  }

  let remaining = amount;
  for (const order of ordersToConvert.results || []) {
    if (remaining <= 0) break;
    await c.env.DB.prepare(`
      UPDATE gift_orders SET is_converted = TRUE, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(order.id).run();
    remaining -= Number(order.share) || 0;
  }

  return c.json({ success: true, withdrawalId: result.meta?.last_row_id });
});

// =====================
// PUBLIC — PIX CHARGE (ValidaPay)
// =====================

// TEMP diagnostic: end-to-end check against ValidaPay. Open in a browser:
// /api/public/pix-debug?probe=1  → tries auth, then a R$1 charge. No secrets out.
r.get("/api/public/pix-debug", async (c) => {
  if (c.req.query("probe") !== "1") return c.json({ error: "add ?probe=1" }, 400);
  const out: any = {
    configured: isConfigured(),
    oauthUrl: process.env.VALIDAPAY_OAUTH_URL || "https://oauth2.validapay.com.br/auth/token",
    apiUrl: process.env.VALIDAPAY_API_URL || "https://api.validapay.com.br",
    scope: process.env.VALIDAPAY_SCOPE || "pix.cob/write",
  };
  try {
    const ref = `probe-${Date.now()}`;
    const charge = await createPixCharge({
      amount: 1,
      checkoutRef: ref,
      customer: { name: "Teste Eternize" },
    });
    out.result = "OK";
    out.chargeId = charge.chargeId;
    out.hasEmv = !!charge.emv;
    out.hasQrCode = !!charge.qrCode;
  } catch (err) {
    out.result = "ERRO";
    out.detail = String((err as any)?.message || err).slice(0, 600);
  }
  return c.json(out);
});

// Create one PIX charge for a whole checkout. The gift_orders must already exist
// (created via /api/public/gift-order with the same checkout_ref).
r.post("/api/public/pix-charge", async (c) => {
  if (!isConfigured()) {
    return c.json({ configured: false, error: "Gateway de pagamento não configurado" }, 503);
  }
  const body = await c.req.json().catch(() => ({} as any));
  const ref = String(body.checkout_ref || "").trim();
  const amount = Number(body.amount) || 0;
  if (!ref || amount <= 0) return c.json({ error: "Dados inválidos" }, 400);

  try {
    const charge = await createPixCharge({
      amount,
      checkoutRef: ref,
      customer: {
        name: String(body.customer?.name || "Convidado"),
        email: body.customer?.email || null,
        document: (body.customer?.document || "").replace(/\D/g, "") || null,
      },
    });
    // remember the gateway id on the order rows (best-effort)
    if (charge.chargeId) {
      try {
        await c.env.DB.prepare(
          "UPDATE gift_orders SET pix_transaction_id = ? WHERE pix_transaction_id = ?",
        ).bind(charge.chargeId, ref).run();
      } catch { /* ignore */ }
    }
    return c.json({
      configured: true,
      chargeId: charge.chargeId,
      emv: charge.emv,
      qrCode: charge.qrCode,
      expiresAt: charge.expiresAt,
      // the client keeps polling by chargeId when we swapped the ref
      ref: charge.chargeId || ref,
    });
  } catch (err) {
    console.error("pix-charge failed:", err);
    return c.json(
      {
        error: "Não foi possível gerar o PIX.",
        detail: String((err as any)?.message || err).slice(0, 500),
      },
      502,
    );
  }
});

// Poll: is this checkout paid yet?
r.get("/api/public/checkout-status/:ref", async (c) => {
  const ref = c.req.param("ref");
  const row = await c.env.DB.prepare(
    "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE payment_status = 'paid') AS paid FROM gift_orders WHERE pix_transaction_id = ?",
  ).bind(ref).first<{ total: number; paid: number }>();

  const total = Number(row?.total) || 0;
  let paidCount = Number(row?.paid) || 0;

  // Safety net if the webhook was missed: reconcile with the gateway on demand.
  if (total > 0 && paidCount < total && c.req.query("reconcile") === "1" && isConfigured()) {
    try {
      const charge = await getCharge(ref);
      if (charge.status === "paid") {
        await c.env.DB.prepare(
          `UPDATE gift_orders SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE pix_transaction_id = ? AND payment_status <> 'paid'`,
        ).bind(ref).run();
        paidCount = total;
      }
    } catch (e) {
      console.error("reconcile failed:", e);
    }
  }

  return c.json({ paid: total > 0 && paidCount >= total, total, paidCount });
});

export default r;
