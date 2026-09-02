import { build } from "esbuild";
import path from "path";

// Bundle the API handler into a single file for Vercel
await build({
  entryPoints: ["api/index.ts"],
  bundle: true,
  outfile: "api-bundle/index.mjs",
  format: "esm",
  platform: "node",
  target: "node20",
  external: [],
  resolveExtensions: [".ts", ".js"],
  alias: {
    "@": path.resolve("./src"),
  },
  banner: {
    js: "// Eternize API - bundled for Vercel",
  },
});

console.log("API bundled to api-bundle/index.mjs");
