import { Hono } from "hono";
import { authMiddleware, handleRegister, handleLogin, handleGetUser, handleLogout } from "../local-auth-backend";
import type { AppEnv } from "../lib/types";

const r = new Hono<AppEnv>();
r.post("/api/auth/register", handleRegister);
r.post("/api/auth/login", handleLogin);
r.get("/api/users/me", authMiddleware, handleGetUser);
r.get("/api/logout", handleLogout);

export default r;
