import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { verifyWebhook, WEBHOOK_SIG_HEADER, normalizeStatus } from "../lib/pix/validapay";

const r = new Hono<AppEnv>();

// =====================
// PAYMENT GATEWAY WEBHOOKS  (public — verified by signature, not auth cookie)
// =====================

/** Mark every gift_order of a checkout as paid. */
async function markCheckoutPaid(db: any, checkoutRef: string) {
  await db
    .prepare(
      `UPDATE gift_orders
         SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE pix_transaction_id = ? AND payment_status <> 'paid'`,
    )
    .bind(checkoutRef)
    .run();
  try {
    await db
      .prepare(
        "UPDATE gift_orders SET couple_amount = amount WHERE pix_transaction_id = ? AND (couple_amount IS NULL OR couple_amount = 0)",
      )
      .bind(checkoutRef)
      .run();
  } catch {
    /* pre-migration schema — ignore */
  }
}

r.post("/api/webhooks/validapay", async (c) => {
  const raw = await c.req.text();
  const sig = c.req.header(WEBHOOK_SIG_HEADER);

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
  const ref: string | undefined = body?.metadata?.checkoutRef || body?.externalId || body?.metadata?.orderId;

  if (status === "paid" && ref) {
    await markCheckoutPaid(c.env.DB, String(ref));
  }

  // Always 200 for anything we understood — ValidaPay retries non-2xx.
  return c.json({ received: true });
});

export default r;
