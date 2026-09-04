import { Hono } from "hono";
import { NeonDB } from "./neon-db";
import { SupabaseR2 } from "./supabase-r2";
import { createClient } from "@supabase/supabase-js";
import type { AppEnv } from "./lib/types";
import authRoutes from "./routes/auth";
import ogRoutes from "./routes/og";
import weddingsRoutes from "./routes/weddings";
import guestsRoutes from "./routes/guests";
import tablesRoutes from "./routes/tables";
import tasksRoutes from "./routes/tasks";
import budgetRoutes from "./routes/budget";
import giftsRoutes from "./routes/gifts";
import messagesRoutes from "./routes/messages";
import photosRoutes from "./routes/photos";
import storyRoutes from "./routes/story";
import publicWeddingRoutes from "./routes/public-wedding";
import confirmRoutes from "./routes/confirm";
import paymentsRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import giftTemplatesRoutes from "./routes/gift-templates";
import godparentsRoutes from "./routes/godparents";
import parentsRoutes from "./routes/parents";
import accommodationsRoutes from "./routes/accommodations";
import contributionsRoutes from "./routes/contributions";
import guestPhotosRoutes from "./routes/guest-photos";
import dashboardRoutes from "./routes/dashboard";

const app = new Hono<AppEnv>();

// Initialize Neon DB + Supabase Storage
app.use("*", async (c, next) => {
  const neonUrl = (c.env as any)?.NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || '';
  const supaUrl = (c.env as any)?.SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supaKey = (c.env as any)?.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

  if (neonUrl) {
    if (!c.env) (c as any).env = {};
    (c.env as any).DB = new NeonDB(neonUrl);
  }

  // Supabase Storage for file uploads
  if (supaUrl && supaKey) {
    const supabase = createClient(supaUrl, supaKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    (c.env as any).R2_BUCKET = new SupabaseR2(supabase);
  }

  await next();
});


// =====================
// ROUTES
// =====================
app.route("/", authRoutes);
app.route("/", ogRoutes);
app.route("/", weddingsRoutes);
app.route("/", guestsRoutes);
app.route("/", tablesRoutes);
app.route("/", tasksRoutes);
app.route("/", budgetRoutes);
app.route("/", giftsRoutes);
app.route("/", messagesRoutes);
app.route("/", photosRoutes);
app.route("/", storyRoutes);
app.route("/", publicWeddingRoutes);
app.route("/", confirmRoutes);
app.route("/", paymentsRoutes);
app.route("/", adminRoutes);
app.route("/", giftTemplatesRoutes);
app.route("/", godparentsRoutes);
app.route("/", parentsRoutes);
app.route("/", accommodationsRoutes);
app.route("/", contributionsRoutes);
app.route("/", guestPhotosRoutes);
app.route("/", dashboardRoutes);

export default app;
