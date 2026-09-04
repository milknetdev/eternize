import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
// =====================
// GUEST PHOTOS (Collaborative Gallery)
// =====================

// Public: Get approved guest photos
r.get("/api/public/wedding/:customUrl/guest-photos", async (c) => {
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
r.post("/api/public/wedding/:customUrl/guest-photos", async (c) => {
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
r.get("/api/guest-photos", authMiddleware, async (c) => {
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
r.put("/api/guest-photos/:id", authMiddleware, async (c) => {
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
r.delete("/api/guest-photos/:id", authMiddleware, async (c) => {
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

export default r;
