import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";
import type { NeonDB } from "../neon-db";

const r = new Hono<AppEnv>();
// =====================
// GUESTS ROUTES
// =====================

interface CompanionInput {
  name?: string;
  is_child?: boolean | number;
  is_confirmed?: boolean | number;
  dietary_restrictions?: string | null;
}

/** Normalize the mixed string|object companion payload the client sends. */
function normalizeCompanions(raw: unknown): {
  name: string;
  isChild: boolean;
  isConfirmed: boolean;
  diet: string | null;
}[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((comp: string | CompanionInput) => {
      const isObj = typeof comp === "object" && comp !== null;
      const name = (isObj ? comp.name : comp) || "";
      return {
        name: String(name).trim(),
        isChild: isObj ? !!comp.is_child : false,
        isConfirmed: isObj ? !!comp.is_confirmed : false,
        diet: isObj && comp.dietary_restrictions ? String(comp.dietary_restrictions).trim() : null,
      };
    })
    .filter((comp) => comp.name.length > 0);
}

/** Insert one companion; tolerate a DB where dietary_restrictions isn't migrated yet. */
async function insertCompanion(
  db: NeonDB,
  guestId: number | string,
  comp: { name: string; isChild: boolean; isConfirmed: boolean; diet: string | null },
) {
  try {
    await db
      .prepare(
        `INSERT INTO guest_companions (guest_id, name, is_confirmed, is_child, dietary_restrictions)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(guestId, comp.name, comp.isConfirmed, comp.isChild, comp.diet)
      .run();
  } catch {
    await db
      .prepare(
        `INSERT INTO guest_companions (guest_id, name, is_confirmed, is_child)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(guestId, comp.name, comp.isConfirmed, comp.isChild)
      .run();
  }
}

r.get("/api/guests", authMiddleware, async (c) => {
  const user = c.get("user");
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user!.id).first<{ id: number }>();
  
  if (!wedding) return c.json([]);

  const { results: guests } = await c.env.DB.prepare(
    "SELECT * FROM guests WHERE wedding_id = ? ORDER BY created_at DESC"
  ).bind(wedding.id).all();
  
  // Fetch companions for all guests (coerce ids to integers before interpolating)
  const guestIds = (guests || [])
    .map((g: any) => Number(g.id))
    .filter((n: number) => Number.isInteger(n));
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

r.post("/api/guests", authMiddleware, async (c) => {
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

  const companions = normalizeCompanions(body.companions);
  // "Pessoas" = the guest + everyone they bring. Trust the companion list over
  // whatever guests_count the client sent.
  const guestsCount = Math.max(Number(body.guests_count) || 1, 1 + companions.length);

  // RETURNING id — a plain INSERT gives back no rows on Postgres, so
  // result.meta.last_row_id was 0 and every companion was orphaned on guest_id 0.
  const inserted = await c.env.DB.prepare(`
    INSERT INTO guests (wedding_id, name, email, phone, guests_count, label, confirmation_code, is_child)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `).bind(
    wedding.id, body.name, body.email, body.phone,
    guestsCount, body.label || null, confirmationCode, body.is_child ? true : false
  ).first<{ id: number }>();

  const guestId = inserted?.id;
  if (!guestId) return c.json({ error: "Failed to create guest" }, 500);

  for (const comp of companions) {
    await insertCompanion(c.env.DB, guestId, comp);
  }

  return c.json({ success: true, id: guestId, confirmation_code: confirmationCode });
});

r.put("/api/guests/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();

  const companions = normalizeCompanions(body.companions);
  const guestsCount = Math.max(Number(body.guests_count) || 1, 1 + companions.length);

  const res = await c.env.DB.prepare(`
    UPDATE guests SET
      name = ?, email = ?, phone = ?, guests_count = ?, rsvp_status = ?,
      dietary_restrictions = ?, label = ?, is_child = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND wedding_id = ?
  `).bind(
    body.name, body.email, body.phone, guestsCount,
    body.rsvp_status, body.dietary_restrictions, body.label || null, body.is_child ? true : false, id, weddingId
  ).run();

  if (!res.meta.changes) return c.json({ error: "Guest not found" }, 404);

  // Update companions: delete old ones and insert new
  await c.env.DB.prepare("DELETE FROM guest_companions WHERE guest_id = ?").bind(id).run();
  for (const comp of companions) {
    await insertCompanion(c.env.DB, id, comp);
  }

  return c.json({ success: true });
});

r.delete("/api/guests/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

  // Confirm the guest belongs to this wedding before touching anything
  const guest = await c.env.DB.prepare(
    "SELECT id FROM guests WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).first();
  if (!guest) return c.json({ error: "Guest not found" }, 404);

  // Delete companions first (no cascade), then the guest
  await c.env.DB.prepare("DELETE FROM guest_companions WHERE guest_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM guests WHERE id = ? AND wedding_id = ?").bind(id, weddingId).run();
  return c.json({ success: true });
});

// Update guest table assignment
r.put("/api/guests/:id/table", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();

  // If a table is given, it must also belong to this wedding
  if (body.table_id) {
    const table = await c.env.DB.prepare(
      "SELECT id FROM wedding_tables WHERE id = ? AND wedding_id = ?"
    ).bind(body.table_id, weddingId).first();
    if (!table) return c.json({ error: "Table not found" }, 404);
  }

  const res = await c.env.DB.prepare(`
    UPDATE guests SET table_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?
  `).bind(body.table_id, id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Guest not found" }, 404);
  return c.json({ success: true });
});

export default r;
