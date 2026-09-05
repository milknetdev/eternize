import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

export const ADMIN_COOKIE_NAME = "eternize_admin";

/**
 * Admin access is a standalone password gate (env ADMIN_PASSWORD) — completely
 * separate from the couple accounts. A valid admin session is a row in the
 * sessions table under the reserved user id "__admin__", carried by the
 * eternize_admin cookie.
 */
export async function adminMiddleware(c: Context, next: Next) {
  const token = getCookie(c, ADMIN_COOKIE_NAME);
  if (!token) return c.json({ error: "Admin não autenticado" }, 401);

  const db = (c.env as any).DB;
  const row = await db
    .prepare(
      "SELECT 1 AS ok FROM sessions WHERE token = ? AND user_id = '__admin__' AND expires_at > NOW()",
    )
    .bind(token)
    .first();
  if (!row) return c.json({ error: "Sessão admin expirada" }, 401);

  c.set("user", { id: "__admin__", email: "admin", name: "Admin" });
  await next();
}
