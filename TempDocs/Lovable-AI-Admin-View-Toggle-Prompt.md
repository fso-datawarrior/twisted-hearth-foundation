# 🎭 Admin View Toggle Implementation
## Lovable AI Implementation Prompt

### 📋 **Project Overview**
Implement an admin view toggle system that allows designated admin users to switch between user view and admin view through the user dropdown menu. This system should provide seamless switching between perspectives while maintaining proper security and user experience.

---

## 🎯 **Core Requirements**

### **Admin User Management**
- **Admin Emails**: `data.warrior2023@gmail.com`, `kat_crouch@hotmail.com`, `fso@data-warrior.com`
- **Role Detection**: Server-side validation of admin status
- **View Toggle**: Toggle between user view and admin view
- **State Persistence**: Remember view preference across sessions

### **UI/UX Requirements**
- **User Dropdown Menu**: Add admin view toggle option
- **Visual Indicators**: Clear indication of current view mode
- **Smooth Transitions**: Seamless switching between views
- **Mobile Responsive**: Works on all device sizes

---

## 🔧 **Technical Implementation**

### **1. Admin Role Detection & Management**

#### **Database Setup (if not already implemented)**
```sql
-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert admin users
INSERT INTO public.user_roles (user_id, role) 
SELECT id, 'admin' 
FROM auth.users 
WHERE email IN (
  'data.warrior2023@gmail.com', 
  'kat_crouch@hotmail.com', 
  'fso@data-warrior.com'
)
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;
```

#### **TypeScript Types**
```typescript
// Add to your existing types
export interface UserRole {
  user_id: string;
  role: 'admin';
  created_at: string;
}

export interface AdminContextType {
  isAdmin: boolean;
  isAdminView: boolean;
  toggleAdminView: () => void;
  switchToUserView: () => void;
  switchToAdminView: () => void;
}
```

### **2. Admin Context & State Management**

