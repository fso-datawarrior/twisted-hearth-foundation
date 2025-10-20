# PHASE 6: Additional Features & Enhancements

**Branch**: v-3.0.3.7-Phase6-AdditionalFeatureEnhancements  
**Priority**: P3 (Low - Enhancements)  
**Estimated Time**: 4-5 hours

## Overview
Polish notification system with bell icon in navbar, dedicated notifications page, and database RLS policies for security.

---

## 6.1 Notification Bell in Navbar

### Files to Modify
- `src/components/NavBar.tsx`

### Implementation

#### 1. Add Notification State and Query (After line 35)

```tsx
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Add inside NavBar component, after other hooks
const { data: unreadCount } = useQuery({
  queryKey: ['unread-notifications', user?.id],
  queryFn: async () => {
    if (!user) return 0;
    
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    
    if (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
    
    return data?.length || 0;
  },
  enabled: !!user,
  refetchInterval: 30000, // Refetch every 30 seconds
});

const [showNotifications, setShowNotifications] = useState(false);

// Fetch recent notifications
const { data: recentNotifications } = useQuery({
  queryKey: ['recent-notifications', user?.id],
  queryFn: async () => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data || [];
  },
  enabled: !!user && showNotifications,
});
```

#### 2. Add Mark as Read Handler

```tsx
const handleMarkAsRead = async (notificationId: string) => {
  if (!user) return;
  
  try {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    // Refetch queries
    queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const handleMarkAllAsRead = async () => {
  if (!user) return;
  
  try {
    await supabase.rpc('mark_all_notifications_read');
    
    // Refetch queries
    queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    queryClient.invalidateQueries({ queryKey: ['recent-notifications'] });
    
    toast({
      title: "All cleared!",
      description: "Marked all notifications as read.",
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
};
```

#### 3. Add Notification Bell to Desktop Nav (After audio toggle, line 232)

```tsx
{/* Notification Bell - Desktop */}
{user && (
  <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className="relative hover:bg-accent-purple/10 font-subhead transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-ink" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent 
      align="end" 
      className="w-80 max-h-96 overflow-y-auto bg-black/90 backdrop-blur-sm border-accent-purple/30"
    >
      <div className="p-3 border-b border-accent-purple/30">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-accent-gold hover:text-accent-gold/80"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>
      
      {recentNotifications && recentNotifications.length > 0 ? (
        <>
          {recentNotifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex flex-col items-start p-3 cursor-pointer ${
                !notification.is_read ? 'bg-accent-purple/10' : ''
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  handleMarkAsRead(notification.id);
                }
                if (notification.link) {
                  window.location.href = notification.link;
                }
              }}
            >
              <div className="flex items-start gap-2 w-full">
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-accent-gold rounded-full mt-1.5 flex-shrink-0"></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
          
          <div className="p-3 border-t border-accent-purple/30">
            <Link to="/notifications" onClick={() => setShowNotifications(false)}>
              <Button variant="ghost" size="sm" className="w-full text-accent-gold hover:bg-accent-gold/10">
                View All Notifications
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No notifications yet</p>
        </div>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
)}
```

#### 4. Add Notification Bell to Mobile (In hamburger menu, after audio toggle, line 485)

```tsx
{/* Mobile Notification Bell */}
{user && (
  <div className="pt-2 border-t border-accent-purple/30">
    <Link to="/notifications" onClick={() => setIsMenuOpen(false)}>
      <Button
        variant="ghost"
        className="w-full font-subhead hover:bg-accent-purple/10 relative"
      >
        <div className="flex items-center justify-center gap-2 w-full">
          <Bell size={16} />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-auto bg-accent-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      </Button>
    </Link>
  </div>
)}
```

### Testing
- [ ] Bell icon appears in navbar when logged in
- [ ] Unread count badge shows correct number
- [ ] Badge hidden when no unread notifications
- [ ] Clicking bell opens dropdown
- [ ] Recent notifications displayed (5 max)
- [ ] Unread notifications highlighted
- [ ] "Mark all read" button works
- [ ] Clicking notification navigates to link
- [ ] "View All" link goes to notifications page
- [ ] Mobile menu shows notification count

---

## 6.2 Dedicated Notifications Page

### New Page File
**File**: `src/pages/Notifications.tsx`

```tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RequireAuth from '@/components/RequireAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  metadata: any;
}

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [user, filter]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      loadNotifications();
    } catch (error: any) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase.rpc('mark_all_notifications_read');
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
      
      loadNotifications();
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      loadNotifications();
      
      toast({
        title: "Deleted",
        description: "Notification removed",
      });
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment':
      case 'reply':
        return '💬';
      case 'reaction':
        return '❤️';
      case 'rsvp_update':
        return '📅';
      case 'event_update':
        return '🎉';
      case 'admin_announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <RequireAuth>
      <div className="min-h-screen bg-background">
        <main className="pt-28 pb-12 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold text-accent-gold flex items-center gap-3">
                  <Bell className="h-8 w-8" />
                  Notifications
                </h1>
                <p className="text-muted-foreground mt-2">
                  {unreadCount > 0 
                    ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                    : 'You\'re all caught up!'
                  }
                </p>
              </div>
              
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="border-accent-purple/30"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">
                  All ({notifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
              </div>
            ) : notifications.length === 0 ? (
              <Card className="p-12 text-center border-accent-purple/30">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-muted-foreground">
                  {filter === 'unread' 
                    ? 'You\'re all caught up! Check back later for new updates.'
                    : 'When you get notifications, they\'ll appear here.'
                  }
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-4 border-accent-purple/30 transition-all ${
                      !notification.is_read ? 'bg-accent-purple/5 border-accent-purple/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-white mb-1">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-accent-gold rounded-full mt-2 flex-shrink-0"></div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {notification.link && (
                            <Link to={notification.link}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                View
                              </Button>
                            </Link>
                          )}
                          
                          {!notification.is_read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark read
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs text-accent-red hover:text-accent-red/80"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </RequireAuth>
  );
}
```

### Add Route

**File**: `src/App.tsx`

```tsx
// Add import
import Notifications from "@/pages/Notifications";

// Add route (in Routes section)
<Route path="/notifications" element={<Notifications />} />
```

### Testing
- [ ] Notifications page loads
- [ ] All notifications displayed
- [ ] Unread filter works
- [ ] Mark as read button works
- [ ] Mark all as read works
- [ ] Delete notification works
- [ ] View link navigates correctly
- [ ] Loading state shows
- [ ] Empty state shows when no notifications
- [ ] Icons match notification types

---

## 6.3 Database RLS Policies (Already in Phase 4)

These were already implemented in Phase 4 migration but here's a summary:

### Policies Implemented
- ✅ Users can view their own notifications
- ✅ Users can update their own notifications
- ✅ System can insert notifications
- ✅ Users can delete their own notifications
- ✅ Admins can view all notifications
- ✅ Users can manage their own preferences

### Additional Testing
- [ ] Non-admin users cannot see other users' notifications
- [ ] Users cannot modify other users' notifications
- [ ] Admins can view all notifications for moderation
- [ ] Notification preferences are private
- [ ] Database triggers fire with proper permissions

---

## Completion Checklist

- [ ] Notification bell added to navbar (desktop & mobile)
- [ ] Unread count badge displays correctly
- [ ] Dropdown shows recent notifications
- [ ] Mark as read functionality works
- [ ] Dedicated notifications page created
- [ ] All/unread filtering works
- [ ] Delete notifications works
- [ ] Route added to App.tsx
- [ ] RLS policies verified
- [ ] Comprehensive testing complete
- [ ] Documentation updated
- [ ] Ready to commit

## Git Commit Message

```
feat(notifications): add notification bell and dedicated page

- Add notification bell icon to navbar with unread count badge
- Implement dropdown showing 5 most recent notifications
- Create dedicated /notifications page with full history
- Add filtering by all/unread notifications
- Implement mark as read and delete functionality
- Show notification type icons and timestamps
- Link notifications to relevant content
- Respect user notification preferences
- Optimize with real-time query updates every 30 seconds

Completes notification system with full user interface.
```

## Future Enhancements (Post-Launch)

1. **Real-time Notifications**: Use Supabase real-time subscriptions to update notifications without polling
2. **Push Notifications**: Implement web push notifications for desktop
3. **Notification Grouping**: Group similar notifications (e.g., "3 new reactions on your photos")
4. **Notification Sound**: Optional sound effect for new notifications
5. **Rich Notifications**: Include images/avatars in notification content
6. **Notification Actions**: Quick actions directly from dropdown (like/reply without navigation)

