# PHASE 4: Notification System

**Branch**: v-3.0.3.5-Phase4-NotificationSystem  
**Priority**: P2 (Medium - New Features)  
**Estimated Time**: 6-8 hours

## Overview
Implement comprehensive notification system with database schema, user preferences, email notifications, and triggers for guestbook comments, photo reactions, RSVP updates, and admin announcements.

---

## 4.1 Database Schema - Notifications Table

### New Migration File
**File**: `supabase/migrations/20250121000000_create_notifications_system.sql`

```sql
-- ============================================
-- NOTIFICATIONS SYSTEM
-- Complete notification infrastructure
-- ============================================

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'comment', 
    'reply', 
    'reaction', 
    'rsvp_update', 
    'event_update',
    'photo_comment',
    'admin_announcement'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Deep link to related content
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB, -- Extra data (comment_id, photo_id, etc.)
  
  -- Indexes for performance
  CONSTRAINT notifications_type_check CHECK (char_length(type) <= 50),
  CONSTRAINT notifications_title_check CHECK (char_length(title) <= 200),
  CONSTRAINT notifications_message_check CHECK (char_length(message) <= 500)
);

-- Create index for user queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email notification preferences
  email_on_comment BOOLEAN DEFAULT true,
  email_on_reply BOOLEAN DEFAULT true,
  email_on_reaction BOOLEAN DEFAULT true,
  email_on_rsvp_update BOOLEAN DEFAULT true,
  email_on_event_update BOOLEAN DEFAULT true,
  email_on_admin_announcement BOOLEAN DEFAULT true,
  
  -- In-app notification preferences
  in_app_notifications BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for preference lookups
CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true); -- Triggers and functions can insert

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can see all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Notification preferences policies
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_preferences RECORD;
BEGIN
  -- Check if user wants in-app notifications
  SELECT * INTO v_preferences
  FROM notification_preferences
  WHERE user_id = p_user_id;
  
  -- If no preferences exist or in_app enabled, create notification
  IF v_preferences IS NULL OR v_preferences.in_app_notifications THEN
    INSERT INTO notifications (
      user_id, type, title, message, link, metadata
    ) VALUES (
      p_user_id, p_type, p_title, p_message, p_link, p_metadata
    ) RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id
  AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = auth.uid()
  AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = auth.uid()
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS FOR AUTOMATIC NOTIFICATIONS
-- ============================================

-- Trigger for guestbook comments
CREATE OR REPLACE FUNCTION notify_on_guestbook_comment()
RETURNS TRIGGER AS $$
BEGIN
  -- Don't notify if user is commenting on their own post
  IF NEW.user_id != (
    SELECT user_id FROM guestbook WHERE id = NEW.post_id
  ) THEN
    PERFORM create_notification(
      (SELECT user_id FROM guestbook WHERE id = NEW.post_id),
      'comment',
      'New comment on your post',
      NEW.display_name || ' commented on your guestbook post',
      '/discussion#' || NEW.post_id,
      jsonb_build_object('comment_id', NEW.id, 'post_id', NEW.post_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Guestbook doesn't have comments table yet, this is for future use

-- Trigger for photo reactions
CREATE OR REPLACE FUNCTION notify_on_photo_reaction()
RETURNS TRIGGER AS $$
DECLARE
  v_photo_owner UUID;
BEGIN
  -- Get photo owner
  SELECT user_id INTO v_photo_owner
  FROM photos
  WHERE id = NEW.photo_id;
  
  -- Don't notify if user reacted to their own photo
  IF v_photo_owner != NEW.user_id THEN
    PERFORM create_notification(
      v_photo_owner,
      'reaction',
      'Someone liked your photo',
      'Your photo received a new reaction',
      '/gallery#' || NEW.photo_id,
      jsonb_build_object('photo_id', NEW.photo_id, 'reaction', NEW.emoji)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on photo_reactions table (if exists)
-- Note: Check if photo_reactions table exists first

-- Trigger for RSVP status changes
CREATE OR REPLACE FUNCTION notify_on_rsvp_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM create_notification(
      NEW.user_id,
      'rsvp_update',
      'RSVP Status Updated',
      'Your RSVP status has been changed to: ' || NEW.status,
      '/rsvp',
      jsonb_build_object('rsvp_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_rsvp_update
  AFTER UPDATE ON rsvps
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_rsvp_update();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count TO authenticated;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- Add comment explaining the notification system
COMMENT ON TABLE notifications IS 'Stores all user notifications including comments, reactions, RSVP updates, and admin announcements';
COMMENT ON TABLE notification_preferences IS 'User preferences for email and in-app notifications';
```

### Testing
- [ ] Migration runs without errors
- [ ] Tables created with correct schema
- [ ] RLS policies work correctly
- [ ] Helper functions execute properly
- [ ] Triggers fire on updates
- [ ] Indexes improve query performance

