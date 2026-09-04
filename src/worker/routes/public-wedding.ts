import { Hono } from "hono";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// PUBLIC ROUTES (for guests)
// =====================

// Get wedding by custom URL
r.get("/api/public/wedding/:customUrl", async (c) => {
  const customUrl = c.req.param("customUrl");
  const wedding = await c.env.DB.prepare(`
    SELECT id, partner1_name, partner2_name, wedding_date, venue_name, venue_address, pix_key, custom_url,
           template_id, theme_primary_color, theme_secondary_color, theme_accent_color, 
           theme_background_color, theme_text_color, theme_heading_font, theme_body_font, theme_layout,
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
r.get("/api/public/wedding/:customUrl/gifts", async (c) => {
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
r.get("/api/public/wedding/:customUrl/photos", async (c) => {
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
r.get("/api/public/wedding/:customUrl/messages", async (c) => {
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
r.post("/api/public/wedding/:customUrl/rsvp", async (c) => {
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
r.post("/api/public/wedding/:customUrl/messages", async (c) => {
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

export default r;
