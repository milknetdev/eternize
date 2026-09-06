import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * ValidaPay PIX adapter — the only place that knows ValidaPay's HTTP shape.
 * The API spec below is from the public docs draft; adjust these constants once
 * you have the sandbox reference.
 *
 * Config (Vercel env):
 *   VALIDAPAY_CLIENT_ID / VALIDAPAY_CLIENT_SECRET  — OAuth2 client_credentials (preferred)
 *   VALIDAPAY_TOKEN          — OR a ready static bearer token (overrides OAuth)
 *   VALIDAPAY_API_URL        — optional, defaults below
 *   VALIDAPAY_WEBHOOK_SECRET — optional; if set, webhook HMAC is verified
 */

const BASE_URL = () =>
  (process.env.VALIDAPAY_API_URL || "https://app.validapay.com.br").replace(/\/+$/, "");
// Best guesses — overridable per-env so we don't need a redeploy to adjust.
const PATH_TOKEN = process.env.VALIDAPAY_TOKEN_PATH || "/auth/token";
const PATH_CREATE = process.env.VALIDAPAY_CHARGE_PATH || "/v1/charges/pix";
const PATH_GET = process.env.VALIDAPAY_CHARGE_GET_PATH || "/v1/charges/:id";
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

  const url = `${BASE_URL()}${PATH_TOKEN}`;
  const creds = {
    grant_type: "client_credentials",
    client_id: process.env.VALIDAPAY_CLIENT_ID || "",
    client_secret: process.env.VALIDAPAY_CLIENT_SECRET || "",
  };

  // Try JSON first, then form-urlencoded — providers differ.
  let res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(creds),
  });
  if (!res.ok && (res.status === 400 || res.status === 415 || res.status === 422)) {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams(creds).toString(),
    });
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ValidaPay auth ${res.status} @ ${PATH_TOKEN}: ${text.slice(0, 300)}`);
  }
  const j = (await res.json()) as any;
  const value = String(j.access_token ?? j.token ?? j.accessToken ?? "");
  if (!value) throw new Error("ValidaPay auth: no token in response");
  const ttlSec = Number(j.expires_in ?? j.expiresIn ?? 3600) || 3600;
  cachedToken = { value, expiresAt: Date.now() + ttlSec * 1000 };
  return value;
}

async function authHeaders(): Promise<Record<string, string>> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await getAccessToken()}`,
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

  const headers = await authHeaders();
  const paths = [PATH_CREATE, "/v1/charges", "/v1/pix/charges", "/charges/pix"].filter(
    (p, i, a) => a.indexOf(p) === i,
  );

  let res: Response | null = null;
  let lastText = "";
  for (const path of paths) {
    res = await fetch(`${BASE_URL()}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(path === "/v1/charges" ? { ...body, type: "pix", method: "pix" } : body),
    });
    if (res.status === 409) {
      const dup = (await res.json().catch(() => ({}))) as any;
      const id = dup?.chargeId ?? dup?.id;
      if (id) return getCharge(String(id));
    }
    if (res.ok) return readCharge(await res.json());
    lastText = await res.text().catch(() => "");
    if (res.status !== 404) break; // only fall through on "wrong path"
  }
  throw new Error(`ValidaPay create charge ${res?.status} @ ${paths[0]}: ${lastText.slice(0, 300)}`);
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
 * Verifies the webhook HMAC. Uses VALIDAPAY_WEBHOOK_SECRET if set, otherwise
 * falls back to the client secret (a common signing key). If neither exists we
 * accept the request (and warn) so the integration can be brought up in stages.
 */
export function verifyWebhook(rawBody: string, signatureHeader: string | null | undefined): boolean {
  const secret = process.env.VALIDAPAY_WEBHOOK_SECRET || process.env.VALIDAPAY_CLIENT_SECRET;
  if (!secret) {
    console.warn("[validapay] no webhook secret — signature not verified");
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
