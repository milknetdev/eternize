import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, adminCookie, type Fixture } from "./helpers";

let fx: Fixture;
let env: Record<string, unknown>;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  fx = await makeFixture();
  env = { DB: fx.db } as unknown as Record<string, unknown>;
});

const json = (r: Response) => r.json() as Promise<any>;

const giftOrder = (body: unknown) =>
  app.request(
    "/api/public/gift-order",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    env,
  );

// PGlite's run() doesn't surface last_row_id without RETURNING, so read the newest row.
const lastOrder = () =>
  fx.db
    .prepare("SELECT * FROM gift_orders WHERE wedding_id = ? ORDER BY id DESC LIMIT 1")
    .bind(fx.weddingA)
    .first<Record<string, number>>();

describe("gift-order split (bookkeeping ledger)", () => {
  it("records commission, platform and couple amounts from platform_settings", async () => {
    // defaults seeded by helpers: 2% commission, R$12 fee
    const res = await giftOrder({
      wedding_id: fx.weddingA,
      gift_id: 1,
      guest_name: "Fulano",
      amount: 200,
      card_price: 15.5,
      apply_maintenance_fee: true,
    });
    expect(res.status).toBe(200);

    const row = await lastOrder();
    expect(row!.commission_pct).toBe(2);
    expect(row!.commission_amount).toBeCloseTo(4, 2); // 2% of 200
    expect(row!.maintenance_fee).toBe(12);
    expect(row!.platform_amount).toBeCloseTo(4 + 15.5 + 12, 2); // commission + card + fee
    expect(row!.couple_amount).toBeCloseTo(196, 2); // 200 - commission
  });

  it("omits the maintenance fee when apply_maintenance_fee is falsy", async () => {
    await giftOrder({ wedding_id: fx.weddingA, gift_id: 1, guest_name: "Beltrano", amount: 100 });
    const row = await lastOrder();
    expect(row!.maintenance_fee).toBe(0);
    expect(row!.platform_amount).toBeCloseTo(2, 2); // just the 2% commission
    expect(row!.couple_amount).toBeCloseTo(98, 2);
  });
});

describe("admin platform settings + public config", () => {
  it("persists new settings and reflects them in the public config", async () => {
    const cookie = await adminCookie(app as never, env);

    const put = await app.request(
      "/api/admin/platform/settings",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ commission_pct: 3.5, maintenance_fee: 10 }),
      },
      env,
    );
    expect(put.status).toBe(200);

    const cfg = await json(await app.request("/api/public/platform-config", {}, env));
    expect(cfg.commissionPct).toBe(3.5);
    expect(cfg.maintenanceFee).toBe(10);

    // and a subsequent order uses the new percentage
    await giftOrder({ wedding_id: fx.weddingA, gift_id: 1, guest_name: "X", amount: 100 });
    const row = await lastOrder();
    expect(row!.commission_amount).toBeCloseTo(3.5, 2);
  });

  it("public config only lists active card options", async () => {
    const cookie = await adminCookie(app as never, env);
    const create = await app.request(
      "/api/admin/platform/cards",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ name: "Oculto", price: 9, is_active: false }),
      },
      env,
    );
    expect(create.status).toBe(200);

    const cfg = await json(await app.request("/api/public/platform-config", {}, env));
    expect(cfg.cardOptions.some((o: any) => o.name === "Oculto")).toBe(false);
    expect(cfg.cardOptions.length).toBeGreaterThan(0);
  });

  it("card CRUD requires an admin session", async () => {
    const res = await app.request("/api/admin/platform/cards", {}, env);
    expect(res.status).toBe(401);
  });
});
