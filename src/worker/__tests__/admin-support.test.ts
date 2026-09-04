import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

let fx: Fixture;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  fx = await makeFixture();
});

// route handlers return loosely-typed JSON; the tests just assert on it
const body = (r: Response): Promise<any> => r.json();

const call = (path: string, token?: string, init: RequestInit = {}) =>
  app.request(
    path,
    {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `eternize_session=${token}` } : {}),
        ...(init.headers as Record<string, string>),
      },
    },
    { DB: fx.db } as unknown as Record<string, unknown>,
  );

describe("admin support console", () => {
  it("is admin-only", async () => {
    expect((await call("/api/admin/couples")).status).toBe(401);
    expect((await call("/api/admin/couples", fx.tokenA)).status).toBe(403);
    expect((await call("/api/admin/couples", fx.tokenAdmin)).status).toBe(200);
  });

  it("searches couples by e-mail / partner name", async () => {
    const byEmail = await body(await call("/api/admin/couples?q=a@example.com", fx.tokenAdmin));
    expect(byEmail.couples).toHaveLength(1);
    expect(byEmail.couples[0].partner1_name).toBe("Alice");

    const byName = await body(await call("/api/admin/couples?q=bea", fx.tokenAdmin));
    expect(byName.couples[0].partner2_name).toBe("Bea");

    const all = await body(await call("/api/admin/couples?q=", fx.tokenAdmin));
    expect(all.couples.length).toBe(2);
  });

  it("returns a full record and lets the admin publish / fix a URL", async () => {
    const detail = await body(await call(`/api/admin/couples/${fx.weddingA}`, fx.tokenAdmin));
    expect(detail.wedding.user_email).toBe("a@example.com");
    expect(detail.counts.guests).toBe(1);

    let res = await call(`/api/admin/couples/${fx.weddingA}`, fx.tokenAdmin, {
      method: "PATCH",
      body: JSON.stringify({ is_published: true, custom_url: "novo-endereco" }),
    });
    expect(res.status).toBe(200);

    const row = await fx.db
      .prepare("SELECT is_published, custom_url FROM weddings WHERE id = ?")
      .bind(fx.weddingA)
      .first<{ is_published: boolean; custom_url: string }>();
    expect(row?.is_published).toBe(true);
    expect(row?.custom_url).toBe("novo-endereco");

    res = await call(`/api/admin/couples/99999`, fx.tokenAdmin, {
      method: "PATCH",
      body: JSON.stringify({ is_published: true }),
    });
    expect(res.status).toBe(404);
  });

  it("issues a temporary password and drops the user's sessions", async () => {
    const res = await call("/api/admin/users/user_a/reset-password", fx.tokenAdmin, { method: "POST" });
    const data = await body(res);
    expect(data.tempPassword).toMatch(/^Et-/);

    const session = await fx.db
      .prepare("SELECT token FROM sessions WHERE user_id = ?")
      .bind("user_a")
      .first();
    expect(session).toBeNull();
  });
});
