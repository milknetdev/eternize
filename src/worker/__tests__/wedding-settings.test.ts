import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

let fx: Fixture;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  fx = await makeFixture();
});

const put = (body: unknown, token: string) =>
  app.request(
    "/api/wedding/settings",
    {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: `eternize_session=${token}` },
      body: JSON.stringify(body),
    },
    { DB: fx.db } as unknown as Record<string, unknown>,
  );

const readShow = async (col: string) => {
  const row = await fx.db
    .prepare(`SELECT ${col} AS v FROM weddings WHERE id = ?`)
    .bind(fx.weddingA)
    .first<{ v: boolean }>();
  return row?.v;
};

describe("PUT /api/wedding/settings — partial update", () => {
  it("persists a single section toggle", async () => {
    const res = await put({ show_parents: 0 }, fx.tokenA);
    expect(res.status).toBe(200);
    expect(await readShow("show_parents")).toBe(false);
  });

  it("does not reset the other sections when saving one field", async () => {
    // start: everything visible (schema default TRUE)
    await put({ show_gifts: 0 }, fx.tokenA);
    expect(await readShow("show_gifts")).toBe(false);

    // saving an unrelated field must leave show_gifts alone
    await put({ invitation_message: "Olá!" }, fx.tokenA);
    expect(await readShow("show_gifts")).toBe(false);
    expect(await readShow("show_story")).toBe(true);

    const msg = await fx.db
      .prepare("SELECT invitation_message AS v FROM weddings WHERE id = ?")
      .bind(fx.weddingA)
      .first<{ v: string }>();
    expect(msg?.v).toBe("Olá!");
  });

  it("toggling godparents/parents/accommodations round-trips", async () => {
    for (const col of ["show_godparents", "show_parents", "show_accommodations"]) {
      await put({ [col]: 0 }, fx.tokenA);
      expect(await readShow(col)).toBe(false);
      await put({ [col]: 1 }, fx.tokenA);
      expect(await readShow(col)).toBe(true);
    }
  });
});
