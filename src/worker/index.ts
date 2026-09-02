import { Hono } from "hono";
import {
  authMiddleware,
  handleRegister,
  handleLogin,
  handleGetUser,
  handleLogout,
} from "./local-auth-backend";
import { NeonDB } from "./neon-db";
import { SupabaseR2 } from "./supabase-r2";
import { createClient } from "@supabase/supabase-js";

// Local Env type (no Cloudflare dependency)
interface AppEnv {
  Variables: {
    user: any;
  };
  Bindings: {
    DB: NeonDB;
    R2_BUCKET: SupabaseR2;
    NEON_DATABASE_URL: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
  };
}

const app = new Hono<AppEnv>();

// Initialize Neon DB + Supabase Storage
app.use("*", async (c, next) => {
  const neonUrl = (c.env as any)?.NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || '';
  const supaUrl = (c.env as any)?.SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supaKey = (c.env as any)?.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

  if (neonUrl) {
    if (!c.env) (c as any).env = {};
    (c.env as any).DB = new NeonDB(neonUrl);
  }

  // Supabase Storage for file uploads
  if (supaUrl && supaKey) {
    const supabase = createClient(supaUrl, supaKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    (c.env as any).R2_BUCKET = new SupabaseR2(supabase);
  }

  await next();
});

// =====================
// AUTH ROUTES
// =====================

app.post("/api/auth/register", handleRegister);
app.post("/api/auth/login", handleLogin);
app.get("/api/users/me", authMiddleware, handleGetUser);
app.get("/api/logout", handleLogout);

// =====================
// DYNAMIC OG META TAGS FOR COUPLE PAGES
// =====================

app.get("/c/:customUrl", async (c) => {
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
app.get("/c/:customUrl/*", async (c) => {
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

// =====================
// WEDDING ROUTES
// =====================

app.get("/api/wedding", authMiddleware, async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    "SELECT * FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  return c.json(result || null);
});

// Toggle publish status
app.post("/api/wedding/publish", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const isPublished = body.is_published ? true : false;
  
  await c.env.DB.prepare(`
    UPDATE weddings SET is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(isPublished, user!.id).run();
  
  return c.json({ success: true, is_published: isPublished });
});

app.post("/api/wedding", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  // Check if wedding exists
  const existing = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (existing) {
    await c.env.DB.prepare(`
      UPDATE weddings SET 
        partner1_name = ?, partner2_name = ?, wedding_date = ?,
        venue_name = ?, venue_address = ?, custom_url = ?, pix_key = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      body.partner1_name, body.partner2_name, body.wedding_date,
      body.venue_name, body.venue_address, body.custom_url, body.pix_key,
      user!.id
    ).run();
    return c.json({ success: true, id: existing.id });
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO weddings (user_id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, custom_url, pix_key)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    user!.id, body.partner1_name, body.partner2_name, body.wedding_date,
    body.venue_name, body.venue_address, body.custom_url, body.pix_key
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update wedding theme
app.put("/api/wedding/theme", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE weddings SET 
      template_id = ?, theme_primary_color = ?, theme_secondary_color = ?,
      theme_accent_color = ?, theme_background_color = ?, theme_text_color = ?,
      theme_heading_font = ?, theme_body_font = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(
    body.template_id, body.theme_primary_color, body.theme_secondary_color,
    body.theme_accent_color, body.theme_background_color, body.theme_text_color,
    body.theme_heading_font, body.theme_body_font, user!.id
  ).run();

  return c.json({ success: true });
});

// Update wedding advanced settings
app.put("/api/wedding/settings", authMiddleware, async (c) => {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ success: false, error: "Você precisa estar logado para salvar configurações" }, 401);
  }
  
  try {
    const body = await c.req.json();
    
    // Check if wedding exists for this user
    const wedding = await c.env.DB.prepare(
      "SELECT id FROM weddings WHERE user_id = ?"
    ).bind(user.id).first();
    
    if (!wedding) {
      return c.json({ success: false, error: "Você precisa criar seu casamento primeiro no Painel (aba Dados)" }, 400);
    }
    
    await c.env.DB.prepare(`
      UPDATE weddings SET 
        show_story = ?, show_gallery = ?, show_timeline = ?, show_location = ?,
        show_dresscode = ?, show_gifts = ?, show_rsvp = ?, show_messages = ?,
        hero_image_key = ?, hero_style = ?, our_story = ?,
        ceremony_time = ?, ceremony_venue = ?, reception_time = ?, reception_venue = ?,
        dress_code = ?, dress_code_description = ?, dress_code_allowed_colors = ?, dress_code_avoid_colors = ?,
        timeline_events = ?, instagram_url = ?, music_url = ?,
        og_title = ?, og_description = ?, og_image = ?,
        invitation_message = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(
      body.show_story ?? 1, body.show_gallery ?? 1, body.show_timeline ?? 1, body.show_location ?? 1,
      body.show_dresscode ?? 1, body.show_gifts ?? 1, body.show_rsvp ?? 1, body.show_messages ?? 1,
      body.hero_image_key || null, body.hero_style || null, body.our_story || null,
      body.ceremony_time || null, body.ceremony_venue || null, body.reception_time || null, body.reception_venue || null,
      body.dress_code || null, body.dress_code_description || null, body.dress_code_allowed_colors || null, body.dress_code_avoid_colors || null,
      body.timeline_events || null, body.instagram_url || null, body.music_url || null,
      body.og_title || null, body.og_description || null, body.og_image || null,
      body.invitation_message || null,
      user.id
    ).run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Error saving wedding settings:", error);
    return c.json({ success: false, error: "Erro ao salvar configurações. Tente novamente." }, 500);
  }
});

// =====================
// GUESTS ROUTES
// =====================

app.get("/api/guests", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) return c.json([]);

  const { results: guests } = await c.env.DB.prepare(
    "SELECT * FROM guests WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  // Fetch companions for all guests
  const guestIds = (guests || []).map((g: any) => g.id);
  if (guestIds.length === 0) return c.json([]);
  
  const { results: companions } = await c.env.DB.prepare(
    `SELECT * FROM guest_companions WHERE guest_id IN (${guestIds.join(",")})`
  ).all();
  
  // Group companions by guest_id
  const companionsByGuest: Record<number, any[]> = {};
  (companions || []).forEach((comp: any) => {
    if (!companionsByGuest[comp.guest_id]) {
      companionsByGuest[comp.guest_id] = [];
    }
    companionsByGuest[comp.guest_id].push(comp);
  });
  
  // Attach companions to guests
  const guestsWithCompanions = (guests || []).map((guest: any) => ({
    ...guest,
    companions: companionsByGuest[guest.id] || [],
  }));
  
  return c.json(guestsWithCompanions);
});

app.post("/api/guests", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  // Generate unique confirmation code
  const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

  const result = await c.env.DB.prepare(`
    INSERT INTO guests (wedding_id, name, email, phone, guests_count, label, confirmation_code, is_child)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.email, body.phone, 
    body.guests_count || 1, body.label || null, confirmationCode, body.is_child ? true : false
  ).run();

  const guestId = result.meta.last_row_id;

  // Insert companions if provided
  if (body.companions && Array.isArray(body.companions)) {
    for (const comp of body.companions) {
      const compName = typeof comp === 'string' ? comp : comp.name;
      const isChild = typeof comp === 'object' ? (comp.is_child ? true : false) : 0;
      if (compName && compName.trim()) {
        await c.env.DB.prepare(`
          INSERT INTO guest_companions (guest_id, name, is_child)
          VALUES (?, ?, ?)
        `).bind(guestId, compName.trim(), isChild).run();
      }
    }
  }

  return c.json({ success: true, id: guestId, confirmation_code: confirmationCode });
});

app.put("/api/guests/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE guests SET 
      name = ?, email = ?, phone = ?, guests_count = ?, rsvp_status = ?,
      dietary_restrictions = ?, label = ?, is_child = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name, body.email, body.phone, body.guests_count,
    body.rsvp_status, body.dietary_restrictions, body.label || null, body.is_child ? true : false, id
  ).run();

  // Update companions: delete old ones and insert new
  await c.env.DB.prepare("DELETE FROM guest_companions WHERE guest_id = ?").bind(id).run();
  
  if (body.companions && Array.isArray(body.companions)) {
    for (const comp of body.companions) {
      const compName = typeof comp === 'string' ? comp : comp.name;
      const isConfirmed = typeof comp === 'object' ? (comp.is_confirmed ? true : false) : 0;
      const isChild = typeof comp === 'object' ? (comp.is_child ? true : false) : 0;
      if (compName && compName.trim()) {
        await c.env.DB.prepare(`
          INSERT INTO guest_companions (guest_id, name, is_confirmed, is_child)
          VALUES (?, ?, ?, ?)
        `).bind(id, compName.trim(), isConfirmed, isChild).run();
      }
    }
  }

  return c.json({ success: true });
});

