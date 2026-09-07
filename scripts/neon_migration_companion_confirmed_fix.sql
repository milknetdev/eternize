-- Companions were inserted without an explicit is_confirmed, so any DB where the
-- column default wasn't FALSE left them "confirmed" — inflating the dashboard's
-- Confirmados count. Force the default and reset companions whose guest never
-- actually confirmed.
-- Run once against the Neon database.

ALTER TABLE guest_companions ALTER COLUMN is_confirmed SET DEFAULT FALSE;

UPDATE guest_companions gc
SET is_confirmed = FALSE
FROM guests g
WHERE gc.guest_id = g.id
  AND gc.is_confirmed = TRUE
  AND g.is_confirmed IS NOT TRUE
  AND (g.rsvp_status IS DISTINCT FROM 'confirmed');
