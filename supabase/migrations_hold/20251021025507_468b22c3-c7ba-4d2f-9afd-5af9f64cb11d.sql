-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('comment', 'reply', 'reaction', 'rsvp_update', 'event_update', 'admin_announcement', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications"
  ON public.notifications FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Extend notification_preferences table
ALTER TABLE public.notification_preferences
ADD COLUMN IF NOT EXISTS email_on_comment BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_on_reply BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_on_reaction BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_on_rsvp_update BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_on_admin_announcement BOOLEAN DEFAULT true;

-- Create helper function: create_notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_link, p_metadata)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create helper function: mark_notification_read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Create helper function: mark_all_notifications_read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$;

-- Create helper function: get_unread_notification_count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.notifications
  WHERE user_id = v_user_id AND is_read = false;
  
  RETURN v_count;
END;
$$;

-- Trigger function: notify on guestbook reply
CREATE OR REPLACE FUNCTION public.notify_on_guestbook_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
  v_replier_name TEXT;
BEGIN
  -- Get the original post author
  SELECT user_id INTO v_post_author_id
  FROM public.guestbook
  WHERE id = NEW.post_id;
  
  -- Don't notify if replying to own post
  IF v_post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get replier's display name
  v_replier_name := COALESCE(NEW.display_name, 'Someone');
  
  -- Create notification
  PERFORM public.create_notification(
    v_post_author_id,
    'reply',
    'New Reply to Your Post',
    v_replier_name || ' replied to your guestbook message',
    '/discussion',
    jsonb_build_object('post_id', NEW.post_id, 'reply_id', NEW.id)
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function: notify on photo reaction
CREATE OR REPLACE FUNCTION public.notify_on_photo_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_photo_owner_id UUID;
  v_reactor_name TEXT;
BEGIN
  -- Get the photo owner
  SELECT user_id INTO v_photo_owner_id
  FROM public.photos
  WHERE id = NEW.photo_id;
  
  -- Don't notify if reacting to own photo
  IF v_photo_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get reactor's display name
  SELECT COALESCE(display_name, email) INTO v_reactor_name
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Create notification
  PERFORM public.create_notification(
    v_photo_owner_id,
    'reaction',
    'New Reaction to Your Photo',
    COALESCE(v_reactor_name, 'Someone') || ' reacted ' || NEW.emoji || ' to your photo',
    '/gallery',
    jsonb_build_object('photo_id', NEW.photo_id)
  );
  
  RETURN NEW;
END;
$$;

-- Trigger function: notify on RSVP update (admin only)
CREATE OR REPLACE FUNCTION public.notify_on_rsvp_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify on status change by admin
  IF OLD.status != NEW.status AND NEW.status = 'confirmed' THEN
    PERFORM public.create_notification(
      NEW.user_id,
      'rsvp_update',
      'RSVP Status Updated',
      'Your RSVP has been confirmed! Check your email for event details.',
      '/rsvp',
      jsonb_build_object('rsvp_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_on_guestbook_reply ON public.guestbook_replies;
CREATE TRIGGER trigger_notify_on_guestbook_reply
  AFTER INSERT ON public.guestbook_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_guestbook_reply();

DROP TRIGGER IF EXISTS trigger_notify_on_photo_reaction ON public.photo_emoji_reactions;
CREATE TRIGGER trigger_notify_on_photo_reaction
  AFTER INSERT ON public.photo_emoji_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_photo_reaction();

DROP TRIGGER IF EXISTS trigger_notify_on_rsvp_update ON public.rsvps;
CREATE TRIGGER trigger_notify_on_rsvp_update
  AFTER UPDATE ON public.rsvps
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_rsvp_update();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);