app.delete("/api/guests/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  // Delete companions first
  await c.env.DB.prepare("DELETE FROM guest_companions WHERE guest_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM guests WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Update guest table assignment
app.put("/api/guests/:id/table", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  
  await c.env.DB.prepare(`
    UPDATE guests SET table_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(body.table_id, id).run();
  
  return c.json({ success: true });
});

// =====================
// TABLES ROUTES
// =====================

app.get("/api/tables", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_tables WHERE wedding_id = ? ORDER BY table_number, name"
  ).bind(wedding.id).all();
  
  return c.json(results || []);
});

app.post("/api/tables", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_tables (wedding_id, name, capacity, shape, table_number)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    wedding.id, 
    body.name, 
    body.capacity || 10, 
    body.shape || "round",
    body.table_number || null
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/tables/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE wedding_tables SET 
      name = ?, capacity = ?, shape = ?, table_number = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(body.name, body.capacity, body.shape, body.table_number || null, id).run();

  return c.json({ success: true });
});

app.delete("/api/tables/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  
  // Clear table_id from guests assigned to this table
  await c.env.DB.prepare("UPDATE guests SET table_id = NULL WHERE table_id = ?").bind(id).run();
  
  // Delete the table
  await c.env.DB.prepare("DELETE FROM wedding_tables WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// =====================
// TASKS ROUTES
// =====================

app.get("/api/tasks", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ tasks: [] });

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_tasks WHERE wedding_id = ? ORDER BY sort_order, due_date, id"
  ).bind(wedding.id).all();

  return c.json({ tasks: results || [] });
});

app.post("/api/tasks", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ error: "No wedding found" }, 404);

  const body = await c.req.json();
  const { title, description, category, due_date, sort_order } = body;

  const result = await c.env.DB.prepare(
    `INSERT INTO wedding_tasks (wedding_id, title, description, category, due_date, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(wedding.id, title, description || null, category || null, due_date || null, sort_order || 0).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/tasks/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { title, description, category, due_date, is_completed } = body;

  const completedAt = is_completed ? new Date().toISOString() : null;

  await c.env.DB.prepare(
    `UPDATE wedding_tasks SET 
     title = ?, description = ?, category = ?, due_date = ?, is_completed = ?, completed_at = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(title, description || null, category || null, due_date || null, is_completed ? true : false, completedAt, id).run();

  return c.json({ success: true });
});

app.put("/api/tasks/:id/toggle", authMiddleware, async (c) => {
  const id = c.req.param("id");
  
  // Get current status
  const task = await c.env.DB.prepare("SELECT is_completed FROM wedding_tasks WHERE id = ?").bind(id).first();
  if (!task) return c.json({ error: "Task not found" }, 404);
  
  const newStatus = task.is_completed ? 0 : 1;
  const completedAt = newStatus ? new Date().toISOString() : null;

  await c.env.DB.prepare(
    `UPDATE wedding_tasks SET is_completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).bind(newStatus, completedAt, id).run();

  return c.json({ success: true, is_completed: newStatus });
});

app.delete("/api/tasks/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM wedding_tasks WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.post("/api/tasks/seed", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ error: "No wedding found" }, 404);

  // Check if tasks already exist
  const existing = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_tasks WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  
  if (existing && (existing.count as number) > 0) {
    return c.json({ error: "Tasks already exist" }, 400);
  }

  const defaultTasks = [
    { category: "Cerimônia", title: "Definir local da cerimônia", sort_order: 1 },
    { category: "Cerimônia", title: "Contratar celebrante", sort_order: 2 },
    { category: "Cerimônia", title: "Escolher músicas da cerimônia", sort_order: 3 },
    { category: "Recepção", title: "Definir local da festa", sort_order: 4 },
    { category: "Recepção", title: "Contratar buffet/catering", sort_order: 5 },
    { category: "Recepção", title: "Definir cardápio", sort_order: 6 },
    { category: "Recepção", title: "Contratar DJ/banda", sort_order: 7 },
    { category: "Decoração", title: "Contratar decorador(a)", sort_order: 8 },
    { category: "Decoração", title: "Definir paleta de cores", sort_order: 9 },
    { category: "Decoração", title: "Escolher flores e arranjos", sort_order: 10 },
    { category: "Foto & Vídeo", title: "Contratar fotógrafo(a)", sort_order: 11 },
    { category: "Foto & Vídeo", title: "Contratar cinegrafista", sort_order: 12 },
    { category: "Foto & Vídeo", title: "Agendar ensaio pré-wedding", sort_order: 13 },
    { category: "Vestuário", title: "Escolher vestido/traje da noiva", sort_order: 14 },
    { category: "Vestuário", title: "Escolher traje do noivo", sort_order: 15 },
    { category: "Vestuário", title: "Definir looks dos padrinhos", sort_order: 16 },
    { category: "Vestuário", title: "Comprar alianças", sort_order: 17 },
    { category: "Beleza", title: "Agendar teste de penteado", sort_order: 18 },
    { category: "Beleza", title: "Agendar teste de maquiagem", sort_order: 19 },
    { category: "Convidados", title: "Montar lista de convidados", sort_order: 20 },
    { category: "Convidados", title: "Enviar convites", sort_order: 21 },
    { category: "Convidados", title: "Confirmar lista final", sort_order: 22 },
    { category: "Documentação", title: "Reunir documentos para casamento civil", sort_order: 23 },
    { category: "Documentação", title: "Agendar casamento no cartório", sort_order: 24 },
    { category: "Viagem", title: "Reservar lua de mel", sort_order: 25 },
    { category: "Viagem", title: "Providenciar passaportes/vistos", sort_order: 26 },
  ];

  for (const task of defaultTasks) {
    await c.env.DB.prepare(
      `INSERT INTO wedding_tasks (wedding_id, title, category, sort_order) VALUES (?, ?, ?, ?)`
    ).bind(wedding.id, task.title, task.category, task.sort_order).run();
  }

  return c.json({ success: true, count: defaultTasks.length });
});

// =====================
// EXPENSES/BUDGET ROUTES
// =====================

app.get("/api/budget", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id, total_budget FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ total_budget: null, expenses: [] });

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_expenses WHERE wedding_id = ? ORDER BY category, due_date, id"
  ).bind(wedding.id).all();

  return c.json({ 
    total_budget: wedding.total_budget, 
    expenses: results || [] 
  });
});

