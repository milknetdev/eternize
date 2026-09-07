import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * ValidaPay PIX adapter — the only place that knows ValidaPay's HTTP shape.
 * Spec: https://docs.validapay.com.br (llms-full.txt).
 *
 * Config (Vercel env):
 *   VALIDAPAY_CLIENT_ID / VALIDAPAY_CLIENT_SECRET  — OAuth2 client_credentials (required)
 *   VALIDAPAY_TOKEN          — OR a ready static bearer token (overrides OAuth)
 *   VALIDAPAY_OAUTH_URL      — token endpoint. Default = production. For sandbox set
 *                              https://oauth2-sandbox.validapay.com.br/auth/token
 *   VALIDAPAY_API_URL        — charge API base. Default = production
 *                              (https://api.validapay.com.br). Sandbox:
 *                              https://sandbox.validapay.com.br
 *   VALIDAPAY_SCOPE          — OAuth scope. Default "pix.cob/write"
 *   VALIDAPAY_WEBHOOK_SECRET — secret to verify the X-Webhook-Signature HMAC
 */

const OAUTH_URL = () =>
  process.env.VALIDAPAY_OAUTH_URL || "https://oauth2.validapay.com.br/auth/token";
const BASE_URL = () =>
  (process.env.VALIDAPAY_API_URL || "https://api.validapay.com.br").replace(/\/+$/, "");
const SCOPE = () => process.env.VALIDAPAY_SCOPE || "pix.cob/write";
const PATH_CREATE = "/v1/charges/pix";
const PATH_GET = "/v1/charges/:id";
export const WEBHOOK_SIG_HEADER = "x-webhook-signature";

export type PixStatus = "pending" | "paid" | "expired" | "failed";

function normalizeStatus(raw: unknown): PixStatus {
  const s = String(raw || "").toUpperCase();
  if (s === "PAID" || s === "APPROVED" || s === "COMPLETED" || s === "SUCCESS") return "paid";
  if (s === "EXPIRED") return "expired";
  if (s === "FAILED" || s === "CANCELED" || s === "CANCELLED" || s === "REFUSED") return "failed";
  return "pending";
}

export function isConfigured(): boolean {
  return (
    !!process.env.VALIDAPAY_TOKEN ||
    (!!process.env.VALIDAPAY_CLIENT_ID && !!process.env.VALIDAPAY_CLIENT_SECRET)
  );
}

// Cached OAuth token (module scope survives warm serverless invocations).
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (process.env.VALIDAPAY_TOKEN) return process.env.VALIDAPAY_TOKEN;

  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.value;
  }

  const res = await fetch(OAUTH_URL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.VALIDAPAY_CLIENT_ID || "",
      client_secret: process.env.VALIDAPAY_CLIENT_SECRET || "",
      scope: SCOPE(),
    }).toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay auth ${res.status} @ ${OAUTH_URL()}: ${text.slice(0, 300)}`);
  }
  const j = (await res.json()) as any;
  const value = String(j.access_token ?? j.token ?? "");
  if (!value) throw new Error("ValidaPay auth: no access_token in response");
  const ttlSec = Number(j.expires_in ?? 3600) || 3600;
  cachedToken = { value, expiresAt: Date.now() + ttlSec * 1000 };
  return value;
}

async function authHeaders(): Promise<Record<string, string>> {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${await getAccessToken()}`,
  };
}

export interface CreateChargeInput {
  /** amount in BRL (e.g. 50.00) — ValidaPay wants reais, not cents */
  amount: number;
  checkoutRef: string;
  customer: { name: string; email?: string | null; document?: string | null };
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
    chargeId: String(j.chargeId ?? j.id ?? ""),
    emv: String(j.emv ?? j.pixCopiaECola ?? j.brcode ?? ""),
    qrCode: String(j.qrCode ?? j.qrcode ?? ""),
    status: normalizeStatus(j.status ?? "PENDING"),
    expiresAt: j.expiresAt ?? j.expiration ?? null,
  };
}

export async function createPixCharge(input: CreateChargeInput): Promise<PixCharge> {
  const body: Record<string, unknown> = {
    amount: Math.round(input.amount * 100) / 100,
    externalTxid: input.checkoutRef,
  };
  // Immediate charge (COB): ValidaPay only accepts `customer.name`/`cep` together
  // with an `expiration` (that turns it into a COBV and makes the whole
  // documentNumber+name+cep trio mandatory). For phase 1 we keep it a plain COB,
  // so we send only the payer's document (CPF) and email when provided.
  const doc = (input.customer.document || "").replace(/\D/g, "");
  const email = input.customer.email || "";
  if (doc || email) {
    body.customer = {
      ...(doc ? { documentNumber: doc } : {}),
      ...(email ? { email } : {}),
    };
  }

  const res = await fetch(`${BASE_URL()}${PATH_CREATE}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });

  if (res.status === 409) {
    const dup = (await res.json().catch(() => ({}))) as any;
    const id = dup?.chargeId ?? dup?.id;
    if (id) return getCharge(String(id));
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay create charge ${res.status} @ ${PATH_CREATE}: ${text.slice(0, 300)}`);
  }
  return readCharge(await res.json());
}

export async function getCharge(chargeId: string): Promise<PixCharge> {
  const res = await fetch(`${BASE_URL()}${PATH_GET.replace(":id", encodeURIComponent(chargeId))}`, {
    headers: await authHeaders(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay get charge ${res.status}: ${text.slice(0, 300)}`);
  }
  return readCharge(await res.json());
}

/**
 * Verifies the webhook signature.
 * Header: `X-Webhook-Signature: t=<ms>,v1=<hex>`
 * Signed value: HMAC_SHA256(secret, "<t>.<rawBody>")
 * If no secret is configured we accept (and warn) so it can be enabled later.
 */
export function verifyWebhook(rawBody: string, signatureHeader: string | null | undefined): boolean {
  const secret = process.env.VALIDAPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[validapay] VALIDAPAY_WEBHOOK_SECRET not set — webhook signature not verified");
    return true;
  }
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = parts["t"];
  const v1 = parts["v1"] || signatureHeader.replace(/^sha256=/, "").trim();
  if (!v1) return false;

  const signed = t ? `${t}.${rawBody}` : rawBody;
  const expected = createHmac("sha256", secret).update(signed, "utf8").digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export { normalizeStatus };
