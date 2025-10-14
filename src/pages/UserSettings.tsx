import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, Link } from 'react-router-dom';
import RequireAuth from '@/components/RequireAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User, Shield, Settings, CheckCircle2, Command } from 'lucide-react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import SettingsCommandPalette from '@/components/settings/SettingsCommandPalette';
import { calculateProfileCompletion } from '@/lib/profile-utils';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, loading, refreshProfile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Get active tab from URL or default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile';

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  // Keyboard shortcut for command palette (Cmd/Ctrl + K)
  useKeyboardShortcut(
    () => setCommandPaletteOpen(true),
    { key: 'k', ctrlKey: true, metaKey: true }
  );

  // Calculate profile completion
  const completionStatus = calculateProfileCompletion(profile);

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
            </div>
          </div>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-24 pb-8 max-w-4xl">
          {/* Header with Quick Actions */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/discussion">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-heading font-bold text-accent-gold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2"
            >
              <Command className="h-4 w-4" />
              <span className="hidden md:inline">Quick Search</span>
              <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* Profile Completion Widget */}
          {!completionStatus.isComplete && (
            <Card className="border-accent-gold/30 bg-gradient-to-r from-[hsl(var(--accent-purple))]/10 to-[hsl(var(--accent-gold))]/10 p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-accent-gold" />
                    <h3 className="font-heading font-semibold text-accent-gold">
                      Profile {completionStatus.percentage}% Complete
                    </h3>
                  </div>
                  <Progress value={completionStatus.percentage} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {completionStatus.missingItems.length > 0 && (
                      <>Add {completionStatus.missingItems.join(' and ')} to complete your profile</>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Settings Tabs */}
          <Card className="border-accent-purple/30">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
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
              </TabsList>

              <div className="p-6">
                <TabsContent value="profile" className="space-y-6">
                  <ProfileSettings 
                    profile={profile} 
                    onProfileUpdate={refreshProfile}
                  />
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  <AccountSettings 
                    profile={profile} 
                    onProfileUpdate={refreshProfile}
                  />
                </TabsContent>

                <TabsContent value="security" className="space-y-6">
                  <SecuritySettings />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Command Palette */}
      <SettingsCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </RequireAuth>
  );
}