app.put("/api/budget", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ error: "No wedding found" }, 404);

  const body = await c.req.json();
  const { total_budget } = body;

  await c.env.DB.prepare(
    "UPDATE weddings SET total_budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(total_budget, wedding.id).run();

  return c.json({ success: true });
});

app.post("/api/expenses", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ error: "No wedding found" }, 404);

  const body = await c.req.json();
  const { name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, notes } = body;

  const paidAt = is_paid ? new Date().toISOString() : null;

  const result = await c.env.DB.prepare(
    `INSERT INTO wedding_expenses (wedding_id, name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, paid_at, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(wedding.id, name, description || null, category || null, vendor_name || null, estimated_amount, paid_amount || 0, is_paid ? true : false, due_date || null, paidAt, notes || null).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/expenses/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, notes } = body;

  const paidAt = is_paid ? new Date().toISOString() : null;

  await c.env.DB.prepare(
    `UPDATE wedding_expenses SET 
     name = ?, description = ?, category = ?, vendor_name = ?, estimated_amount = ?, paid_amount = ?, is_paid = ?, due_date = ?, paid_at = ?, notes = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(name, description || null, category || null, vendor_name || null, estimated_amount, paid_amount || 0, is_paid ? true : false, due_date || null, paidAt, notes || null, id).run();

  return c.json({ success: true });
});

app.delete("/api/expenses/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM wedding_expenses WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.post("/api/expenses/seed", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json({ error: "No wedding found" }, 404);

  const existing = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_expenses WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  
  if (existing && (existing.count as number) > 0) {
    return c.json({ error: "Expenses already exist" }, 400);
  }

  const defaultExpenses = [
    { category: "Local", name: "Aluguel do espaço", estimated_amount: 15000 },
    { category: "Local", name: "Decoração", estimated_amount: 8000 },
    { category: "Buffet", name: "Buffet completo", estimated_amount: 25000 },
    { category: "Buffet", name: "Bebidas", estimated_amount: 5000 },
    { category: "Buffet", name: "Bolo de casamento", estimated_amount: 2000 },
    { category: "Foto & Vídeo", name: "Fotógrafo", estimated_amount: 6000 },
    { category: "Foto & Vídeo", name: "Cinegrafista", estimated_amount: 5000 },
    { category: "Música", name: "DJ", estimated_amount: 3000 },
    { category: "Música", name: "Músico para cerimônia", estimated_amount: 1500 },
    { category: "Vestuário", name: "Vestido da noiva", estimated_amount: 8000 },
    { category: "Vestuário", name: "Traje do noivo", estimated_amount: 3000 },
    { category: "Vestuário", name: "Alianças", estimated_amount: 4000 },
    { category: "Beleza", name: "Maquiagem", estimated_amount: 800 },
    { category: "Beleza", name: "Penteado", estimated_amount: 600 },
    { category: "Papelaria", name: "Convites", estimated_amount: 1500 },
    { category: "Outros", name: "Lembrancinhas", estimated_amount: 2000 },
    { category: "Outros", name: "Transporte", estimated_amount: 1000 },
  ];

  for (const expense of defaultExpenses) {
    await c.env.DB.prepare(
      `INSERT INTO wedding_expenses (wedding_id, name, category, estimated_amount) VALUES (?, ?, ?, ?)`
    ).bind(wedding.id, expense.name, expense.category, expense.estimated_amount).run();
  }

  return c.json({ success: true, count: defaultExpenses.length });
});

// =====================
// GIFTS ROUTES
// =====================

app.get("/api/gifts", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_gifts WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results);
});

app.post("/api/gifts", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_gifts (wedding_id, name, description, price, image_url, category, quota_total)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.description, body.price,
    body.image_url, body.category, body.quota_total || 1
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/gifts/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE wedding_gifts SET 
      name = ?, description = ?, price = ?, image_url = ?,
      category = ?, is_available = ?, quota_total = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name, body.description, body.price, body.image_url,
    body.category, body.is_available ? true : false, body.quota_total, id
  ).run();

  return c.json({ success: true });
});

app.delete("/api/gifts/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM wedding_gifts WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// =====================
// MESSAGES ROUTES (Dashboard)
// =====================

app.get("/api/messages", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM guest_messages WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results);
});

app.put("/api/messages/:id/approve", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(
    "UPDATE guest_messages SET is_approved = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();
  return c.json({ success: true });
});

app.put("/api/messages/:id/reject", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(
    "UPDATE guest_messages SET is_approved = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(id).run();
  return c.json({ success: true });
});

app.delete("/api/messages/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM guest_messages WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// =====================
// PHOTOS ROUTES (Dashboard)
// =====================

// List photos for the user's wedding
app.get("/api/photos", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_photos WHERE wedding_id = ? ORDER BY sort_order ASC, created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results);
});

// Upload a photo
app.post("/api/photos", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed." }, 400);
  }

  // Validate file size (max 5MB for DB storage)
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
  }

  // Generate unique storage key
  const timestamp = Date.now();
  const storageKey = `weddings/${wedding.id}/photos/${timestamp}-${file.name}`;

  // Convert to base64 and store in Neon
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  await c.env.DB.prepare(
    "INSERT INTO files (key, data, content_type, size) VALUES (?, ?, ?, ?)"
  ).bind(storageKey, base64, file.type, file.size).run();

  // Get current max sort_order
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max_order FROM wedding_photos WHERE wedding_id = ?"
  ).bind(wedding.id).first<{ max_order: number | null }>();

  const sortOrder = (maxOrder?.max_order || 0) + 1;

  // Save to database
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_photos (wedding_id, filename, storage_key, caption, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).bind(wedding.id, file.name, storageKey, caption, sortOrder).run();

  return c.json({ 
    success: true, 
    id: result.meta.last_row_id,
    filename: file.name,
    storage_key: storageKey,
    caption
  });
});

// Update photo caption or order
app.put("/api/photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const updates: string[] = [];
  const values: any[] = [];

  if (body.caption !== undefined) {
    updates.push("caption = ?");
    values.push(body.caption);
  }
  if (body.sort_order !== undefined) {
    updates.push("sort_order = ?");
    values.push(body.sort_order);
  }

  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  await c.env.DB.prepare(
    `UPDATE wedding_photos SET ${updates.join(", ")} WHERE id = ?`
  ).bind(...values).run();

  return c.json({ success: true });
});

