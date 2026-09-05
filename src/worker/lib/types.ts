import type { NeonDB } from "../neon-db";

// Local Env type (no Cloudflare dependency)
export interface AppEnv {
  Variables: {
    user: any;
    impersonating?: boolean;
  };
  Bindings: {
    DB: NeonDB;
    NEON_DATABASE_URL: string;
  };
}
