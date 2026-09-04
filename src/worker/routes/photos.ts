import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// PHOTOS ROUTES (Dashboard)
// =====================

// List photos for the user's wedding
r.get("/api/photos", authMiddleware, async (c) => {
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
r.post("/api/photos", authMiddleware, async (c) => {
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
r.put("/api/photos/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
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
  values.push(id, weddingId);

  const res = await c.env.DB.prepare(
    `UPDATE wedding_photos SET ${updates.join(", ")} WHERE id = ? AND wedding_id = ?`
  ).bind(...values).run();

  if (!res.meta.changes) return c.json({ error: "Photo not found" }, 404);
  return c.json({ success: true });
});

// Delete a photo
r.delete("/api/photos/:id", authMiddleware, async (c) => {
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
r.post("/api/upload", authMiddleware, async (c) => {
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
r.get("/api/files/:key{.+}", async (c) => {
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

export default r;
