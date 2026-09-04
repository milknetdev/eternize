import type { Context } from "hono";
import type { AppEnv } from "./types";

/**
 * Resolves the wedding id owned by the authenticated user.
 * Every mutation on a wedding-scoped resource must be constrained to this id
 * (WHERE ... AND wedding_id = ?) so one couple can never touch another's data.
 * Returns null when there is no authenticated user or no wedding yet.
 */
export async function getWeddingId(c: Context<AppEnv>): Promise<number | null> {
  const user = c.get("user");
  if (!user) return null;
  const wedding = await c.env.DB.prepare(
    "SELECT id FROM weddings WHERE user_id = ?"
  ).bind(user.id).first<{ id: number }>();
  return wedding?.id ?? null;
}