---

## 4.2 Settings - Notifications Tab

### Files to Create
- `src/components/settings/NotificationSettings.tsx`

### File to Modify
- `src/pages/UserSettings.tsx`

### Implementation

#### 1. Create NotificationSettings Component

**File**: `src/components/settings/NotificationSettings.tsx`

```tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, MessageSquare, Heart, Calendar, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  email_on_comment: boolean;
  email_on_reply: boolean;
  email_on_reaction: boolean;
  email_on_rsvp_update: boolean;
  email_on_event_update: boolean;
  email_on_admin_announcement: boolean;
  in_app_notifications: boolean;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_on_comment: true,
    email_on_reply: true,
    email_on_reaction: true,
    email_on_rsvp_update: true,
    email_on_event_update: true,
    email_on_admin_announcement: true,
    in_app_notifications: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }

      if (data) {
        setPreferences({
          email_on_comment: data.email_on_comment ?? true,
          email_on_reply: data.email_on_reply ?? true,
          email_on_reaction: data.email_on_reaction ?? true,
          email_on_rsvp_update: data.email_on_rsvp_update ?? true,
          email_on_event_update: data.email_on_event_update ?? true,
          email_on_admin_announcement: data.email_on_admin_announcement ?? true,
          in_app_notifications: data.in_app_notifications ?? true,
        });
      }
    } catch (error: any) {
      console.error('Error loading notification preferences:', error);
      toast({
        title: "Error loading preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "Your notification preferences have been updated.",
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Save failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications within the website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="in-app" className="flex-1 cursor-pointer">
              <div>
                <div className="font-medium">Enable in-app notifications</div>
                <div className="text-sm text-muted-foreground">
                  Show notification badge and alerts in the navigation bar
                </div>
              </div>
            </Label>
            <Switch
              id="in-app"
              checked={preferences.in_app_notifications}
              onCheckedChange={() => handleToggle('in_app_notifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Comments */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <Label htmlFor="email-comment" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-accent-gold" />
                <div>
                  <div className="font-medium">Comments on your posts</div>
                  <div className="text-sm text-muted-foreground">
                    When someone comments on your guestbook posts
                  </div>
                </div>
              </div>
            </Label>
            <Switch
              id="email-comment"
              checked={preferences.email_on_comment}
              onCheckedChange={() => handleToggle('email_on_comment')}
            />
          </div>

          {/* Reactions */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <Label htmlFor="email-reaction" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-accent-red" />
                <div>
                  <div className="font-medium">Reactions on your photos</div>
                  <div className="text-sm text-muted-foreground">
                    When someone reacts to your gallery photos
                  </div>
                </div>
              </div>
            </Label>
            <Switch
              id="email-reaction"
              checked={preferences.email_on_reaction}
              onCheckedChange={() => handleToggle('email_on_reaction')}
            />
          </div>

          {/* RSVP Updates */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <Label htmlFor="email-rsvp" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-accent-purple" />
                <div>
                  <div className="font-medium">RSVP status changes</div>
                  <div className="text-sm text-muted-foreground">
                    When your RSVP status is updated
                  </div>
                </div>
              </div>
            </Label>
            <Switch
              id="email-rsvp"
              checked={preferences.email_on_rsvp_update}
              onCheckedChange={() => handleToggle('email_on_rsvp_update')}
            />
          </div>

          {/* Event Updates */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <Label htmlFor="email-event" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-accent-gold" />
                <div>
                  <div className="font-medium">Event updates</div>
                  <div className="text-sm text-muted-foreground">
                    Important changes about the event (time, location, etc.)
                  </div>
                </div>
              </div>
            </Label>
            <Switch
              id="email-event"
              checked={preferences.email_on_event_update}
              onCheckedChange={() => handleToggle('email_on_event_update')}
            />
          </div>

          {/* Admin Announcements */}
          <div className="flex items-center justify-between py-3">
            <Label htmlFor="email-admin" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-3">
                <Megaphone className="h-4 w-4 text-accent-gold" />
                <div>
                  <div className="font-medium">System updates & announcements</div>
                  <div className="text-sm text-muted-foreground">
                    New features, bug fixes, and important announcements
                  </div>
                </div>
              </div>
            </Label>
            <Switch
              id="email-admin"
              checked={preferences.email_on_admin_announcement}
              onCheckedChange={() => handleToggle('email_on_admin_announcement')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-gold hover:bg-accent-gold/80 text-background"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
        
        <Button
          variant="outline"
          onClick={loadPreferences}
          disabled={saving}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
```

#### 2. Add Notifications Tab to Settings Page

**File**: `src/pages/UserSettings.tsx`

