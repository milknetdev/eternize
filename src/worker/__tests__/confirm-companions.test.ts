import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

let fx: Fixture;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  fx = await makeFixture();
  // guest A gets a confirmation code and no phone (so the POST skips phone check)
  await fx.db
    .prepare("UPDATE guests SET confirmation_code = 'testcode', phone = NULL WHERE id = ?")
    .bind(fx.guestA)
    .run();
  await fx.db
    .prepare(
      "INSERT INTO guest_companions (guest_id, name, is_confirmed) VALUES (?, 'Comp One', TRUE), (?, 'Comp Two', TRUE)",
    )
    .bind(fx.guestA, fx.guestA)
    .run();
});

const post = (body: unknown) =>
  app.request(
    "/api/public/confirm/testcode",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    { DB: fx.db } as unknown as Record<string, unknown>,
  );

const companionState = async () => {
  const { results } = await fx.db
    .prepare("SELECT name, is_confirmed FROM guest_companions WHERE guest_id = ? ORDER BY id")
    .bind(fx.guestA)
    .all<{ name: string; is_confirmed: boolean }>();
  return results;
};

describe("POST /api/public/confirm/:code — companion attendance", () => {
  it("un-confirms every companion when the list is empty (guest comes alone)", async () => {
    const res = await post({ confirmedCompanionIds: [] });
    expect(res.status).toBe(200);
    expect((await companionState()).every((c) => c.is_confirmed === false)).toBe(true);
  });

  it("confirms only the companions in the list and resets the rest", async () => {
    const [first] = await companionState();
    const firstId = await fx.db
      .prepare("SELECT id FROM guest_companions WHERE guest_id = ? AND name = ?")
      .bind(fx.guestA, first.name)
      .first<{ id: number }>();

    const res = await post({ confirmedCompanionIds: [firstId!.id] });
    expect(res.status).toBe(200);

    const state = await companionState();
    expect(state.find((c) => c.name === "Comp One")?.is_confirmed).toBe(true);
    expect(state.find((c) => c.name === "Comp Two")?.is_confirmed).toBe(false);
  });
});
