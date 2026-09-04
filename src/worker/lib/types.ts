import type { NeonDB } from "../neon-db";
import type { SupabaseR2 } from "../supabase-r2";

// Local Env type (no Cloudflare dependency)
export interface AppEnv {
  Variables: {
    user: any;
  };
  Bindings: {
    DB: NeonDB;
    R2_BUCKET: SupabaseR2;
    NEON_DATABASE_URL: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_KEY: string;
  };
}
