import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// EXPENSES/BUDGET ROUTES
// =====================

r.get("/api/budget", authMiddleware, async (c) => {
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

r.put("/api/budget", authMiddleware, async (c) => {
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

r.post("/api/expenses", authMiddleware, async (c) => {
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

r.put("/api/expenses/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const { name, description, category, vendor_name, estimated_amount, paid_amount, is_paid, due_date, notes } = body;

  const paidAt = is_paid ? new Date().toISOString() : null;

  const res = await c.env.DB.prepare(
    `UPDATE wedding_expenses SET
     name = ?, description = ?, category = ?, vendor_name = ?, estimated_amount = ?, paid_amount = ?, is_paid = ?, due_date = ?, paid_at = ?, notes = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND wedding_id = ?`
  ).bind(name, description || null, category || null, vendor_name || null, estimated_amount, paid_amount || 0, is_paid ? true : false, due_date || null, paidAt, notes || null, id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Expense not found" }, 404);
  return c.json({ success: true });
});

r.delete("/api/expenses/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_expenses WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Expense not found" }, 404);
  return c.json({ success: true });
});

r.post("/api/expenses/seed", authMiddleware, async (c) => {
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

export default r;
