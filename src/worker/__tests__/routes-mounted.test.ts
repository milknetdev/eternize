import { describe, it, expect, beforeEach } from "vitest";
import app from "../index";
import { makeFixture, type Fixture } from "./helpers";

// After splitting index.ts into per-domain route modules, this guards that every
// module is still mounted and reachable through the root app.

let fx: Fixture;

beforeEach(async () => {
  delete process.env.NEON_DATABASE_URL;
  fx = await makeFixture();
});

const req = (path: string, init: RequestInit = {}) =>
  app.request(path, init, { DB: fx.db } as unknown as Record<string, unknown>);

describe("route modules are mounted", () => {
  // Authenticated GET endpoints: no cookie -> authMiddleware answers 401,
  // which only happens if the route itself is registered.
  it.each([
    ["/api/users/me", "auth"],
    ["/api/wedding", "weddings"],
    ["/api/guests", "guests"],
    ["/api/tables", "tables"],
    ["/api/tasks", "tasks"],
    ["/api/budget", "budget"],
    ["/api/gifts", "gifts"],
    ["/api/messages", "messages"],
    ["/api/photos", "photos"],
    ["/api/story-items", "story"],
    ["/api/gift-orders", "payments"],
    ["/api/admin/stats", "admin"],
    ["/api/godparents", "godparents"],
    ["/api/parents", "parents"],
    ["/api/accommodations", "accommodations"],
    ["/api/contributions", "contributions"],
    ["/api/guest-photos", "guest-photos"],
    ["/api/dashboard/stats", "dashboard"],
    ["/api/admin/platform/settings", "platform"],
  ])("%s (%s) responds 401 without a session", async (path) => {
    const res = await req(path);
    expect(res.status).toBe(401);
  });

  it("og module serves an HTML shell for /c/:customUrl", async () => {
    const res = await req("/c/whatever");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
  });

  it("public-wedding module answers 404 JSON for an unknown custom URL", async () => {
    const res = await req("/api/public/wedding/does-not-exist");
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: "Wedding not found" });
  });

  it("confirm module validates input on find-guest", async () => {
    const res = await req("/api/public/wedding/x/find-guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneLast4: "12" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a genuinely unknown path", async () => {
    const res = await req("/api/nope/nope");
    expect(res.status).toBe(404);
  });
});