#### **AdminContext.tsx**
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Load admin view preference from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('adminView');
    if (savedView === 'true' && isAdmin) {
      setIsAdminView(true);
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.rpc('is_admin');
        if (!error && data) {
          setIsAdmin(true);
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminView = () => {
    const newView = !isAdminView;
    setIsAdminView(newView);
    localStorage.setItem('adminView', newView.toString());
  };

  const switchToUserView = () => {
    setIsAdminView(false);
    localStorage.setItem('adminView', 'false');
  };

  const switchToAdminView = () => {
    if (isAdmin) {
      setIsAdminView(true);
      localStorage.setItem('adminView', 'true');
    }
  };

  // Reset admin view on logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsAdminView(false);
        localStorage.removeItem('adminView');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    isAdmin,
    isAdminView,
    toggleAdminView,
    switchToUserView,
    switchToAdminView,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
```

### **3. Enhanced User Dropdown Menu**

#### **Updated NavBar Component**
```typescript
import { useAdmin } from '@/contexts/AdminContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Shield, 
  Eye, 
  Settings,
  ChevronDown 
} from 'lucide-react';

export const UserDropdown = () => {
  const { isAdmin, isAdminView, toggleAdminView, switchToUserView } = useAdmin();
  const [user, setUser] = useState(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium">
            {user?.email?.split('@')[0] || 'User'}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        {/* Admin View Toggle - Only show for admins */}
        {isAdmin && (
          <>
            <DropdownMenuItem 
              onClick={toggleAdminView}
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>
                {isAdminView ? 'Switch to User View' : 'Switch to Admin View'}
              </span>
            </DropdownMenuItem>
            
            {/* Current View Indicator */}
            <div className="px-2 py-1 text-xs text-muted-foreground bg-muted rounded">
              Current View: {isAdminView ? 'Admin' : 'User'}
            </div>
            
            <DropdownMenuSeparator />
          </>
        )}

        {/* User Profile */}
        <DropdownMenuItem className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        {/* Admin Settings - Only show in admin view */}
        {isAdmin && isAdminView && (
          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Admin Settings</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

### **4. Admin View Layout Component**

#### **AdminLayout.tsx**
```typescript
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Shield, Users, BarChart3, Settings } from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdminView, switchToUserView } = useAdmin();

  if (!isAdminView) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <Badge variant="secondary" className="bg-white text-purple-600">
              Admin View
            </Badge>
          </div>
          
          <Button 
            onClick={switchToUserView}
            variant="outline"
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Eye className="w-4 h-4 mr-2" />
            Switch to User View
          </Button>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8 py-4">
            <a href="/admin/users" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
              <Users className="w-4 h-4" />
              Users
            </a>
            <a href="/admin/content" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
              <Settings className="w-4 h-4" />
              Content Moderation
            </a>
            <a href="/admin/analytics" className="flex items-center gap-2 text-gray-700 hover:text-purple-600">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </a>
          </nav>
        </div>
      </div>

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
};
```

### **5. Admin Dashboard Components**

#### **AdminUsers.tsx**
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch all users
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all RSVPs
      const { data: rsvpsData } = await supabase
        .from('rsvps')
        .select(`
          *,
          users!inner(name, email)
        `)
        .order('created_at', { ascending: false });

      setUsers(usersData || []);
      setRsvps(rsvpsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading admin data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RSVPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{rsvps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {rsvps.filter(r => r.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent RSVPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rsvps.map((rsvp) => (
              <div key={rsvp.rsvp_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{rsvp.users.name}</div>
                  <div className="text-sm text-gray-500">{rsvp.users.email}</div>
                  <div className="text-sm">Guests: {rsvp.num_guests}</div>
                </div>
                <Badge variant={rsvp.status === 'confirmed' ? 'default' : 'secondary'}>
                  {rsvp.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### **6. App Integration**

#### **Updated App.tsx**
```typescript
import { AdminProvider } from '@/contexts/AdminContext';
import { AdminLayout } from '@/components/AdminLayout';

function App() {
  return (
    <AdminProvider>
      <AdminLayout>
        {/* Your existing app content */}
        <Router>
          {/* Your existing routes */}
        </Router>
      </AdminLayout>
    </AdminProvider>
  );
}

export default App;
```

---

## 🎨 **UI/UX Enhancements**

### **Visual Indicators**
- **Admin Banner**: Purple gradient header when in admin view
- **View Badge**: Clear indication of current view mode
- **Admin Icons**: Shield icons for admin-related actions
- **Color Coding**: Purple theme for admin features

### **Responsive Design**
- **Mobile Menu**: Collapsible admin navigation on mobile
- **Touch Targets**: Adequate spacing for touch interactions
- **Readable Text**: Proper contrast and font sizes

### **Accessibility**
- **Screen Reader Support**: Proper ARIA labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators

---

## 🔒 **Security Considerations**

### **Server-Side Validation**
```typescript
// Always validate admin status on the server
export const validateAdminAccess = async (userId: string) => {
  const { data, error } = await supabase.rpc('is_admin');
  if (error || !data) {
    throw new Error('Unauthorized admin access');
  }
  return true;
};
```

### **RLS Policies**
- Admin users can see all data in admin view
- Regular users can only see their own data
- Admin actions are logged for audit purposes

---

## 📱 **Mobile Experience**

### **Responsive Admin Menu**
```typescript
// Mobile-friendly admin navigation
const MobileAdminNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        Admin Menu
        <ChevronDown className="w-4 h-4" />
      </Button>
      
      {isOpen && (
        <div className="mt-2 space-y-2">
          {/* Admin navigation items */}
        </div>
      )}
    </div>
  );
};
```

---

## ✅ **Acceptance Criteria**

### **Functionality**
- [ ] Admin users can toggle between user and admin views
- [ ] View preference persists across sessions
- [ ] Non-admin users cannot access admin features
- [ ] Admin view shows comprehensive dashboard
- [ ] User dropdown shows appropriate options based on role

### **UI/UX**
- [ ] Clear visual indicators for current view
- [ ] Smooth transitions between views
- [ ] Mobile-responsive design
- [ ] Accessible navigation

### **Security**
- [ ] Server-side admin validation
- [ ] Proper RLS policies
- [ ] Admin actions are logged
- [ ] No unauthorized access possible

---

## 🚨 **Important Notes**

1. **Admin Setup**: Ensure the three specified emails are added to the user_roles table
2. **State Management**: Admin view state should reset on logout
3. **Error Handling**: Graceful fallback if admin status check fails
4. **Performance**: Lazy load admin components to avoid unnecessary bundle size
5. **Testing**: Test with both admin and non-admin users

---

## 🔄 **Implementation Steps**

1. **Phase 1**: Set up admin context and basic toggle functionality
2. **Phase 2**: Implement admin dashboard components
3. **Phase 3**: Add admin-specific features and navigation
4. **Phase 4**: Polish UI/UX and add mobile responsiveness
5. **Phase 5**: Add comprehensive testing and error handling

This implementation provides a complete admin view toggle system that maintains security while offering a seamless user experience for administrators.
