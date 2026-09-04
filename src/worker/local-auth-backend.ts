import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import * as bcrypt from "bcryptjs";

export const SESSION_COOKIE_NAME = "eternize_session";

function generateId(): string {
  return "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

function generateToken(): string {
  // Cryptographically strong 256-bit session token (Math.random() is predictable).
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let result = "";
  for (const b of bytes) result += b.toString(16).padStart(2, "0");
  return result;
}

// =====================
// AUTH MIDDLEWARE
// =====================

export async function authMiddleware(c: Context, next: Next) {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return c.json({ error: "Não autenticado" }, 401);
  }

  const db = (c.env as any).DB;
  if (!db) {
    return c.json({ error: "Banco de dados não configurado" }, 500);
  }

  // Look up session in database
  const session = await db.prepare(
    "SELECT user_id, email, name FROM sessions WHERE token = ? AND expires_at > NOW()"
  ).bind(sessionToken).first() as { user_id: string; email: string; name: string } | null;

  if (!session) {
    return c.json({ error: "Sessão expirada ou inválida" }, 401);
  }

  c.set("user", { id: session.user_id, email: session.email, name: session.name });

  await next();
}

// =====================
// CREATE SESSION (helper)
// =====================

async function createSession(db: any, userId: string, email: string, name: string, c: Context) {
  const token = generateToken();

  // Store session in database (expires in 60 days)
  await db.prepare(
    "INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES (?, ?, ?, ?, NOW() + INTERVAL '60 days')"
  ).bind(token, userId, email, name).run();

  setCookie(c, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return token;
}

// =====================
// REGISTER
// =====================

export async function handleRegister(c: Context) {
  const body = await c.req.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return c.json({ error: "Nome, email e senha são obrigatórios" }, 400);
  }

  if (password.length < 6) {
    return c.json({ error: "A senha deve ter pelo menos 6 caracteres" }, 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: "Email inválido" }, 400);
  }

  const db = (c.env as any).DB;
  if (!db) {
    return c.json({ error: "Banco de dados não configurado" }, 500);
  }

  // Check if user already exists
  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase().trim()).first();
  if (existing) {
    return c.json({ error: "Este email já está cadastrado" }, 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = generateId();

  await db.prepare(
    "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)"
  ).bind(userId, email.toLowerCase().trim(), passwordHash, name.trim()).run();

  await createSession(db, userId, email.toLowerCase().trim(), name.trim(), c);

  return c.json({ success: true, user: { id: userId, email: email.toLowerCase().trim(), name: name.trim() } }, 201);
}

// =====================
// LOGIN
// =====================

export async function handleLogin(c: Context) {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "Email e senha são obrigatórios" }, 400);
  }

  const db = (c.env as any).DB;
  if (!db) {
    return c.json({ error: "Banco de dados não configurado" }, 500);
  }

  const user = await db.prepare(
    "SELECT id, email, password_hash, name FROM users WHERE email = ?"
  ).bind(email.toLowerCase().trim()).first() as {
    id: string;
    email: string;
    password_hash: string;
    name: string;
  } | null;

  if (!user) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return c.json({ error: "Email ou senha incorretos" }, 401);
  }

  await createSession(db, user.id, user.email, user.name, c);

  return c.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
}

// =====================
// GET CURRENT USER
// =====================

export async function handleGetUser(c: Context) {
  return c.json(c.get("user"));
}

// =====================
// LOGOUT
// =====================

export async function handleLogout(c: Context) {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  const db = (c.env as any).DB;

  if (sessionToken && db) {
    await db.prepare("DELETE FROM sessions WHERE token = ?").bind(sessionToken).run();
  }

  setCookie(c, SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true });
}
