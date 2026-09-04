import { Hono } from "hono";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// PUBLIC GUEST CONFIRMATION
// =====================

// Find guest by phone last 4 digits
r.post("/api/public/wedding/:customUrl/find-guest", async (c) => {
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
r.get("/api/public/confirm/:code", async (c) => {
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
r.post("/api/public/confirm/:code", async (c) => {
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
r.post("/api/public/confirm/:code/decline", async (c) => {
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

export default r;
