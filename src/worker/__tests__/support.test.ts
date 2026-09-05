import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

let fx: Fixture;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  fx = await makeFixture();
});

const env = () => ({ DB: fx.db } as unknown as Record<string, unknown>);
const jget = (r: Response): Promise<any> => r.json();

function cookieFrom(res: Response, name: string): string | null {
  const raw = res.headers.get("set-cookie") || "";
  const m = raw.match(new RegExp(`${name}=([^;]+)`));
  return m ? `${name}=${m[1]}` : null;
}

describe("admin impersonation", () => {
  it("only admins can start it", async () => {
    const path = `/api/admin/couples/${fx.weddingA}/impersonate`;
    expect((await app.request(path, { method: "POST" }, env())).status).toBe(401);
    expect((await app.request(path, { method: "POST", headers: { Cookie: `eternize_session=${fx.tokenB}` } }, env())).status).toBe(403);
    const ok = await app.request(path, { method: "POST", headers: { Cookie: `eternize_session=${fx.tokenAdmin}` } }, env());
    expect(ok.status).toBe(200);
    expect(cookieFrom(ok, "eternize_support")).toBeTruthy();
  });

  it("acts as the couple and reports context, then stops cleanly", async () => {
    const start = await app.request(
      `/api/admin/couples/${fx.weddingA}/impersonate`,
      { method: "POST", headers: { Cookie: `eternize_session=${fx.tokenAdmin}` } },
      env(),
    );
    const support = cookieFrom(start, "eternize_support")!;

    // context reflects the impersonated couple
    const ctx = await jget(await app.request("/api/support/context", { headers: { Cookie: support } }, env()));
    expect(ctx.impersonating).toBe(true);
    expect(ctx.couple).toContain("Alice");

    // an authed route now resolves as the couple — admin sees wedding A's data
    const wedding = await jget(await app.request("/api/wedding", { headers: { Cookie: support } }, env()));
    expect(wedding.custom_url).toBe("alice-alex");

    // stop clears it
    const stop = await app.request("/api/support/stop", { method: "POST", headers: { Cookie: support } }, env());
    expect(stop.status).toBe(200);
    const after = await jget(await app.request("/api/support/context", { headers: { Cookie: support } }, env()));
    expect(after.impersonating).toBe(false);
  });

  it("support cookie takes precedence over a normal session", async () => {
    const start = await app.request(
      `/api/admin/couples/${fx.weddingA}/impersonate`,
      { method: "POST", headers: { Cookie: `eternize_session=${fx.tokenAdmin}` } },
      env(),
    );
    const support = cookieFrom(start, "eternize_support")!;
    // send BOTH cookies — the support one should win
    const wedding = await jget(
      await app.request("/api/wedding", { headers: { Cookie: `eternize_session=${fx.tokenB}; ${support}` } }, env()),
    );
    expect(wedding.custom_url).toBe("alice-alex");
  });
});
