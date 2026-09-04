import type { Context, Next } from "hono";

export const ADMIN_EMAILS = ["osvaldog.lfilho@gmail.com"];

// Admin middleware - checks if user is admin
export const adminMiddleware = async (c: Context, next: Next) => {
  const user = c.get("user");
  if (!user || !ADMIN_EMAILS.includes(user.email)) {
    return c.json({ error: "Unauthorized" }, 403);
  }
  await next();
};
