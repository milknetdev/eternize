import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { verifyWebhook, WEBHOOK_SIG_HEADER, normalizeStatus } from "../lib/pix/validapay";

const r = new Hono<AppEnv>();

// =====================
// PAYMENT GATEWAY WEBHOOKS  (public — verified by signature, not auth cookie)
// =====================

/** Mark every gift_order whose pix_transaction_id matches `key` as paid. */
async function markPaid(db: any, key: string) {
  await db
    .prepare(
      `UPDATE gift_orders
         SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE pix_transaction_id = ? AND payment_status <> 'paid'`,
    )
    .bind(key)
    .run();
  try {
    await db
      .prepare(
        "UPDATE gift_orders SET couple_amount = amount WHERE pix_transaction_id = ? AND (couple_amount IS NULL OR couple_amount = 0)",
      )
      .bind(key)
      .run();
  } catch {
    /* pre-migration schema — ignore */
  }
}

r.post("/api/webhooks/validapay", async (c) => {
  const raw = await c.req.text();
  const sig = c.req.header(WEBHOOK_SIG_HEADER) || c.req.header("X-Webhook-Signature");

  if (!verifyWebhook(raw, sig)) {
    return c.json({ error: "invalid signature" }, 401);
  }

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    return c.json({ error: "invalid body" }, 400);
  }

  const status = normalizeStatus(body.status ?? (body.event === "payment.success" ? "PAID" : ""));
  // The pix-charge route stored ValidaPay's chargeId in pix_transaction_id.
  // Fall back to externalTxid / metadata for forward-compat.
  const key: string | undefined =
    body?.chargeId || body?.externalTxid || body?.metadata?.checkoutRef;

  if (status === "paid" && key) {
    await markPaid(c.env.DB, String(key));
  }

  // Always 200 for anything we understood — ValidaPay retries non-2xx.
  return c.json({ received: true });
});

export default r;
