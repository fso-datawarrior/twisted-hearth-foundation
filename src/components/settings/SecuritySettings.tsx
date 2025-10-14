import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { Key, Shield, Smartphone, Clock } from 'lucide-react';

export default function SecuritySettings() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Password Security */}
      <Card>
        <CardHeader>
          <CardTitle>Password & Authentication</CardTitle>
          <CardDescription>
            Manage your password and authentication settings. Change your password anytime without needing your current one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-6 border-2 border-accent-purple/30 rounded-lg bg-accent-purple/5 hover:border-accent-gold/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent-gold/10 rounded-full">
                <Key className="h-6 w-6 text-accent-gold" />
              </div>
              <div>
                <p className="font-semibold text-lg">Password</p>
                <p className="text-sm text-muted-foreground">
                  Update your password - no current password required
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowPasswordModal(true)}
              className="bg-accent-gold hover:bg-accent-gold/80 text-background font-semibold"
            >
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-muted-foreground">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Coming soon - Add an extra layer of security
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Set Up 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
          <CardDescription>
            Recent login activity and active sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-accent-gold" />
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-muted-foreground">
                    Started today - This device
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Active</span>
              </div>
            </div>

            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Session management features coming soon</p>
              <p className="text-sm">View and manage all active sessions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control your privacy and data sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Privacy controls coming soon</p>
            <p className="text-sm">Manage your data and privacy preferences</p>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