// Delete a photo
app.delete("/api/photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  // Get photo and verify ownership
  const photo = await c.env.DB.prepare(`
    SELECT wp.* FROM wedding_photos wp
    JOIN weddings w ON wp.wedding_id = w.id
    WHERE wp.id = ? AND w.user_id = ?
  `).bind(id, user!.id).first<{ storage_key: string }>();

  if (!photo) {
    return c.json({ error: "Photo not found" }, 404);
  }

  // Delete from files table
  await c.env.DB.prepare("DELETE FROM files WHERE key = ?").bind(photo.storage_key).run();

  // Delete from database
  await c.env.DB.prepare("DELETE FROM wedding_photos WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// Generic file upload endpoint
app.post("/api/upload", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed." }, 400);
  }

  // Validate file size (max 5MB for DB storage)
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum size is 5MB." }, 400);
  }

  // Generate unique storage key
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const storageKey = `weddings/${wedding.id}/uploads/${timestamp}-${randomId}-${file.name}`;

  // Convert to base64 and store in Neon
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  await c.env.DB.prepare(
    "INSERT INTO files (key, data, content_type, size) VALUES (?, ?, ?, ?)"
  ).bind(storageKey, base64, file.type, file.size).run();

  const url = `/api/files/${storageKey}`;

  return c.json({ 
    success: true, 
    url,
    filename: file.name,
    storage_key: storageKey
  });
});

// Serve file from Neon DB
app.get("/api/files/:key{.+}", async (c) => {
  const key = c.req.param("key");
  const file = await c.env.DB.prepare(
    "SELECT data, content_type FROM files WHERE key = ?"
  ).bind(key).first<{ data: string; content_type: string }>();
  
  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  const buffer = Buffer.from(file.data, 'base64');
  
  return new Response(buffer, {
    headers: {
      'Content-Type': file.content_type,
      'Cache-Control': 'public, max-age=31536000',
    },
  });
});

// =====================
// STORY ITEMS
// =====================

app.get("/api/story-items", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);
  
  const items = await c.env.DB.prepare(
    "SELECT * FROM wedding_story_items WHERE wedding_id = ? ORDER BY sort_order ASC"
  ).bind(wedding.id).all();
  
  return c.json(items.results || []);
});

app.post("/api/story-items", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  const body = await c.req.json();
  const { title, description, story_date, image_url } = body;
  
  // Get max sort_order
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max_order FROM wedding_story_items WHERE wedding_id = ?"
  ).bind(wedding.id).first();
  const sortOrder = ((maxOrder?.max_order as number) || 0) + 1;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_story_items (wedding_id, title, description, story_date, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(wedding.id, title, description || null, story_date || null, image_url || null, sortOrder).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/story-items/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const { title, description, story_date, image_url } = body;
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  await c.env.DB.prepare(`
    UPDATE wedding_story_items 
    SET title = ?, description = ?, story_date = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(title, description || null, story_date || null, image_url || null, id, wedding.id).run();
  
  return c.json({ success: true });
});

app.delete("/api/story-items/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  await c.env.DB.prepare(
    "DELETE FROM wedding_story_items WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).run();
  
  return c.json({ success: true });
});

app.put("/api/story-items/reorder", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const { items } = body as { items: { id: number; sort_order: number }[] };
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);
  
  for (const item of items) {
    await c.env.DB.prepare(
      "UPDATE wedding_story_items SET sort_order = ? WHERE id = ? AND wedding_id = ?"
    ).bind(item.sort_order, item.id, wedding.id).run();
  }
  
  return c.json({ success: true });
});

// =====================
// PUBLIC ROUTES (for guests)
// =====================

// Get wedding by custom URL
app.get("/api/public/wedding/:customUrl", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(`
    SELECT id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, pix_key, custom_url,
           template_id, theme_primary_color, theme_secondary_color, theme_accent_color, 
           theme_background_color, theme_text_color, theme_heading_font, theme_body_font,
           show_story, show_gallery, show_timeline, show_location, show_dresscode, 
           show_gifts, show_rsvp, show_messages, show_godparents, show_parents, show_accommodations, hero_image_key, hero_style, our_story,
           ceremony_time, ceremony_venue, reception_time, reception_venue,
           dress_code, dress_code_description, dress_code_allowed_colors, dress_code_avoid_colors,
           timeline_events, instagram_url, music_url, is_published,
           og_title, og_description, og_image
    FROM weddings WHERE custom_url = ?
  `).bind(customUrl).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }
  
  // Check if wedding is published (handle both boolean and integer)
  if (!wedding.is_published) {
    return c.json({ error: "Wedding not published", unpublished: true }, 403);
  }

  // Fetch story items
  const storyItems = await c.env.DB.prepare(
    "SELECT * FROM wedding_story_items WHERE wedding_id = ? ORDER BY sort_order ASC"
  ).bind(wedding.id).all();
  
  return c.json({ wedding, storyItems: storyItems.results || [] });
});

// Get public gifts for a wedding
app.get("/api/public/wedding/:customUrl/gifts", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, description, price, image_url, category, is_available, quota_total, quota_purchased FROM wedding_gifts WHERE wedding_id = ? AND is_available = TRUE ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json({ gifts: results || [] });
});

// Get photos for public display
app.get("/api/public/wedding/:customUrl/photos", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, filename, storage_key, caption, sort_order FROM wedding_photos WHERE wedding_id = ? ORDER BY sort_order ASC, created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results);
});

// Get approved messages for public display
app.get("/api/public/wedding/:customUrl/messages", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, guest_name AS author_name, message AS content, created_at FROM guest_messages WHERE wedding_id = ? AND is_approved = TRUE ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json({ messages: results });
});

// Submit RSVP (public)
app.post("/api/public/wedding/:customUrl/rsvp", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  // Check if guest exists by email
  if (body.email) {
    const existingGuest = await c.env.DB.prepare(
      "SELECT id FROM guests WHERE wedding_id = ? AND email = ?"
    ).bind(wedding.id, body.email).first();

    if (existingGuest) {
      // Update existing guest
      await c.env.DB.prepare(`
        UPDATE guests SET 
          name = ?, phone = ?, guests_count = ?, rsvp_status = ?,
          dietary_restrictions = ?, message = ?, responded_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.name, body.phone, body.guests_count || 1, body.rsvp_status,
        body.dietary_restrictions, body.message, existingGuest.id
      ).run();

      return c.json({ success: true, updated: true });
    }
  }

  // Create new guest
  await c.env.DB.prepare(`
    INSERT INTO guests (wedding_id, name, email, phone, guests_count, rsvp_status, dietary_restrictions, message, responded_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).bind(
    wedding.id, body.name, body.email, body.phone, body.guests_count || 1,
    body.rsvp_status, body.dietary_restrictions, body.message
  ).run();

  return c.json({ success: true, updated: false });
});

// Submit message (public)
app.post("/api/public/wedding/:customUrl/messages", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();
  
  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  await c.env.DB.prepare(`
    INSERT INTO guest_messages (wedding_id, guest_name, message, is_approved)
    VALUES (?, ?, ?, NULL)
  `).bind(wedding.id, body.author_name, body.content).run();

  return c.json({ success: true });
});

// =====================
// PUBLIC GUEST CONFIRMATION
// =====================

// Find guest by phone last 4 digits
app.post("/api/public/wedding/:customUrl/find-guest", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  const { phoneLast4 } = body;

  if (!phoneLast4 || phoneLast4.length !== 4) {
    return c.json({ found: false, error: "Digite os 4 últimos dígitos do telefone" }, 400);
  }

  // Find wedding
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ? AND is_published = TRUE"
  ).bind(customUrl).first<{ id: number }>();

  if (!wedding) {
    return c.json({ found: false, error: "Casamento não encontrado" }, 404);
  }

  // Find guest by last 4 digits of phone
  const guest = await c.env.DB.prepare(
    "SELECT confirmation_code, name FROM guests WHERE wedding_id = ? AND phone LIKE ? AND confirmation_code IS NOT NULL"
  ).bind(wedding.id, `%${phoneLast4}`).first<{ confirmation_code: string; name: string }>();

  if (!guest) {
    return c.json({ found: false, error: "Não encontramos um convite com esse telefone. Verifique os números e tente novamente." }, 404);
  }

  return c.json({ found: true, confirmation_code: guest.confirmation_code, name: guest.name });
});

// Get guest info by confirmation code (no auth required)
app.get("/api/public/confirm/:code", async (c) => {
  const code = c.req.param("code");
  
  const guest = await c.env.DB.prepare(`
    SELECT g.*, w.partner1_name, w.partner2_name, w.wedding_date, w.venue_name, w.custom_url, w.show_gifts
    FROM guests g
    JOIN weddings w ON g.wedding_id = w.id
    WHERE g.confirmation_code = ?
  `).bind(code).first<{
    id: number;
    name: string;
    phone: string;
    is_confirmed: number;
    confirmed_at: string;
    is_child: number;
    partner1_name: string;
    partner2_name: string;
    wedding_date: string;
    venue_name: string;
    custom_url: string;
    show_gifts: number;
  }>();
  
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  
  // Get companions
  const companions = await c.env.DB.prepare(
    "SELECT id, name, is_confirmed, is_child FROM guest_companions WHERE guest_id = ?"
  ).bind(guest.id).all();
  
  // Mask phone for security (show first 8 digits only)
  const phoneMask = guest.phone ? `${guest.phone.slice(0, 8)}****` : null;
  
  return c.json({
    guest: {
      id: guest.id,
      name: guest.name,
      phoneMask,
      hasPhone: !!guest.phone,
      isConfirmed: guest.is_confirmed === true,
      confirmedAt: guest.confirmed_at,
      isChild: guest.is_child === true,
    },
    companions: companions.results || [],
    wedding: {
      partner1_name: guest.partner1_name,
      partner2_name: guest.partner2_name,
      wedding_date: guest.wedding_date,
      venue_name: guest.venue_name,
      custom_url: guest.custom_url,
      show_gifts: guest.show_gifts,
    }
  });
});

// Confirm attendance with phone verification
app.post("/api/public/confirm/:code", async (c) => {
  const code = c.req.param("code");
  const body = await c.req.json();
  const { phoneLast4, confirmedCompanionIds, dietaryRestrictions, message } = body;
  
  const guest = await c.env.DB.prepare(
    "SELECT id, phone FROM guests WHERE confirmation_code = ?"
  ).bind(code).first<{ id: number; phone: string }>();
  
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  
  // Verify phone last 4 digits
  if (guest.phone) {
    const actualLast4 = guest.phone.replace(/\D/g, '').slice(-4);
    if (phoneLast4 !== actualLast4) {
      return c.json({ error: "Os últimos 4 dígitos do telefone não conferem" }, 401);
    }
  }
  
  // Update guest confirmation
  await c.env.DB.prepare(`
    UPDATE guests SET 
      is_confirmed = TRUE, 
      confirmed_at = CURRENT_TIMESTAMP,
      dietary_restrictions = ?,
      message = ?,
      rsvp_status = 'confirmed',
      responded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(dietaryRestrictions || null, message || null, guest.id).run();
  
  // Update companions confirmation status
  if (confirmedCompanionIds && confirmedCompanionIds.length > 0) {
    // First reset all companions to not confirmed
    await c.env.DB.prepare(
      "UPDATE guest_companions SET is_confirmed = FALSE WHERE guest_id = ?"
    ).bind(guest.id).run();
    
    // Then confirm the selected ones
    for (const compId of confirmedCompanionIds) {
      await c.env.DB.prepare(
        "UPDATE guest_companions SET is_confirmed = TRUE WHERE id = ? AND guest_id = ?"
      ).bind(compId, guest.id).run();
    }
  }
  
  return c.json({ success: true });
});

