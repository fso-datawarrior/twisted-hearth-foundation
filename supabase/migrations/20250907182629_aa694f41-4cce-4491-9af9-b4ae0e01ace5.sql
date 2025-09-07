-- Create guestbook table with proper structure
CREATE TABLE IF NOT EXISTS public.guestbook (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 2000),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Create guestbook_reactions table
CREATE TABLE IF NOT EXISTS public.guestbook_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL CHECK (length(emoji) BETWEEN 1 AND 16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id, emoji)
);

-- Create guestbook_reports table
CREATE TABLE IF NOT EXISTS public.guestbook_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT CHECK (length(reason) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create guestbook_replies table
CREATE TABLE IF NOT EXISTS public.guestbook_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.guestbook(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (length(message) BETWEEN 1 AND 2000),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON public.guestbook (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_user_id ON public.guestbook (user_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_reactions_post_id ON public.guestbook_reactions (post_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_replies_post_id ON public.guestbook_replies (post_id);

-- Enable RLS on all tables
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guestbook table
CREATE POLICY "gb_select_visible" ON public.guestbook
  FOR SELECT USING (deleted_at IS NULL);

CREATE POLICY "gb_insert_own" ON public.guestbook
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gb_update_owner_only" ON public.guestbook
  FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);

-- RLS Policies for guestbook_reactions table
CREATE POLICY "gbrw_all_read" ON public.guestbook_reactions
  FOR SELECT USING (true);

CREATE POLICY "gbrw_insert_own" ON public.guestbook_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gbrw_delete_own" ON public.guestbook_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for guestbook_reports table
CREATE POLICY "gbr_insert_auth" ON public.guestbook_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- RLS Policies for guestbook_replies table
CREATE POLICY "gbreplies_select_all" ON public.guestbook_replies
  FOR SELECT USING (true);

CREATE POLICY "gbreplies_insert_own" ON public.guestbook_replies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "gbreplies_update_own" ON public.guestbook_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "gbreplies_delete_own" ON public.guestbook_replies
  FOR DELETE USING (auth.uid() = user_id);

-- Create RPC function for inserting messages
CREATE OR REPLACE FUNCTION public.guestbook_insert_message(
  p_display_name TEXT,
  p_message TEXT,
  p_is_anonymous BOOLEAN DEFAULT false
)
RETURNS public.guestbook AS $$
DECLARE
  v_row public.guestbook;
BEGIN
  INSERT INTO public.guestbook (user_id, display_name, message, is_anonymous)
  VALUES (
    auth.uid(),
    COALESCE(NULLIF(TRIM(p_display_name), ''), SPLIT_PART(auth.email(), '@', 1)),
    TRIM(p_message),
    COALESCE(p_is_anonymous, false)
  )
  RETURNING * INTO v_row;
  
  RETURN v_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_guestbook_updated_at
  BEFORE UPDATE ON public.guestbook
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the guestbook table
ALTER TABLE public.guestbook REPLICA IDENTITY FULL;
ALTER TABLE public.guestbook_reactions REPLICA IDENTITY FULL;
ALTER TABLE public.guestbook_replies REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_replies;