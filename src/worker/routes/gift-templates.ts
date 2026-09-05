import { Hono } from "hono";
import type { AppEnv } from "../lib/types";
import { adminMiddleware } from "../lib/admin";

const r = new Hono<AppEnv>();
// =====================
// ADMIN - GIFT TEMPLATES MANAGEMENT
// =====================

// Get all gift list types
r.get("/api/admin/gift-list-types", adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(`
    SELECT glt.*, 
      (SELECT COUNT(*) FROM gift_templates WHERE list_type_id = glt.id) as item_count
    FROM gift_list_types glt
    ORDER BY glt.sort_order, glt.id
  `).all();
  return c.json({ listTypes: results || [] });
});

// Create a new gift list type
r.post("/api/admin/gift-list-types", adminMiddleware, async (c) => {
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
r.put("/api/admin/gift-list-types/:id", adminMiddleware, async (c) => {
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
r.delete("/api/admin/gift-list-types/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  
  // Delete associated templates and categories first
  await c.env.DB.prepare("DELETE FROM gift_templates WHERE list_type_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM gift_template_categories WHERE list_type_id = ?").bind(id).run();
  await c.env.DB.prepare("DELETE FROM gift_list_types WHERE id = ?").bind(id).run();
  
  return c.json({ success: true });
});

// Get all templates for a list type
r.get("/api/admin/gift-list-types/:id/templates", adminMiddleware, async (c) => {
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
r.post("/api/admin/gift-templates", adminMiddleware, async (c) => {
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
r.put("/api/admin/gift-templates/:id", adminMiddleware, async (c) => {
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
r.delete("/api/admin/gift-templates/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_templates WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Get categories for a list type
r.get("/api/admin/gift-list-types/:id/categories", adminMiddleware, async (c) => {
  const listTypeId = c.req.param("id");
  const { results } = await c.env.DB.prepare(`
    SELECT * FROM gift_template_categories WHERE list_type_id = ? ORDER BY sort_order, id
  `).bind(listTypeId).all();
  return c.json({ categories: results || [] });
});

// Create a category
r.post("/api/admin/gift-categories", adminMiddleware, async (c) => {
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
r.put("/api/admin/gift-categories/:id", adminMiddleware, async (c) => {
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
r.delete("/api/admin/gift-categories/:id", adminMiddleware, async (c) => {
  const id = c.req.param("id");
  await c.env.DB.prepare("DELETE FROM gift_template_categories WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// Public endpoint - get all active gift list types and their templates
r.get("/api/public/gift-templates", async (c) => {
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
r.get("/api/public/gift-templates/:listId", async (c) => {
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

export default r;
