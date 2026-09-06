import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * ValidaPay PIX adapter — the only place that knows ValidaPay's HTTP shape.
 * The API spec below is from the public docs draft; adjust these constants once
 * you have the sandbox reference.
 *
 * Config (Vercel env):
 *   VALIDAPAY_TOKEN          — API bearer token (required for checkout to work)
 *   VALIDAPAY_API_URL        — optional, defaults below
 *   VALIDAPAY_WEBHOOK_SECRET — optional; if set, webhook HMAC is verified
 */

const BASE_URL = () =>
  (process.env.VALIDAPAY_API_URL || "https://app.validapay.com.br").replace(/\/+$/, "");
const PATH_CREATE = "/v1/charges/pix";
const PATH_GET = "/v1/charges/:id";
export const WEBHOOK_SIG_HEADER = "x-validapay-signature";

export type PixStatus = "pending" | "paid" | "expired" | "failed";

function normalizeStatus(raw: unknown): PixStatus {
  const s = String(raw || "").toUpperCase();
  if (s === "PAID" || s === "APPROVED" || s === "COMPLETED") return "paid";
  if (s === "EXPIRED") return "expired";
  if (s === "FAILED" || s === "CANCELED" || s === "CANCELLED" || s === "REFUSED") return "failed";
  return "pending";
}

export function isConfigured(): boolean {
  return !!process.env.VALIDAPAY_TOKEN;
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.VALIDAPAY_TOKEN || ""}`,
  };
}

export interface CreateChargeInput {
  amountCents: number;
  checkoutRef: string;
  description: string;
  customer: { name: string; email?: string | null; document?: string | null };
  /** seconds until the QR expires */
  expiration?: number;
}

export interface PixCharge {
  chargeId: string;
  emv: string;
  qrCode: string; // data: URL
  status: PixStatus;
  expiresAt: string | null;
}

function readCharge(j: any): PixCharge {
  return {
    chargeId: String(j.chargeId ?? j.id ?? j.charge_id ?? ""),
    emv: String(j.emv ?? j.pixCopiaECola ?? j.copyPaste ?? j.brcode ?? ""),
    qrCode: String(j.qrCode ?? j.qrcode ?? j.qr_code_image ?? j.qrCodeImage ?? ""),
    status: normalizeStatus(j.status),
    expiresAt: j.expiresAt ?? j.expiration_date ?? null,
  };
}

export async function createPixCharge(input: CreateChargeInput): Promise<PixCharge> {
  const body = {
    amount: Math.round(input.amountCents),
    externalId: input.checkoutRef,
    expiration: input.expiration ?? 1800,
    description: input.description,
    customer: {
      name: input.customer.name,
      email: input.customer.email || undefined,
      documentNumber: input.customer.document || undefined,
    },
    metadata: { checkoutRef: input.checkoutRef },
  };

  const res = await fetch(`${BASE_URL()}${PATH_CREATE}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    // Idempotency: a charge for this externalId already exists — fetch it.
    const dup = (await res.json().catch(() => ({}))) as any;
    const id = dup?.chargeId ?? dup?.id;
    if (id) return getCharge(String(id));
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay create charge ${res.status}: ${text.slice(0, 300)}`);
  }
  return readCharge(await res.json());
}

export async function getCharge(chargeId: string): Promise<PixCharge> {
  const res = await fetch(`${BASE_URL()}${PATH_GET.replace(":id", encodeURIComponent(chargeId))}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay get charge ${res.status}: ${text.slice(0, 300)}`);
  }
  return readCharge(await res.json());
}

/**
 * Verifies the webhook HMAC. If VALIDAPAY_WEBHOOK_SECRET is unset we accept the
 * request (and warn) so the integration can be brought up in stages.
 */
export function verifyWebhook(rawBody: string, signatureHeader: string | null | undefined): boolean {
  const secret = process.env.VALIDAPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[validapay] VALIDAPAY_WEBHOOK_SECRET not set — webhook signature not verified");
    return true;
  }
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const got = signatureHeader.replace(/^sha256=/, "").trim();
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(got, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export { normalizeStatus };