```tsx
// Add import at top (line 12):
import NotificationSettings from '@/components/settings/NotificationSettings';

// Add Bell icon import (line 8):
import { ArrowLeft, User, Shield, Settings, Bell } from 'lucide-react';

// Update TabsList to have 4 tabs (line 86-100):
<TabsList className="grid w-full grid-cols-4 bg-muted/50">
  <TabsTrigger value="profile" className="flex items-center gap-2">
    <User className="h-4 w-4" />
    <span className="hidden sm:inline">Profile</span>
  </TabsTrigger>
  <TabsTrigger value="account" className="flex items-center gap-2">
    <Settings className="h-4 w-4" />
    <span className="hidden sm:inline">Account</span>
  </TabsTrigger>
  <TabsTrigger value="security" className="flex items-center gap-2">
    <Shield className="h-4 w-4" />
    <span className="hidden sm:inline">Security</span>
  </TabsTrigger>
  <TabsTrigger value="notifications" className="flex items-center gap-2">
    <Bell className="h-4 w-4" />
    <span className="hidden sm:inline">Notifications</span>
  </TabsTrigger>
</TabsList>

// Add notification tab content (after line 119):
<TabsContent value="notifications" className="space-y-6">
  <NotificationSettings />
</TabsContent>
```

### Testing
- [ ] Notifications tab appears in Settings
- [ ] All toggles load with saved preferences
- [ ] Toggles can be switched on/off
- [ ] Save button updates database
- [ ] Reset button reloads from database
- [ ] Icons display correctly
- [ ] Descriptions are clear and helpful

---

## 4.3 Email Notification Function

### New Edge Function
**File**: `supabase/functions/send-notification-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MAILJET_API_KEY = Deno.env.get("MAILJET_API_KEY");
const MAILJET_SECRET_KEY = Deno.env.get("MAILJET_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const { notificationId, userId } = await req.json();
    
    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get notification details
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .single();
    
    if (notifError) throw notifError;
    
    // Get user email and preferences
    const { data: user } = await supabase.auth.admin.getUserById(userId);
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!user?.user?.email) {
      throw new Error('User email not found');
    }
    
    // Check if user wants email for this type
    const shouldSendEmail = preferences && (
      (notification.type === 'comment' && preferences.email_on_comment) ||
      (notification.type === 'reply' && preferences.email_on_reply) ||
      (notification.type === 'reaction' && preferences.email_on_reaction) ||
      (notification.type === 'rsvp_update' && preferences.email_on_rsvp_update) ||
      (notification.type === 'event_update' && preferences.email_on_event_update) ||
      (notification.type === 'admin_announcement' && preferences.email_on_admin_announcement)
    );
    
    if (!shouldSendEmail) {
      return new Response(
        JSON.stringify({ message: 'User has disabled emails for this notification type' }),
        { headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Send email via Mailjet
    const response = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`)}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: "noreply@partytillyou.rip",
              Name: "The Ruths' Bash"
            },
            To: [
              {
                Email: user.user.email,
                Name: user.user.user_metadata?.full_name || user.user.email
              }
            ],
            Subject: notification.title,
            TextPart: notification.message,
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #f59e0b;">${notification.title}</h2>
                <p>${notification.message}</p>
                ${notification.link ? `<a href="${SUPABASE_URL.replace('//', '//')}${notification.link}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 1rem 0;">View Details</a>` : ''}
                <hr style="margin: 2rem 0; border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #666;">
                  You can manage your notification preferences in your 
                  <a href="${SUPABASE_URL}/settings">account settings</a>.
                </p>
              </div>
            `
          }
        ]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mailjet error: ${response.statusText} - ${errorText}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, notificationId }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending notification email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
});
```

### Deploy Function
```bash
supabase functions deploy send-notification-email
```

### Testing
- [ ] Function deploys successfully
- [ ] Email sends for each notification type
- [ ] User preferences are respected
- [ ] Links in emails work correctly
- [ ] Email template renders properly
- [ ] Unsubscribe functionality works

---

## Completion Checklist

- [ ] Database migration created and tested
- [ ] NotificationSettings component complete
- [ ] Settings page updated with Notifications tab
- [ ] Email function deployed
- [ ] Triggers fire correctly
- [ ] RLS policies tested
- [ ] Comprehensive testing complete
- [ ] Documentation updated
- [ ] Ready to commit

## Git Commit Message

```
feat(notifications): implement comprehensive notification system

- Create notifications and notification_preferences tables
- Add RLS policies for secure access
- Implement helper functions and triggers
- Create NotificationSettings component in Settings page
- Add email notification edge function
- Set up automatic notifications for comments, reactions, RSVP updates
- Allow users to customize email and in-app notification preferences

Foundation for future notification features including bell icon and realtime updates.
```

