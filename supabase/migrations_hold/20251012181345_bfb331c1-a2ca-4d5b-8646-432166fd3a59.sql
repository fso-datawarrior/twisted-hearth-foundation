-- BATCH 4 Phase 4: Fix missing updated_at column in tournament_registrations
-- This column is referenced in queries but was missing from the schema

ALTER TABLE tournament_registrations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_tournament_registrations_updated_at
BEFORE UPDATE ON tournament_registrations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON COLUMN tournament_registrations.updated_at IS 'Timestamp of last update, auto-maintained by trigger';