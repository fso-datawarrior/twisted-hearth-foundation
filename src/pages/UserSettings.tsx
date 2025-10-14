import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import RequireAuth from '@/components/RequireAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AccountSettings from '@/components/settings/AccountSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';

export default function UserSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, loading, refreshProfile } = useProfile();

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
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
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

          {/* Settings Tabs */}
          <Card className="border-accent-purple/30">
            <Tabs defaultValue="profile" className="w-full">
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
    </RequireAuth>
  );
}
