import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Shield, UserX, Mail, AlertTriangle, Check, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AdminUser {
  id: string;
  email: string;
  display_name?: string;
}

export default function AdminRoleManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<AdminUser | null>(null);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    loadAdmins();
    loadAllUsers();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      
      // Get all users with admin role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        setAdmins([]);
        return;
      }

      // Get user details
      const userIds = roleData.map(r => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .in('id', userIds);

      if (profileError) throw profileError;

      setAdmins(profiles || []);
    } catch (error) {
      console.error('Error loading admins:', error);
      toast.error('Failed to load admin list');
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .order('email');

      if (error) throw error;
      setAllUsers(profiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddAdmin = async () => {
    const emailToUse = selectedUserId 
      ? allUsers.find(u => u.id === selectedUserId)?.email 
      : newAdminEmail.trim();

    if (!emailToUse) {
      toast.error('Please select a user or enter an email address');
      return;
    }

    try {
      setActionLoading(true);

      // Find user by email or ID
      const { data: profile, error: profileError } = selectedUserId
        ? await supabase
            .from('profiles')
            .select('id, email')
            .eq('id', selectedUserId)
            .single()
        : await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', emailToUse.toLowerCase())
            .single();

      if (profileError || !profile) {
        toast.error('User not found');
        return;
      }

      // Check if already admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profile.id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast.error('This user is already an admin');
        return;
      }

      // Add admin role
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: profile.id,
          role: 'admin'
        });

      if (insertError) throw insertError;

      toast.success(`Admin role granted to ${profile.email}`);
      setNewAdminEmail('');
      setSelectedUserId('');
      await loadAdmins();
      await loadAllUsers();
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removeTarget) return;
    if (confirmText !== 'CONFIRM') {
      toast.error('Please type CONFIRM to proceed');
      return;
    }

    // Safety check: cannot remove self
    if (removeTarget.id === user?.id) {
      toast.error('You cannot remove your own admin role');
      setRemoveTarget(null);
      setConfirmText('');
      return;
    }

    // Safety check: cannot remove last admin
    if (admins.length === 1) {
      toast.error('Cannot remove the last admin');
      setRemoveTarget(null);
      setConfirmText('');
      return;
    }

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', removeTarget.id)
        .eq('role', 'admin');

      if (error) throw error;

      toast.success(`Admin role removed from ${removeTarget.email}`);
      setRemoveTarget(null);
      setConfirmText('');
      await loadAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      toast.error('Failed to remove admin');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-heading font-bold">Admin Role Management</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage admin access for your team. Admins have full access to all dashboard features.
        </p>
      </div>

      {/* Add Admin Form */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Add New Admin
        </h3>
        <div className="space-y-3">
          {/* User Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select from existing users:</label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between min-h-[44px]"
                  disabled={actionLoading}
                >
                  {selectedUserId
                    ? allUsers.find((u) => u.id === selectedUserId)?.email
                    : "Select user..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-popover z-50" align="start">
                <Command className="bg-popover">
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {allUsers
                        .filter(u => !admins.some(a => a.id === u.id))
                        .map((u) => (
                          <CommandItem
                            key={u.id}
                            value={u.email}
                            onSelect={() => {
                              setSelectedUserId(u.id);
                              setNewAdminEmail('');
                              setComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUserId === u.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{u.email}</span>
                              {u.display_name && (
                                <span className="text-xs text-muted-foreground">
                                  {u.display_name}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Manual Email Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter user email manually..."
              value={newAdminEmail}
              onChange={(e) => {
                setNewAdminEmail(e.target.value);
                setSelectedUserId('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              className="flex-1"
              disabled={actionLoading || !!selectedUserId}
            />
            <Button 
              onClick={handleAddAdmin} 
              disabled={actionLoading || (!newAdminEmail.trim() && !selectedUserId)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              {actionLoading ? 'Adding...' : 'Grant Admin'}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          User must have an existing account on the platform
        </p>
      </Card>

      {/* Current Admins */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">
          Current Admins ({admins.length})
        </h3>
        
        {admins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No admins found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium truncate">{admin.email}</p>
                    {admin.id === user?.id && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  {admin.display_name && (
                    <p className="text-sm text-muted-foreground truncate">
                      {admin.display_name}
                    </p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRemoveTarget(admin)}
                  disabled={admin.id === user?.id || admins.length === 1}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Safety Information */}
      <Card className="p-4 bg-muted/50 border-primary/20">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Safety Features:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You cannot remove your own admin role</li>
              <li>At least one admin must remain at all times</li>
              <li>All changes are logged for security auditing</li>
              <li>Admin status is verified server-side on every action</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Role</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Are you sure you want to remove admin access from{' '}
                <span className="font-semibold">{removeTarget?.email}</span>?
              </p>
              <p className="text-sm">
                They will lose access to all admin features immediately.
              </p>
              <div>
                <label className="text-sm font-medium">
                  Type <span className="font-mono bg-muted px-1">CONFIRM</span> to proceed:
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="CONFIRM"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setConfirmText('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAdmin}
              disabled={confirmText !== 'CONFIRM' || actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? 'Removing...' : 'Remove Admin'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
