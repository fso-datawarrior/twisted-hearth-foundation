-- Add missing status columns that were in migrations but never applied

-- Add status column to hunt_runs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'hunt_runs' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.hunt_runs 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'completed', 'abandoned'));
    
    -- Create index for status column
    CREATE INDEX IF NOT EXISTS idx_hunt_runs_status ON public.hunt_runs(status);
  END IF;
END $$;

-- Add status column to tournament_registrations if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'tournament_registrations' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.tournament_registrations 
    ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected', 'waitlisted'));
    
    -- Create index for status column
    CREATE INDEX IF NOT EXISTS idx_tournament_regs_status ON public.tournament_registrations(status);
  END IF;
END $$;