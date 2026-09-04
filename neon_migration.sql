-- Eternize - Neon PostgreSQL Migration
-- Run this on your Neon database

-- Users table (email/password auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Weddings
CREATE TABLE IF NOT EXISTS weddings (
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

CREATE INDEX IF NOT EXISTS idx_weddings_user_id ON weddings(user_id);

-- Guests
CREATE TABLE IF NOT EXISTS guests (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  label TEXT,
  confirmation_code TEXT,
  is_confirmed BOOLEAN DEFAULT FALSE,
  confirmed_at TIMESTAMPTZ,
  table_id INTEGER,
  is_child BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_confirmation_code ON guests(confirmation_code);

-- Wedding Gifts
CREATE TABLE IF NOT EXISTS wedding_gifts (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  image_url TEXT,
  category TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  quota_total INTEGER DEFAULT 1,
  quota_purchased INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_gifts_wedding_id ON wedding_gifts(wedding_id);

-- Gift Orders
CREATE TABLE IF NOT EXISTS gift_orders (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  gift_id INTEGER,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  amount DOUBLE PRECISION NOT NULL,
  message TEXT,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  pix_transaction_id TEXT,
  card_type TEXT,
  card_sender_name TEXT,
  card_message TEXT,
  card_price DOUBLE PRECISION DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gift_orders_wedding_id ON gift_orders(wedding_id);

-- Guest Messages
CREATE TABLE IF NOT EXISTS guest_messages (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_messages_wedding_id ON guest_messages(wedding_id);

-- Wedding Photos
CREATE TABLE IF NOT EXISTS wedding_photos (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  filename TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wedding_photos_wedding_id ON wedding_photos(wedding_id);

-- Cash Withdrawals
CREATE TABLE IF NOT EXISTS cash_withdrawals (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  amount DOUBLE PRECISION NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Companions
CREATE TABLE IF NOT EXISTS guest_companions (
  id SERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  name TEXT NOT NULL,
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_child BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_guest_companions_guest_id ON guest_companions(guest_id);

-- Wedding Tables
CREATE TABLE IF NOT EXISTS wedding_tables (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  name TEXT NOT NULL,
  capacity INTEGER DEFAULT 10,
  table_number INTEGER,
  shape TEXT DEFAULT 'round',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wedding Tasks
CREATE TABLE IF NOT EXISTS wedding_tasks (
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

-- Wedding Expenses
CREATE TABLE IF NOT EXISTS wedding_expenses (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  vendor_name TEXT,
  estimated_amount DOUBLE PRECISION NOT NULL,
  paid_amount DOUBLE PRECISION DEFAULT 0,
  is_paid BOOLEAN DEFAULT FALSE,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PIX Contributions
CREATE TABLE IF NOT EXISTS pix_contributions (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  contributor_name TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  payment_status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wedding Story Items
CREATE TABLE IF NOT EXISTS wedding_story_items (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  title TEXT NOT NULL,
  description TEXT,
  story_date TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guest Photos
CREATE TABLE IF NOT EXISTS guest_photos (
  id SERIAL PRIMARY KEY,
  wedding_id INTEGER NOT NULL REFERENCES weddings(id),
  guest_name TEXT NOT NULL,
  filename TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_photos_wedding_id ON guest_photos(wedding_id);

-- Gift List Types
CREATE TABLE IF NOT EXISTS gift_list_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gift Templates
CREATE TABLE IF NOT EXISTS gift_templates (
  id SERIAL PRIMARY KEY,
  list_type_id INTEGER NOT NULL REFERENCES gift_list_types(id),
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_templates_list_type ON gift_templates(list_type_id);

-- Gift Template Categories
CREATE TABLE IF NOT EXISTS gift_template_categories (
  id SERIAL PRIMARY KEY,
  list_type_id INTEGER NOT NULL REFERENCES gift_list_types(id),
  name TEXT NOT NULL,
  color_class TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gift_template_categories_list_type ON gift_template_categories(list_type_id);

-- Seed gift list types
INSERT INTO gift_list_types (name, slug, description, sort_order) VALUES
  ('Lista Clássica', 'classic', 'Itens tradicionais de casamento para montar seu lar', 1),
  ('Lista Divertida', 'fun', 'Presentes com nomes criativos e bem-humorados', 2)
ON CONFLICT (slug) DO NOTHING;

-- Seed classic categories
INSERT INTO gift_template_categories (list_type_id, name, color_class, sort_order) VALUES
  (1, 'Cozinha', 'bg-orange-100 text-orange-700', 1),
  (1, 'Quarto', 'bg-purple-100 text-purple-700', 2),
  (1, 'Banheiro', 'bg-cyan-100 text-cyan-700', 3),
  (1, 'Sala', 'bg-amber-100 text-amber-700', 4),
  (1, 'Eletrônicos', 'bg-blue-100 text-blue-700', 5),
  (1, 'Experiências', 'bg-pink-100 text-pink-700', 6),
  (2, 'Relacionamento', 'bg-red-100 text-red-700', 1),
  (2, 'Sobrevivência', 'bg-yellow-100 text-yellow-700', 2),
  (2, 'Finanças', 'bg-green-100 text-green-700', 3),
  (2, 'Diversão', 'bg-indigo-100 text-indigo-700', 4),
  (2, 'Pets', 'bg-amber-100 text-amber-700', 5),
  (2, 'Futuro', 'bg-teal-100 text-teal-700', 6)
ON CONFLICT DO NOTHING;

-- Seed classic gifts
INSERT INTO gift_templates (list_type_id, name, description, price, category, sort_order) VALUES
  (1, 'Jogo de Panelas Antiaderente', 'Conjunto completo com 7 peças', 450, 'Cozinha', 1),
  (1, 'Conjunto de Talheres 42 Peças', 'Talheres em aço inox', 280, 'Cozinha', 2),
  (1, 'Jogo de Pratos 30 Peças', 'Aparelho de jantar em porcelana', 320, 'Cozinha', 3),
  (1, 'Smart TV 50"', 'Televisão LED 4K', 2500, 'Eletrônicos', 4),
  (1, 'Jantar Romântico', 'Noite especial em restaurante premium', 500, 'Experiências', 5),
  (2, 'Fundo de Discussão', 'Para resolver divergências com pizza', 50, 'Relacionamento', 1),
  (2, 'Kit Netflix & Chill', 'Pipoca, cobertor e streaming', 150, 'Relacionamento', 2),
  (2, 'Seguro Anti-Sogra', 'Fundo para visitas inesperadas', 200, 'Relacionamento', 3),
  (2, 'Pé de Meia do Casamento', 'Começar vida de casados com pé direito', 500, 'Finanças', 4),
  (2, 'Fundo de Viagem dos Sonhos', 'Aquela viagem que sempre quiseram', 2000, 'Futuro', 5)
ON CONFLICT DO NOTHING;

-- Added later: per-section visibility for godparents / parents / accommodations.
-- Safe to re-run on an existing database.
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS show_godparents     BOOLEAN DEFAULT TRUE;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS show_parents        BOOLEAN DEFAULT TRUE;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS show_accommodations BOOLEAN DEFAULT TRUE;
