import { describe, it, expect, beforeEach, afterEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

let fx: Fixture;
let env: Record<string, unknown>;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  delete process.env.VALIDAPAY_TOKEN;
  delete process.env.VALIDAPAY_WEBHOOK_SECRET;
  fx = await makeFixture();
  env = { DB: fx.db } as unknown as Record<string, unknown>;
});

afterEach(() => {
  delete process.env.VALIDAPAY_TOKEN;
  delete process.env.VALIDAPAY_WEBHOOK_SECRET;
});

const json = (r: Response) => r.json() as Promise<any>;
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  app.request(
    path,
    { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) },
    env,
  );

const seedOrder = (ref: string, amount = 100) =>
  fx.db
    .prepare(
      "INSERT INTO gift_orders (wedding_id, gift_id, guest_name, amount, couple_amount, pix_transaction_id, payment_status) VALUES (?, 1, 'X', ?, ?, ?, 'pending')",
    )
    .bind(fx.weddingA, amount, amount, ref)
    .run();

describe("POST /api/public/pix-charge", () => {
  it("returns 503 { configured: false } when VALIDAPAY_TOKEN is unset", async () => {
    const res = await post("/api/public/pix-charge", { checkout_ref: "chk-1", amount: 50 });
    expect(res.status).toBe(503);
    expect((await json(res)).configured).toBe(false);
  });
});

describe("POST /api/webhooks/validapay", () => {
  it("marks every order of the checkout paid on payment.success", async () => {
    await seedOrder("chk-abc", 200);
    await seedOrder("chk-abc", 80);

    const res = await post("/api/webhooks/validapay", {
      event: "payment.success",
      status: "PAID",
      metadata: { checkoutRef: "chk-abc" },
    });
    expect(res.status).toBe(200);

    const { results } = await fx.db
      .prepare("SELECT payment_status, couple_amount FROM gift_orders WHERE pix_transaction_id = 'chk-abc'")
      .all<{ payment_status: string; couple_amount: number }>();
    expect(results.length).toBe(2);
    expect(results.every((r) => r.payment_status === "paid")).toBe(true);
  });

  it("rejects a bad signature when VALIDAPAY_WEBHOOK_SECRET is set", async () => {
    process.env.VALIDAPAY_WEBHOOK_SECRET = "shhh";
    await seedOrder("chk-sig");
    const res = await post(
      "/api/webhooks/validapay",
      { event: "payment.success", status: "PAID", metadata: { checkoutRef: "chk-sig" } },
      { "x-validapay-signature": "sha256=deadbeef" },
    );
    expect(res.status).toBe(401);

    const row = await fx.db
      .prepare("SELECT payment_status FROM gift_orders WHERE pix_transaction_id = 'chk-sig'")
      .first<{ payment_status: string }>();
    expect(row?.payment_status).toBe("pending");
  });

  it("ignores non-payment events", async () => {
    const res = await post("/api/webhooks/validapay", { event: "charge.created" });
    expect(res.status).toBe(200);
  });
});

describe("GET /api/public/checkout-status/:ref", () => {
  it("is paid only once every order of the ref is paid", async () => {
    await seedOrder("chk-x", 100);
    await seedOrder("chk-x", 100);

    let s = await json(await app.request("/api/public/checkout-status/chk-x", {}, env));
    expect(s).toMatchObject({ paid: false, total: 2 });

    await fx.db.prepare("UPDATE gift_orders SET payment_status = 'paid' WHERE pix_transaction_id = 'chk-x'").run();
    s = await json(await app.request("/api/public/checkout-status/chk-x", {}, env));
    expect(s.paid).toBe(true);
  });
});
