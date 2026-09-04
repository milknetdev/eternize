import { PGlite } from "@electric-sql/pglite";

/**
 * D1 / NeonDB-shaped adapter backed by an in-memory PGlite database.
 * Mirrors the surface used by the worker: prepare().bind().first()/all()/run().
 * `run().meta.changes` returns the real affected-row count, exactly like the
 * production NeonDB adapter after the IDOR fix — that is what the 404 guards rely on.
 */
class TestStatement {
  private params: unknown[] = [];

  constructor(private pg: PGlite, private sql: string) {}

  bind(...params: unknown[]): TestStatement {
    this.params = params;
    return this;
  }

  private async exec() {
    let i = 0;
    const pgSql = this.sql.replace(/\?/g, () => `$${++i}`);
    return this.pg.query<Record<string, unknown>>(pgSql, this.params);
  }

  async first<T = unknown>(column?: string): Promise<T | null> {
    const { rows } = await this.exec();
    if (!rows.length) return null;
    return (column ? rows[0][column] : rows[0]) as T;
  }

  async all<T = unknown>(): Promise<{ results: T[] }> {
    const { rows } = await this.exec();
    return { results: rows as T[] };
  }

  async run() {
    const res = await this.exec();
    return {
      success: true,
      meta: {
        last_row_id: (res.rows[0]?.id as number) ?? 0,
        changes: res.affectedRows ?? 0,
      },
    };
  }
}

export class TestDB {
  constructor(private pg: PGlite) {}
  prepare(sql: string) {
    return new TestStatement(this.pg, sql);
  }
}

/** Just the tables the worker tests touch — faithful to neon_migration.sql. */
const SCHEMA = `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE weddings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  partner1_name TEXT,
  partner2_name TEXT,
  wedding_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  custom_url TEXT UNIQUE,
  pix_key TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  template_id TEXT,
  theme_primary_color TEXT,
  theme_secondary_color TEXT,
  theme_accent_color TEXT,
  theme_background_color TEXT,
  theme_text_color TEXT,
  theme_heading_font TEXT,
  theme_body_font TEXT,
  show_story BOOLEAN DEFAULT TRUE,
  show_gallery BOOLEAN DEFAULT TRUE,
  show_timeline BOOLEAN DEFAULT TRUE,
  show_location BOOLEAN DEFAULT TRUE,
  show_dresscode BOOLEAN DEFAULT TRUE,
  show_gifts BOOLEAN DEFAULT TRUE,
  show_rsvp BOOLEAN DEFAULT TRUE,
  show_messages BOOLEAN DEFAULT TRUE,
  show_godparents BOOLEAN DEFAULT TRUE,
  show_parents BOOLEAN DEFAULT TRUE,
  show_accommodations BOOLEAN DEFAULT TRUE,
  hero_image_key TEXT,
  hero_style TEXT DEFAULT 'centered',
  our_story TEXT,
  ceremony_time TEXT,
  ceremony_venue TEXT,
  reception_time TEXT,
  reception_venue TEXT,
  dress_code TEXT,
  dress_code_description TEXT,
  dress_code_allowed_colors TEXT,
  dress_code_avoid_colors TEXT,
  instagram_url TEXT,
  music_url TEXT,
  timeline_events TEXT,
  total_budget DOUBLE PRECISION,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  invitation_message TEXT
);

CREATE TABLE wedding_story_items (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  title TEXT,
  description TEXT,
  story_date DATE,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rsvp_status TEXT DEFAULT 'pending',
  guests_count INTEGER DEFAULT 1,
  dietary_restrictions TEXT,
  message TEXT,
  responded_at TIMESTAMPTZ,
  label TEXT,
  confirmation_code TEXT,
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  table_id INTEGER,
  is_child BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guest_companions (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  is_child BOOLEAN DEFAULT FALSE
);

CREATE TABLE wedding_tasks (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wedding_tables (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  name TEXT,
  capacity INTEGER DEFAULT 10,
  shape TEXT DEFAULT 'round',
  table_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wedding_gifts (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  name TEXT, price DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE wedding_photos (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  storage_key TEXT
);

CREATE TABLE guest_messages (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  guest_name TEXT, message TEXT, is_approved BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gift_orders (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  gift_id INTEGER,
  guest_name TEXT,
  amount DOUBLE PRECISION DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  is_converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cash_withdrawals (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  amount DOUBLE PRECISION,
  pix_key TEXT, pix_key_type TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

export interface Fixture {
  db: TestDB;
  /** session token for the owner of wedding A */
  tokenA: string;
  /** session token for the owner of wedding B */
  tokenB: string;
  /** session token for the platform admin */
  tokenAdmin: string;
  weddingA: number;
  weddingB: number;
  /** a guest that belongs to wedding A */
  guestA: number;
  /** a task that belongs to wedding A */
  taskA: number;
}

/**
 * Fresh DB with two independent couples:
 *  - user A owns wedding A, which has one guest and one task
 *  - user B owns wedding B, which is empty
 * Both have a valid, non-expired session.
 */
export async function makeFixture(): Promise<Fixture> {
  const pg = new PGlite();
  await pg.exec(SCHEMA);

  await pg.exec(`
    INSERT INTO users (id, email, password_hash, name) VALUES
      ('user_a', 'a@example.com', 'x', 'Alice'),
      ('user_b', 'b@example.com', 'x', 'Bob'),
      ('user_admin', 'osvaldog.lfilho@gmail.com', 'x', 'Admin');

    INSERT INTO sessions (token, user_id, email, name, expires_at) VALUES
      ('token_a', 'user_a', 'a@example.com', 'Alice', NOW() + INTERVAL '1 day'),
      ('token_b', 'user_b', 'b@example.com', 'Bob',   NOW() + INTERVAL '1 day'),
      ('token_admin', 'user_admin', 'osvaldog.lfilho@gmail.com', 'Admin', NOW() + INTERVAL '1 day');

    INSERT INTO weddings (user_id, partner1_name, partner2_name, custom_url) VALUES
      ('user_a', 'Alice', 'Alex', 'alice-alex'),
      ('user_b', 'Bob', 'Bea', 'bob-bea');

    INSERT INTO guests (wedding_id, name, email) VALUES
      (1, 'Original Guest', 'guest@example.com');

    INSERT INTO wedding_tasks (wedding_id, title) VALUES
      (1, 'Original Task');
  `);

  return {
    db: new TestDB(pg),
    tokenA: "token_a",
    tokenB: "token_b",
    tokenAdmin: "token_admin",
    weddingA: 1,
    weddingB: 2,
    guestA: 1,
    taskA: 1,
  };
}
