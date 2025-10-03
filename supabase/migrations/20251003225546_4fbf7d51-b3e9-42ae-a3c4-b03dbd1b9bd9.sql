-- Create potluck_items table
CREATE TABLE public.potluck_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_name TEXT NOT NULL,
  notes TEXT,
  is_vegan BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.potluck_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view non-deleted potluck items"
ON public.potluck_items
FOR SELECT
USING (deleted_at IS NULL OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can insert potluck items"
ON public.potluck_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own potluck items"
ON public.potluck_items
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own potluck items"
ON public.potluck_items
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_potluck_items_user_id ON public.potluck_items(user_id);
CREATE INDEX idx_potluck_items_created_at ON public.potluck_items(created_at DESC);