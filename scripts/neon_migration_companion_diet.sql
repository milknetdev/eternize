-- Per-companion dietary restrictions + cleanup of companions that were orphaned
-- by the missing RETURNING id on POST /api/guests (they were inserted with
-- guest_id = 0 and never showed up anywhere).
-- Run once against the Neon database (psql or the Neon SQL editor).

ALTER TABLE guest_companions
  ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT;

DELETE FROM guest_companions
  WHERE guest_id = 0
     OR guest_id NOT IN (SELECT id FROM guests);