// Decline attendance
app.post("/api/public/confirm/:code/decline", async (c) => {
  const code = c.req.param("code");
  const body = await c.req.json();
  const { phoneLast4, message } = body;
  
  const guest = await c.env.DB.prepare(
    "SELECT id, phone FROM guests WHERE confirmation_code = ?"
  ).bind(code).first<{ id: number; phone: string }>();
  
  if (!guest) {
    return c.json({ error: "Invalid confirmation code" }, 404);
  }
  
  // Verify phone last 4 digits
  if (guest.phone) {
    const actualLast4 = guest.phone.replace(/\D/g, '').slice(-4);
    if (phoneLast4 !== actualLast4) {
      return c.json({ error: "Os últimos 4 dígitos do telefone não conferem" }, 401);
    }
  }
  
  // Update guest as declined
  await c.env.DB.prepare(`
    UPDATE guests SET 
      is_confirmed = FALSE, 
      rsvp_status = 'declined',
      message = ?,
      responded_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(message || null, guest.id).run();
  
  // Mark all companions as not confirmed
  await c.env.DB.prepare(
    "UPDATE guest_companions SET is_confirmed = FALSE WHERE guest_id = ?"
  ).bind(guest.id).run();
  
  return c.json({ success: true });
});

// =====================
// DASHBOARD STATS
// =====================

// Gift Orders - fetch all orders for the wedding
app.get("/api/gift-orders", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const orders = await c.env.DB.prepare(`
    SELECT go.*, wg.name as gift_name, wg.image_url as gift_image
    FROM gift_orders go
    LEFT JOIN wedding_gifts wg ON go.gift_id = wg.id
    WHERE go.wedding_id = ?
    ORDER BY go.created_at DESC
  `).bind(wedding.id).all();

  return c.json({ orders: orders.results || [] });
});

// Get available balance (paid orders not yet converted)
app.get("/api/balance", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id, pix_key FROM weddings WHERE user_id = ?"
  ).bind(userId).first<{ id: number; pix_key: string }>();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const available = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE"
  ).bind(wedding.id).first<{ total: number }>();

  const converted = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = TRUE"
  ).bind(wedding.id).first<{ total: number }>();

  const pending = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM cash_withdrawals WHERE wedding_id = ? AND status = 'pending'"
  ).bind(wedding.id).first<{ total: number }>();

  return c.json({
    availableBalance: available?.total || 0,
    convertedTotal: converted?.total || 0,
    pendingWithdrawal: pending?.total || 0,
    pixKey: wedding.pix_key || null,
  });
});

// Get withdrawal history
app.get("/api/withdrawals", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(userId).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const withdrawals = await c.env.DB.prepare(
    "SELECT * FROM cash_withdrawals WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();

  return c.json({ withdrawals: withdrawals.results || [] });
});

// Request a cash withdrawal
app.post("/api/withdrawals", authMiddleware, async (c) => {
  const userId = c.get("user")?.id;
  const wedding = await c.env.DB.prepare(
    "SELECT id, pix_key FROM weddings WHERE user_id = ?"
  ).bind(userId).first<{ id: number; pix_key: string }>();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { amount, pixKey, pixKeyType } = await c.req.json<{
    amount: number;
    pixKey: string;
    pixKeyType: string;
  }>();

  // Check available balance
  const available = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE"
  ).bind(wedding.id).first<{ total: number }>();

  if (!available?.total || amount > available.total) {
    return c.json({ error: "Insufficient balance" }, 400);
  }

  // Create withdrawal request
  const result = await c.env.DB.prepare(`
    INSERT INTO cash_withdrawals (wedding_id, amount, pix_key, pix_key_type, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(wedding.id, amount, pixKey, pixKeyType).run();

  // Mark orders as converted (up to the withdrawal amount)
  const ordersToConvert = await c.env.DB.prepare(`
    SELECT id, amount FROM gift_orders 
    WHERE wedding_id = ? AND payment_status = 'paid' AND is_converted = FALSE
    ORDER BY created_at ASC
  `).bind(wedding.id).all<{ id: number; amount: number }>();

  let remaining = amount;
  for (const order of ordersToConvert.results || []) {
    if (remaining <= 0) break;
    await c.env.DB.prepare(`
      UPDATE gift_orders SET is_converted = TRUE, converted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(order.id).run();
    remaining -= order.amount;
  }

  return c.json({ success: true, withdrawalId: result.meta?.last_row_id });
});

// =====================
// ADMIN ROUTES
// =====================

const ADMIN_EMAILS = ["osvaldog.lfilho@gmail.com"];

// Admin middleware - checks if user is admin
const adminMiddleware = async (c: any, next: any) => {
  const user = c.get("user");
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return c.json({ error: "Unauthorized" }, 403);
  }
  await next();
};

// Admin stats
app.get("/api/admin/stats", authMiddleware, adminMiddleware, async (c) => {
  const totalWeddings = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM weddings"
  ).first<{ count: number }>();

  const publishedWeddings = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM weddings WHERE is_published = TRUE"
  ).first<{ count: number }>();

  const totalGuests = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guests"
  ).first<{ count: number }>();

  const totalGiftsValue = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE payment_status = 'paid'"
  ).first<{ total: number }>();

  const pendingWithdrawals = await c.env.DB.prepare(
    "SELECT COUNT(*) as count, SUM(amount) as total FROM cash_withdrawals WHERE status = 'pending'"
  ).first<{ count: number; total: number }>();

  return c.json({
    totalWeddings: totalWeddings?.count || 0,
    publishedWeddings: publishedWeddings?.count || 0,
    totalGuests: totalGuests?.count || 0,
    totalGiftsValue: totalGiftsValue?.total || 0,
    pendingWithdrawals: pendingWithdrawals?.count || 0,
    pendingWithdrawalsAmount: pendingWithdrawals?.total || 0,
    totalRevenue: totalGiftsValue?.total || 0,
  });
});

// Admin - list all weddings
app.get("/api/admin/weddings", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      w.*,
      (SELECT COUNT(*) FROM guests WHERE wedding_id = w.id) as guest_count,
      (SELECT COALESCE(SUM(amount), 0) FROM gift_orders WHERE wedding_id = w.id AND payment_status = 'paid') as gifts_total
    FROM weddings w
    ORDER BY w.created_at DESC
  `).all();

  return c.json({ weddings: results || [] });
});

// Admin - list all withdrawals
app.get("/api/admin/withdrawals", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT 
      cw.*,
      w.partner1_name,
      w.partner2_name
    FROM cash_withdrawals cw
    JOIN weddings w ON cw.wedding_id = w.id
    ORDER BY 
      CASE WHEN cw.status = 'pending' THEN 0 ELSE 1 END,
      cw.created_at DESC
  `).all();

  return c.json({ withdrawals: results || [] });
});

// Admin - approve withdrawal
app.post("/api/admin/withdrawals/:id/approve", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'approved', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true });
});

// Admin - reject withdrawal
app.post("/api/admin/withdrawals/:id/reject", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  // Get the withdrawal to find amounts to un-convert
  const withdrawal = await c.env.DB.prepare(
    "SELECT wedding_id, amount FROM cash_withdrawals WHERE id = ?"
  ).bind(id).first<{ wedding_id: number; amount: number }>();

  if (withdrawal) {
    // Un-convert orders (mark them as available again)
    let remaining = withdrawal.amount;
    const orders = await c.env.DB.prepare(`
      SELECT id, amount FROM gift_orders 
      WHERE wedding_id = ? AND is_converted = TRUE
      ORDER BY converted_at DESC
    `).bind(withdrawal.wedding_id).all<{ id: number; amount: number }>();

    for (const order of orders.results || []) {
      if (remaining <= 0) break;
      await c.env.DB.prepare(`
        UPDATE gift_orders SET is_converted = FALSE, converted_at = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(order.id).run();
      remaining -= order.amount;
    }
  }

  await c.env.DB.prepare(`
    UPDATE cash_withdrawals 
    SET status = 'rejected', processed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();

  return c.json({ success: true });
});

// =====================
// ADMIN - GIFT TEMPLATES MANAGEMENT
// =====================

// Get all gift list types
app.get("/api/admin/gift-list-types", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT glt.*, 
      (SELECT COUNT(*) FROM gift_templates WHERE list_type_id = glt.id) as item_count
    FROM gift_list_types glt
    ORDER BY glt.sort_order, glt.id
  `).all();
  return c.json({ listTypes: results || [] });
});

