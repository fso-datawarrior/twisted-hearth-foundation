-- Add comprehensive event tracking fields to rsvps table
-- This migration adds fields for check-in, attendance, admin notes, and payment tracking

-- Add comprehensive event tracking fields to rsvps table
ALTER TABLE public.rsvps 
ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rsvp_notes TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'not_required' CHECK (payment_status IN ('not_required', 'pending', 'paid', 'refunded', 'waived')),
ADD COLUMN IF NOT EXISTS special_requests TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rsvps_attended ON public.rsvps(attended) WHERE attended = true;
CREATE INDEX IF NOT EXISTS idx_rsvps_checked_in ON public.rsvps(checked_in_at) WHERE checked_in_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rsvps_payment_status ON public.rsvps(payment_status) WHERE payment_status != 'not_required';
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON public.rsvps(status);

-- Add comments for documentation
COMMENT ON COLUMN public.rsvps.attended IS 'Whether the guest actually attended the event';
COMMENT ON COLUMN public.rsvps.checked_in_at IS 'Timestamp when guest checked in at event';
COMMENT ON COLUMN public.rsvps.rsvp_notes IS 'Admin notes about this RSVP (visible only to admins)';
COMMENT ON COLUMN public.rsvps.payment_status IS 'Payment status if event requires payment';
COMMENT ON COLUMN public.rsvps.special_requests IS 'Special requests or needs from the guest';
COMMENT ON COLUMN public.rsvps.payment_amount IS 'Amount paid for event if applicable';
COMMENT ON COLUMN public.rsvps.payment_date IS 'Date payment was received';
COMMENT ON COLUMN public.rsvps.checked_in_by IS 'Admin who checked in this guest';

-- Log the changes
DO $$
BEGIN
  RAISE LOG 'RSVP tracking fields added: attended, checked_in_at, rsvp_notes, payment_status, special_requests, payment_amount, payment_date, checked_in_by';
END $$;
