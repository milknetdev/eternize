import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

let fx: Fixture;

beforeEach(async () => {
  // The worker's bootstrap middleware only builds its own NeonDB when a
  // connection string is present; with none, the injected test binding wins.
  delete process.env.NEON_DATABASE_URL;
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_KEY;
  fx = await makeFixture();
});

/** Fire a request at the worker with a given session cookie and the test DB. */
function call(
  path: string,
  init: RequestInit & { token?: string } = {},
) {
  const { token, headers, ...rest } = init;
  return app.request(
    path,
    {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `eternize_session=${token}` } : {}),
        ...(headers as Record<string, string>),
      },
    },
    { DB: fx.db } as unknown as Record<string, unknown>,
  );
}

describe("authentication", () => {
  it("rejects unauthenticated mutations", async () => {
    const res = await call(`/api/guests/${fx.guestA}`, {
      method: "PUT",
      body: JSON.stringify({ name: "Nope" }),
    });
    expect(res.status).toBe(401);
  });
});

describe("guests — cross-tenant authorization", () => {
  it("lets the owner update their own guest", async () => {
    const res = await call(`/api/guests/${fx.guestA}`, {
      method: "PUT",
      token: fx.tokenA,
      body: JSON.stringify({ name: "Renamed By Owner", guests_count: 2 }),
    });
    expect(res.status).toBe(200);

    const row = await fx.db
      .prepare("SELECT name FROM guests WHERE id = ?")
      .bind(fx.guestA)
      .first<{ name: string }>();
    expect(row?.name).toBe("Renamed By Owner");
  });

  it("does NOT let another couple update your guest (IDOR)", async () => {
    const res = await call(`/api/guests/${fx.guestA}`, {
      method: "PUT",
      token: fx.tokenB, // Bob, who owns a different wedding
      body: JSON.stringify({ name: "Hacked", guests_count: 99 }),
    });
    expect(res.status).toBe(404);

    const row = await fx.db
      .prepare("SELECT name FROM guests WHERE id = ?")
      .bind(fx.guestA)
      .first<{ name: string }>();
    expect(row?.name).toBe("Original Guest"); // untouched
  });

  it("does NOT let another couple delete your guest (IDOR)", async () => {
    const res = await call(`/api/guests/${fx.guestA}`, {
      method: "DELETE",
      token: fx.tokenB,
    });
    expect(res.status).toBe(404);

    const row = await fx.db
      .prepare("SELECT id FROM guests WHERE id = ?")
      .bind(fx.guestA)
      .first();
    expect(row).not.toBeNull(); // still there
  });

  it("lets the owner delete their own guest", async () => {
    const res = await call(`/api/guests/${fx.guestA}`, {
      method: "DELETE",
      token: fx.tokenA,
    });
    expect(res.status).toBe(200);

    const row = await fx.db
      .prepare("SELECT id FROM guests WHERE id = ?")
      .bind(fx.guestA)
      .first();
    expect(row).toBeNull();
  });
});

describe("tasks — cross-tenant authorization", () => {
  it("does NOT let another couple toggle your task (IDOR)", async () => {
    const res = await call(`/api/tasks/${fx.taskA}/toggle`, {
      method: "PUT",
      token: fx.tokenB,
    });
    expect(res.status).toBe(404);

    const row = await fx.db
      .prepare("SELECT is_completed FROM wedding_tasks WHERE id = ?")
      .bind(fx.taskA)
      .first<{ is_completed: boolean }>();
    expect(row?.is_completed).toBe(false);
  });

  it("does NOT let another couple delete your task (IDOR)", async () => {
    const res = await call(`/api/tasks/${fx.taskA}`, {
      method: "DELETE",
      token: fx.tokenB,
    });
    expect(res.status).toBe(404);

    const row = await fx.db
      .prepare("SELECT id FROM wedding_tasks WHERE id = ?")
      .bind(fx.taskA)
      .first();
    expect(row).not.toBeNull();
  });
});
