import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// WEDDING ROUTES
// =====================

r.get("/api/wedding", authMiddleware, async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    "SELECT * FROM weddings WHERE user_id = ? LIMIT 1"
  ).bind(user!.id).first();
  return c.json(result || null);
});

// Toggle publish status
r.post("/api/wedding/publish", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const isPublished = body.is_published ? true : false;
  
  await c.env.DB.prepare(`
    UPDATE weddings SET is_published = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(isPublished, user!.id).run();
  
  return c.json({ success: true, is_published: isPublished });
});

r.post("/api/wedding", authMiddleware, async (c) => {
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
r.put("/api/wedding/theme", authMiddleware, async (c) => {
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
r.put("/api/wedding/settings", authMiddleware, async (c) => {
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

export default r;
