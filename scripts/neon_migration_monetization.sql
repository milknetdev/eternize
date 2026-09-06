-- Eternize - Monetização por transação
-- Rode isto no seu banco Neon (uma vez). Seguro rodar de novo (IF NOT EXISTS / ON CONFLICT).

-- Configuração global da plataforma (linha única, id = 1)
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  commission_pct DOUBLE PRECISION DEFAULT 2,   -- % sobre o valor do presente
  maintenance_fee DOUBLE PRECISION DEFAULT 12, -- R$ fixo, somado 1x por compra
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Níveis de cartão de presente (editáveis no Admin)
CREATE TABLE IF NOT EXISTS gift_card_options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial (só se a tabela estiver vazia)
INSERT INTO gift_card_options (name, price, description, sort_order)
SELECT * FROM (VALUES
  ('Grátis',    0.0,   'Cartão simples com seu nome e mensagem', 0),
  ('Simples',   15.5,  'Design elegante com moldura decorativa', 1),
  ('Premium',   25.9,  'Cartão sofisticado com detalhes dourados', 2),
  ('Elegante',  49.0,  'Design exclusivo com acabamento luxuoso', 3),
  ('Animado',   70.0,  'Cartão interativo com efeitos especiais', 4),
  ('VIP',       120.0, 'Experiência premium com personalização total', 5)
) AS seed(name, price, description, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM gift_card_options);

-- Split gravado em cada pedido de presente (registro contábil)
ALTER TABLE gift_orders ADD COLUMN IF NOT EXISTS maintenance_fee   DOUBLE PRECISION DEFAULT 0;
ALTER TABLE gift_orders ADD COLUMN IF NOT EXISTS commission_pct    DOUBLE PRECISION DEFAULT 0;
ALTER TABLE gift_orders ADD COLUMN IF NOT EXISTS commission_amount DOUBLE PRECISION DEFAULT 0;
ALTER TABLE gift_orders ADD COLUMN IF NOT EXISTS platform_amount   DOUBLE PRECISION DEFAULT 0;
ALTER TABLE gift_orders ADD COLUMN IF NOT EXISTS couple_amount     DOUBLE PRECISION DEFAULT 0;

-- Preenche o split das ordens antigas: sem taxa retroativa, casal recebe o valor cheio.
UPDATE gift_orders
SET couple_amount = amount
WHERE couple_amount = 0 AND amount > 0;
