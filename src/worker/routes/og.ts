import { Hono } from "hono";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// DYNAMIC OG META TAGS FOR COUPLE PAGES
// =====================

r.get("/c/:customUrl", async (c) => {
  const customUrl = c.req.param("customUrl");
  
  // Fetch wedding data for og tags
  const wedding = await c.env.DB.prepare(`
    SELECT partner1_name, partner2_name, wedding_date, og_title, og_description, og_image, hero_image_key, is_published
    FROM weddings WHERE custom_url = ?
  `).bind(customUrl).first<{
    partner1_name: string;
    partner2_name: string;
    wedding_date: string;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    hero_image_key: string | null;
    is_published: number;
  }>();
  
  // Default meta tags
  let ogTitle = "Eternize - Casamento";
  let ogDescription = "Celebre conosco este momento especial!";
  let ogImage = "https://static.getmocha.com/og.png";
  
  if (wedding) {
    // Use custom og tags or generate from wedding data
    ogTitle = wedding.og_title || `${wedding.partner1_name} & ${wedding.partner2_name}`;
    ogDescription = wedding.og_description || `Você está convidado(a) para o casamento de ${wedding.partner1_name} e ${wedding.partner2_name}!`;
    
    // Priority: og_image > hero_image_key > default
    if (wedding.og_image) {
      ogImage = wedding.og_image;
    } else if (wedding.hero_image_key) {
      // Construct URL from R2 key if available
      ogImage = wedding.hero_image_key.startsWith("http") ? wedding.hero_image_key : `https://static.getmocha.com/og.png`;
    }
  }
  
  // Escape HTML entities
  const escapeHtml = (str: string) => str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Eternize" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <link rel="shortcut icon" href="https://static.getmocha.com/favicon.ico" type="image/x-icon" />
    <title>${escapeHtml(ogTitle)} - Eternize</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react-app/main.tsx"></script>
  </body>
</html>`;

  return c.html(html);
});

// Also handle subpages like /c/:customUrl/presentes
r.get("/c/:customUrl/*", async (c) => {
  const customUrl = c.req.param("customUrl");
  
  const wedding = await c.env.DB.prepare(`
    SELECT partner1_name, partner2_name, og_title, og_description, og_image
    FROM weddings WHERE custom_url = ?
  `).bind(customUrl).first<{
    partner1_name: string;
    partner2_name: string;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
  }>();
  
  let ogTitle = "Eternize - Casamento";
  let ogDescription = "Celebre conosco este momento especial!";
  let ogImage = "https://static.getmocha.com/og.png";
  
  if (wedding) {
    ogTitle = wedding.og_title || `${wedding.partner1_name} & ${wedding.partner2_name}`;
    ogDescription = wedding.og_description || `Você está convidado(a) para o casamento de ${wedding.partner1_name} e ${wedding.partner2_name}!`;
    if (wedding.og_image) ogImage = wedding.og_image;
  }
  
  const escapeHtml = (str: string) => str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(ogDescription)}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Eternize" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(ogDescription)}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <link rel="shortcut icon" href="https://static.getmocha.com/favicon.ico" type="image/x-icon" />
    <title>${escapeHtml(ogTitle)} - Eternize</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/react-app/main.tsx"></script>
  </body>
</html>`;

  return c.html(html);
});

export default r;
