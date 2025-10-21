import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bell, MessageSquare, Heart, Calendar, Megaphone, Loader2 } from 'lucide-react';

interface NotificationPreferences {
  in_app_notifications: boolean;
  email_on_event_update: boolean;
  email_on_comment: boolean;
  email_on_reply: boolean;
  email_on_reaction: boolean;
  email_on_rsvp_update: boolean;
  email_on_admin_announcement: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    in_app_notifications: true,
    email_on_event_update: true,
    email_on_comment: true,
    email_on_reply: true,
    email_on_reaction: true,
    email_on_rsvp_update: true,
    email_on_admin_announcement: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          in_app_notifications: data.in_app_notifications ?? true,
          email_on_event_update: data.email_on_event_update ?? true,
          email_on_comment: data.email_on_comment ?? true,
          email_on_reply: data.email_on_reply ?? true,
          email_on_reaction: data.email_on_reaction ?? true,
          email_on_rsvp_update: data.email_on_rsvp_update ?? true,
          email_on_admin_announcement: data.email_on_admin_announcement ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error loading preferences",
        description: "Could not load your notification settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
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
        title: "Preferences saved",
        description: "Your notification settings have been updated.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving preferences",
        description: "Could not update your notification settings.",
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* In-App Notifications Card */}
      <Card className="border-accent-purple/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-gold">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="in-app" className="text-base">
                Enable in-app notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Show notification badges and alerts while using the site
              </p>
            </div>
            <Switch
              id="in-app"
              checked={preferences.in_app_notifications}
              onCheckedChange={() => handleToggle('in_app_notifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications Card */}
      <Card className="border-accent-purple/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent-gold">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which events trigger email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Updates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-accent-gold" />
              <div className="space-y-0.5">
                <Label htmlFor="event-update" className="text-base">
                  Event Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  Important announcements about the event
                </p>
              </div>
            </div>
            <Switch
              id="event-update"
              checked={preferences.email_on_event_update}
              onCheckedChange={() => handleToggle('email_on_event_update')}
            />
          </div>

          <Separator />

          {/* Comments */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-accent-gold" />
              <div className="space-y-0.5">
                <Label htmlFor="comments" className="text-base">
                  Comments
                </Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments on your content
                </p>
              </div>
            </div>
            <Switch
              id="comments"
              checked={preferences.email_on_comment}
              onCheckedChange={() => handleToggle('email_on_comment')}
            />
          </div>

          <Separator />

          {/* Replies */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-accent-gold" />
              <div className="space-y-0.5">
                <Label htmlFor="replies" className="text-base">
                  Replies
                </Label>
                <p className="text-sm text-muted-foreground">
                  When someone replies to your guestbook post
                </p>
              </div>
            </div>
            <Switch
              id="replies"
              checked={preferences.email_on_reply}
              onCheckedChange={() => handleToggle('email_on_reply')}
            />
          </div>

          <Separator />

          {/* Reactions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-accent-gold" />
              <div className="space-y-0.5">
                <Label htmlFor="reactions" className="text-base">
                  Reactions
                </Label>
                <p className="text-sm text-muted-foreground">
                  When someone reacts to your photos or posts
                </p>
              </div>
            </div>
            <Switch
              id="reactions"
              checked={preferences.email_on_reaction}
              onCheckedChange={() => handleToggle('email_on_reaction')}
            />
          </div>

          <Separator />

          {/* RSVP Updates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent-gold" />
              <div className="space-y-0.5">
                <Label htmlFor="rsvp" className="text-base">
                  RSVP Updates
                </Label>
                <p className="text-sm text-muted-foreground">
                  When your RSVP status changes
                </p>
              </div>
            </div>
            <Switch
              id="rsvp"
              checked={preferences.email_on_rsvp_update}
              onCheckedChange={() => handleToggle('email_on_rsvp_update')}
            />
          </div>

          <Separator />

          {/* Admin Announcements */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-accent-gold" />
              <div className="space-y-0.5">
                <Label htmlFor="announcements" className="text-base">
                  Admin Announcements
                </Label>
                <p className="text-sm text-muted-foreground">
                  Important messages from event organizers
                </p>
              </div>
            </div>
            <Switch
              id="announcements"
              checked={preferences.email_on_admin_announcement}
              onCheckedChange={() => handleToggle('email_on_admin_announcement')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-accent-gold hover:bg-accent-gold/90 text-background"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </Button>
        <Button
          onClick={loadPreferences}
          variant="outline"
          disabled={saving || loading}
          className="border-accent-purple/30"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
