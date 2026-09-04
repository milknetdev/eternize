import { Hono } from "hono";
import type { Context } from "hono";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();

// =====================
// DYNAMIC OG META TAGS FOR COUPLE PAGES
// =====================

const escapeHtml = (str: string) =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** SPA shell with per-couple Open Graph / Twitter tags for link previews. */
function renderCoupleShell(opts: {
  origin: string;
  title: string;
  description: string;
  image: string;
}) {
  const { origin, title, description, image } = opts;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Eternize" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <link rel="icon" href="${origin}/favicon.svg" type="image/svg+xml" />
    <link rel="alternate icon" href="${origin}/favicon.ico" />
    <title>${t} - Eternize</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react-app/main.tsx"></script>
  </body>
</html>`;
}

interface CoupleOgRow {
  partner1_name: string;
  partner2_name: string;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  hero_image_key?: string | null;
}

async function coupleShell(c: Context<AppEnv>) {
  const customUrl = c.req.param("customUrl");
  const origin = new URL(c.req.url).origin;

  const wedding = await c.env.DB.prepare(
    `SELECT partner1_name, partner2_name, og_title, og_description, og_image, hero_image_key
     FROM weddings WHERE custom_url = ?`,
  )
    .bind(customUrl)
    .first<CoupleOgRow>();

  let title = "Eternize - Casamento";
  let description = "Celebre conosco este momento especial!";
  let image = `${origin}/og.png`;

  if (wedding) {
    title = wedding.og_title || `${wedding.partner1_name} & ${wedding.partner2_name}`;
    description =
      wedding.og_description ||
      `Você está convidado(a) para o casamento de ${wedding.partner1_name} e ${wedding.partner2_name}!`;

    if (wedding.og_image) {
      image = wedding.og_image;
    } else if (wedding.hero_image_key) {
      image = wedding.hero_image_key.startsWith("http")
        ? wedding.hero_image_key
        : `${origin}/api/files/${wedding.hero_image_key}`;
    }
  }

  return c.html(renderCoupleShell({ origin, title, description, image }));
}

r.get("/c/:customUrl", coupleShell);
// Subpages like /c/:customUrl/presentes get the same preview.
r.get("/c/:customUrl/*", coupleShell);

export default r;
