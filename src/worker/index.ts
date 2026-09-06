import { Hono } from "hono";
import { NeonDB } from "./neon-db";
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
import adminAuthRoutes from "./routes/admin-auth";
import adminRoutes from "./routes/admin";
import supportRoutes from "./routes/support";
import giftTemplatesRoutes from "./routes/gift-templates";
import godparentsRoutes from "./routes/godparents";
import parentsRoutes from "./routes/parents";
import accommodationsRoutes from "./routes/accommodations";
import contributionsRoutes from "./routes/contributions";
import guestPhotosRoutes from "./routes/guest-photos";
import dashboardRoutes from "./routes/dashboard";
import platformRoutes from "./routes/platform";

const app = new Hono<AppEnv>();

// Attach the Neon DB handle to every request.
app.use("*", async (c, next) => {
  const neonUrl = (c.env as any)?.NEON_DATABASE_URL || process.env.NEON_DATABASE_URL || '';
  if (neonUrl) {
    if (!c.env) (c as any).env = {};
    (c.env as any).DB = new NeonDB(neonUrl);
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
app.route("/", adminAuthRoutes);
app.route("/", adminRoutes);
app.route("/", supportRoutes);
app.route("/", giftTemplatesRoutes);
app.route("/", godparentsRoutes);
app.route("/", parentsRoutes);
app.route("/", accommodationsRoutes);
app.route("/", contributionsRoutes);
app.route("/", guestPhotosRoutes);
app.route("/", dashboardRoutes);
app.route("/", platformRoutes);

export default app;