// Create a new gift list type
app.post("/api/admin/gift-list-types", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { name, description } = body;
  const slug = name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max FROM gift_list_types"
  ).first<{ max: number }>();
  
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_list_types (name, slug, description, sort_order)
    VALUES (?, ?, ?, ?)
  `).bind(name, slug, description || null, (maxOrder?.max || 0) + 1).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update a gift list type
app.put("/api/admin/gift-list-types/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, description, is_active } = body;
  
  await c.env.DB.prepare(`
    UPDATE gift_list_types 
    SET name = ?, description = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(name, description || null, is_active ? true : false, id).run();
  
  return c.json({ success: true });
});

// Delete a gift list type
app.delete("/api/admin/gift-list-types/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  // Delete associated templates and categories first
  await c.env.DB.prepare("DELETE FROM gift_templates WHERE list_type_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM gift_template_categories WHERE list_type_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM gift_list_types WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// Get all templates for a list type
app.get("/api/admin/gift-list-types/:id/templates", authMiddleware, adminMiddleware, async (c) => {
  const listTypeId = c.req.param("id");
  
  const { results: templates } = await c.env.DB.prepare(`
    SELECT * FROM gift_templates WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  
  const { results: categories } = await c.env.DB.prepare(`
    SELECT * FROM gift_template_categories WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  
  return c.json({ templates: templates || [], categories: categories || [] });
});

// Create a gift template item
app.post("/api/admin/gift-templates", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { list_type_id, name, description, price, category, image_url } = body;
  
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max FROM gift_templates WHERE list_type_id = ?"
  ).bind(list_type_id).first<{ max: number }>();
  
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_templates (list_type_id, name, description, price, category, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    list_type_id, 
    name, 
    description || null, 
    price || 0, 
    category || null, 
    image_url || null,
    (maxOrder?.max || 0) + 1
  ).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update a gift template item
app.put("/api/admin/gift-templates/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, description, price, category, image_url, is_active, sort_order } = body;
  
  await c.env.DB.prepare(`
    UPDATE gift_templates 
    SET name = ?, description = ?, price = ?, category = ?, image_url = ?, 
        is_active = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    name, 
    description || null, 
    price || 0, 
    category || null, 
    image_url || null,
    is_active !== undefined ? (is_active ? true : false) : 1,
    sort_order || 0,
    id
  ).run();
  
  return c.json({ success: true });
});

// Delete a gift template item
app.delete("/api/admin/gift-templates/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_templates WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Get categories for a list type
app.get("/api/admin/gift-list-types/:id/categories", authMiddleware, adminMiddleware, async (c) => {
  const listTypeId = c.req.param("id");
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM gift_template_categories WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  return c.json({ categories: results || [] });
});

// Create a category
app.post("/api/admin/gift-categories", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();
  const { list_type_id, name, color_class } = body;
  
  const maxOrder = await c.env.DB.prepare(
    "SELECT MAX(sort_order) as max FROM gift_template_categories WHERE list_type_id = ?"
  ).bind(list_type_id).first<{ max: number }>();
  
  const result = await c.env.DB.prepare(`
    INSERT INTO gift_template_categories (list_type_id, name, color_class, sort_order)
    VALUES (?, ?, ?, ?)
  `).bind(list_type_id, name, color_class || 'bg-gray-100 text-gray-700', (maxOrder?.max || 0) + 1).run();
  
  return c.json({ success: true, id: result.meta.last_row_id });
});

// Update a category
app.put("/api/admin/gift-categories/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const { name, color_class, sort_order } = body;
  
  await c.env.DB.prepare(`
    UPDATE gift_template_categories 
    SET name = ?, color_class = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(name, color_class || 'bg-gray-100 text-gray-700', sort_order || 0, id).run();
  
  return c.json({ success: true });
});

// Delete a category
app.delete("/api/admin/gift-categories/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_template_categories WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Public endpoint - get all active gift list types and their templates
app.get("/api/public/gift-templates", async (c) => {
  const { results: listTypes } = await c.env.DB.prepare(`
    SELECT id, name, slug, description FROM gift_list_types 
    WHERE is_active = TRUE ORDER BY sort_order, id
  `).all();
  
  const result: any[] = [];
  
  for (const lt of listTypes || []) {
    const { results: templates } = await c.env.DB.prepare(`
      SELECT id, name, description, price, category, image_url 
      FROM gift_templates WHERE list_type_id = ? AND is_active = TRUE 
      ORDER BY sort_order, id
    `).bind(lt.id).all();
    
    const { results: categories } = await c.env.DB.prepare(`
      SELECT id, name, color_class FROM gift_template_categories 
      WHERE list_type_id = ? ORDER BY sort_order, id
    `).bind(lt.id).all();
    
    result.push({
      ...lt,
      templates: templates || [],
      categories: categories || []
    });
  }
  
  return c.json({ listTypes: result });
});

// Public endpoint - get templates for a specific list type
app.get("/api/public/gift-templates/:listId", async (c) => {
  const listId = c.req.param("listId");
  
  const { results: templates } = await c.env.DB.prepare(`
    SELECT id, name, description, price, category, image_url 
    FROM gift_templates WHERE list_type_id = ? AND is_active = TRUE 
    ORDER BY sort_order, id
  `).bind(listId).all();
  
  const { results: categories } = await c.env.DB.prepare(`
    SELECT id, name, color_class FROM gift_template_categories 
    WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listId).all();
  
  return c.json({ templates: templates || [], categories: categories || [] });
});

// =====================
// PIX CONTRIBUTIONS (GRAVATA)
// =====================

// =====================
// GODPARENTS (PADRINHOS) ROUTES
// =====================

app.get("/api/godparents", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_godparents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json(results);
});

app.post("/api/godparents", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_godparents (wedding_id, name, role, description, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.role, body.description,
    body.image_url, body.sort_order || 0
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/godparents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE wedding_godparents SET
      name = ?, role = ?, description = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name, body.role, body.description, body.image_url,
    body.sort_order || 0, id
  ).run();

  return c.json({ success: true });
});

app.delete("/api/godparents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM wedding_godparents WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/api/public/wedding/:customUrl/godparents", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, role, description, image_url, sort_order FROM wedding_godparents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json({ godparents: results || [] });
});

// =====================
// PARENTS (PAIS) ROUTES
// =====================

app.get("/api/parents", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_parents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json(results);
});

app.post("/api/parents", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_parents (wedding_id, name, role, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.role, body.image_url, body.sort_order || 0
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/parents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE wedding_parents SET
      name = ?, role = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name, body.role, body.image_url, body.sort_order || 0, id
  ).run();

  return c.json({ success: true });
});

app.delete("/api/parents/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM wedding_parents WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/api/public/wedding/:customUrl/parents", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, role, image_url, sort_order FROM wedding_parents WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json({ parents: results || [] });
});

// =====================
// ACCOMMODATIONS (ESTADIA) ROUTES
// =====================

app.get("/api/accommodations", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wedding_accommodations WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json(results);
});

app.post("/api/accommodations", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO wedding_accommodations (wedding_id, name, description, address, phone, website, price_range, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    wedding.id, body.name, body.description, body.address,
    body.phone, body.website, body.price_range, body.image_url, body.sort_order || 0
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

app.put("/api/accommodations/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(`
    UPDATE wedding_accommodations SET
      name = ?, description = ?, address = ?, phone = ?, website = ?,
      price_range = ?, image_url = ?, sort_order = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    body.name, body.description, body.address, body.phone,
    body.website, body.price_range, body.image_url, body.sort_order || 0, id
  ).run();

  return c.json({ success: true });
});

app.delete("/api/accommodations/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM wedding_accommodations WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

app.get("/api/public/wedding/:customUrl/accommodations", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first();

  if (!wedding) {
    return c.json({ error: "Wedding not found" }, 404);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT id, name, description, address, phone, website, price_range, image_url, sort_order FROM wedding_accommodations WHERE wedding_id = ? ORDER BY sort_order ASC, id ASC"
  ).bind(wedding.id).all();

  return c.json({ accommodations: results || [] });
});


// List contributions for the user's wedding
app.get("/api/contributions", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) return c.json([]);

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM pix_contributions WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  return c.json(results || []);
});

// Mark contribution as paid
app.put("/api/contributions/:id/confirm", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare(`
    UPDATE pix_contributions 
    SET payment_status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(id).run();
  return c.json({ success: true });
});

// Delete a contribution
app.delete("/api/contributions/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM pix_contributions WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Public - Get contributions for a wedding (approved only)
app.get("/api/public/wedding/:customUrl/contributions", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) return c.json({ contributions: [] });

  const { results } = await c.env.DB.prepare(`
    SELECT contributor_name, amount, message, is_anonymous, created_at
    FROM pix_contributions 
    WHERE wedding_id = ? AND payment_status = 'paid'
    ORDER BY created_at DESC
  `).bind(wedding.id).all();
  
  return c.json({ contributions: results || [] });
});

// Public - Submit a contribution
app.post("/api/public/wedding/:customUrl/contributions", async (c) => {
  const customUrl = c.req.param("customUrl");
  const body = await c.req.json();
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  const result = await c.env.DB.prepare(`
    INSERT INTO pix_contributions (wedding_id, contributor_name, amount, message, is_anonymous, payment_status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).bind(
    wedding.id,
    body.contributor_name,
    body.amount,
    body.message || null,
    body.is_anonymous ? true : false
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// Public: Submit gift order with personalized card
app.post("/api/public/gift-order", async (c) => {
  const body = await c.req.json();
  
  if (!body.wedding_id || !body.gift_id || !body.guest_name) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO gift_orders (
      wedding_id, gift_id, guest_name, guest_email, amount, message,
      card_type, card_sender_name, card_message, card_price,
      payment_status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).bind(
    body.wedding_id,
    body.gift_id,
    body.guest_name,
    body.guest_email || null,
    body.amount || 0,
    body.message || null,
    body.card_type || 'gratis',
    body.card_sender_name || body.guest_name,
    body.card_message || null,
    body.card_price || 0
  ).run();

  return c.json({ success: true, id: result.meta.last_row_id });
});

// =====================
// GUEST PHOTOS (Collaborative Gallery)
// =====================

// Public: Get approved guest photos
app.get("/api/public/wedding/:customUrl/guest-photos", async (c) => {
  const customUrl = c.req.param("customUrl");
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ?"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  const { results } = await c.env.DB.prepare(`
    SELECT id, guest_name, filename, storage_key, caption, created_at
    FROM guest_photos 
    WHERE wedding_id = ? AND is_approved = TRUE
    ORDER BY created_at DESC
  `).bind(wedding.id).all();

  return c.json({ photos: results });
});

// Public: Upload guest photo (single file per request)
app.post("/api/public/wedding/:customUrl/guest-photos", async (c) => {
  const customUrl = c.req.param("customUrl");
  
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE custom_url = ? AND is_published = TRUE"
  ).bind(customUrl).first<{ id: number }>();
  
  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  const formData = await c.req.formData();
  const guestName = formData.get("guest_name") as string | null;
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!guestName || guestName.trim() === "") {
    return c.json({ error: "Guest name is required" }, 400);
  }

  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only JPEG, PNG, WebP and GIF allowed." }, 400);
  }

  if (file.size > 10 * 1024 * 1024) {
    return c.json({ error: "File too large. Maximum 10MB." }, 400);
  }

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const storageKey = `weddings/${wedding.id}/guest-photos/${timestamp}-${randomId}-${file.name}`;

  // Convert to base64 and store in Neon
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  await c.env.DB.prepare(
    "INSERT INTO files (key, data, content_type, size) VALUES (?, ?, ?, ?)"
  ).bind(storageKey, base64, file.type, file.size).run();

  const result = await c.env.DB.prepare(`
    INSERT INTO guest_photos (wedding_id, guest_name, filename, storage_key, caption, is_approved)
    VALUES (?, ?, ?, ?, ?, NULL)
  `).bind(wedding.id, guestName.trim(), file.name, storageKey, caption || null).run();

  return c.json({ 
    success: true, 
    id: result.meta.last_row_id,
    filename: file.name 
  });
});

// Auth: Get all guest photos for moderation
app.get("/api/guest-photos", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();

  if (!wedding) return c.json({ photos: [] });

  const { results } = await c.env.DB.prepare(`
    SELECT id, guest_name, filename, storage_key, caption, is_approved, created_at
    FROM guest_photos 
    WHERE wedding_id = ?
    ORDER BY created_at DESC
  `).bind(wedding.id).all();

  return c.json({ photos: results });
});

// Auth: Approve/reject guest photo
app.put("/api/guest-photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  const body = await c.req.json();

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();

  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  // Verify photo belongs to this wedding
  const photo = await c.env.DB.prepare(
    "SELECT id FROM guest_photos WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).first();

  if (!photo) return c.json({ error: "Photo not found" }, 404);

  await c.env.DB.prepare(`
    UPDATE guest_photos SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `).bind(body.is_approved, id).run();

  return c.json({ success: true });
});

// Auth: Delete guest photo
app.delete("/api/guest-photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();

  if (!wedding) return c.json({ error: "Wedding not found" }, 404);

  const photo = await c.env.DB.prepare(
    "SELECT storage_key FROM guest_photos WHERE id = ? AND wedding_id = ?"
  ).bind(id, wedding.id).first<{ storage_key: string }>();

  if (!photo) return c.json({ error: "Photo not found" }, 404);

  // Delete from files table
  await c.env.DB.prepare("DELETE FROM files WHERE key = ?").bind(photo.storage_key).run();

  // Delete from database
  await c.env.DB.prepare("DELETE FROM guest_photos WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// =====================
// DASHBOARD STATS
// =====================

app.get("/api/dashboard/stats", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first();
  
  if (!wedding) {
    return c.json({
      totalGuests: 0,
      confirmedGuests: 0,
      totalGifts: 0,
      totalMessages: 0,
      totalAmount: 0,
    });
  }

  // Count guests from guests table
  const guestsCount = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN is_confirmed = TRUE THEN 1 ELSE 0 END) as confirmed
    FROM guests WHERE wedding_id = ?
  `).bind(wedding.id).first<{ total: number; confirmed: number }>();

  // Count companions from guest_companions table
  const companionsCount = await c.env.DB.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN gc.is_confirmed = TRUE THEN 1 ELSE 0 END) as confirmed
    FROM guest_companions gc
    INNER JOIN guests g ON gc.guest_id = g.id
    WHERE g.wedding_id = ?
  `).bind(wedding.id).first<{ total: number; confirmed: number }>();

  const guestsStats = {
    total: (guestsCount?.total || 0) + (companionsCount?.total || 0),
    confirmed: (guestsCount?.confirmed || 0) + (companionsCount?.confirmed || 0)
  };

  const giftsCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM wedding_gifts WHERE wedding_id = ?"
  ).bind(wedding.id).first();

  const messagesCount = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM guest_messages WHERE wedding_id = ?"
  ).bind(wedding.id).first();

  const ordersSum = await c.env.DB.prepare(
    "SELECT SUM(amount) as total FROM gift_orders WHERE wedding_id = ? AND payment_status = 'paid'"
  ).bind(wedding.id).first();

  return c.json({
    totalGuests: guestsStats?.total || 0,
    confirmedGuests: guestsStats?.confirmed || 0,
    totalGifts: giftsCount?.count || 0,
    totalMessages: messagesCount?.count || 0,
    totalAmount: ordersSum?.total || 0,
  });
});

export default app;
