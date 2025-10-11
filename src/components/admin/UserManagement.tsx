import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Users, Search, Trash2, AlertTriangle, Shield, ImageIcon, MessageSquare, CalendarCheck } from 'lucide-react';

interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  is_admin: boolean;
}

interface UserStats {
  photos: number;
  guestbook_posts: number;
  rsvps: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleteStats, setDeleteStats] = useState<UserStats | null>(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, display_name, created_at')
        .order('created_at', { ascending: false });

      if (profileError) throw profileError;

      // Get admin roles
      const { data: adminRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (roleError) throw roleError;

      const adminIds = new Set(adminRoles?.map(r => r.user_id) || []);

      const usersWithRoles = (profiles || []).map(profile => ({
        ...profile,
        is_admin: adminIds.has(profile.id)
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    try {
      const [photos, guestbook, rsvps] = await Promise.all([
        supabase.from('photos').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('guestbook').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('rsvps').select('id', { count: 'exact', head: true }).eq('user_id', userId)
      ]);

      return {
        photos: photos.count || 0,
        guestbook_posts: guestbook.count || 0,
        rsvps: rsvps.count || 0
      };
    } catch (error) {
      console.error('Error loading user stats:', error);
      return { photos: 0, guestbook_posts: 0, rsvps: 0 };
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget || confirmEmail !== deleteTarget.email) {
      toast.error('Please type the correct email to confirm');
      return;
    }

    try {
      setActionLoading(true);

      // Delete related data first (respects cascade rules)
      await Promise.all([
        supabase.from('photos').delete().eq('user_id', deleteTarget.id),
        supabase.from('guestbook').delete().eq('user_id', deleteTarget.id),
        supabase.from('rsvps').delete().eq('user_id', deleteTarget.id),
        supabase.from('hunt_runs').delete().eq('user_id', deleteTarget.id),
        supabase.from('tournament_registrations').delete().eq('user_id', deleteTarget.id),
        supabase.from('user_roles').delete().eq('user_id', deleteTarget.id),
      ]);

      // Delete profile (which cascades to auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      toast.success(`User ${deleteTarget.email} has been deleted`);
      setDeleteTarget(null);
      setConfirmEmail('');
      setDeleteStats(null);
      await loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = async (user: User) => {
    if (user.is_admin) {
      toast.error('Cannot delete admin users. Remove admin role first.');
      return;
    }

    setDeleteTarget(user);
    const stats = await loadUserStats(user.id);
    setDeleteStats(stats);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-heading font-bold">User Management</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          View and manage user accounts. Exercise caution when deleting users.
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* User List */}
      <Card className="p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-4">
          All Users ({filteredUsers.length})
        </h3>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-medium truncate">{user.email}</p>
                    {user.is_admin && (
                      <Badge variant="default" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  {user.display_name && (
                    <p className="text-sm text-muted-foreground truncate">
                      {user.display_name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => openDeleteDialog(user)}
                  disabled={user.is_admin}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Safety Information */}
      <Card className="p-4 bg-muted/50 border-destructive/20">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Important:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>User deletion is permanent and cannot be undone</li>
              <li>All user content (photos, posts, RSVPs) will be deleted</li>
              <li>Admin users cannot be deleted (remove admin role first)</li>
              <li>Rate limited to 5 deletions per hour per admin</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                You are about to permanently delete{' '}
                <span className="font-semibold">{deleteTarget?.email}</span>
              </p>

              {deleteStats && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold text-sm text-foreground">
                    The following content will be deleted:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>{deleteStats.photos} photos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{deleteStats.guestbook_posts} posts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" />
                      <span>{deleteStats.rsvps} RSVPs</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground">
                  Type the user's email to confirm deletion:
                </label>
                <Input
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={deleteTarget?.email}
                  className="mt-2"
                />
              </div>

              <p className="text-xs text-destructive">
                This action cannot be undone!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={() => setConfirmEmail('')}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={confirmEmail !== deleteTarget?.email || actionLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {actionLoading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
