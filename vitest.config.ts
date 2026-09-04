import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Worker/API tests run in Node; the React app is not covered yet.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    environment: "node",
    // Do not auto-load .env / .dev.vars — tests inject their own bindings.
    env: {},
  },
});
