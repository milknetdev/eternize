import { Hono } from "hono";
import { authMiddleware } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";
import { getWeddingId } from "../lib/ownership";

const r = new Hono<AppEnv>();
// =====================
// TASKS ROUTES
// =====================

r.get("/api/tasks", authMiddleware, async (c) => {
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

r.post("/api/tasks", authMiddleware, async (c) => {
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

r.put("/api/tasks/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);
  const body = await c.req.json();
  const { title, description, category, due_date, is_completed } = body;

  const completedAt = is_completed ? new Date().toISOString() : null;

  const res = await c.env.DB.prepare(
    `UPDATE wedding_tasks SET
     title = ?, description = ?, category = ?, due_date = ?, is_completed = ?, completed_at = ?,
     updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND wedding_id = ?`
  ).bind(title, description || null, category || null, due_date || null, is_completed ? true : false, completedAt, id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Task not found" }, 404);
  return c.json({ success: true });
});

r.put("/api/tasks/:id/toggle", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

  // Get current status (scoped to this wedding)
  const task = await c.env.DB.prepare(
    "SELECT is_completed FROM wedding_tasks WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).first();
  if (!task) return c.json({ error: "Task not found" }, 404);

  const newStatus = task.is_completed ? false : true;
  const completedAt = newStatus ? new Date().toISOString() : null;

  await c.env.DB.prepare(
    `UPDATE wedding_tasks SET is_completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND wedding_id = ?`
  ).bind(newStatus, completedAt, id, weddingId).run();

  return c.json({ success: true, is_completed: newStatus });
});

r.delete("/api/tasks/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const weddingId = await getWeddingId(c);
  if (!weddingId) return c.json({ error: "Wedding not found" }, 404);

  const res = await c.env.DB.prepare(
    "DELETE FROM wedding_tasks WHERE id = ? AND wedding_id = ?"
  ).bind(id, weddingId).run();

  if (!res.meta.changes) return c.json({ error: "Task not found" }, 404);
  return c.json({ success: true });
});

r.post("/api/tasks/seed", authMiddleware, async (c) => {
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

export default r;
