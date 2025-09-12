import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface AdminContextType {
  isAdmin: boolean;
  isAdminView: boolean;
  toggleAdminView: () => void;
  switchToUserView: () => void;
  switchToAdminView: () => void;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Check admin status when user changes
  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  // Load admin view preference from localStorage
  useEffect(() => {
    if (isAdmin) {
      const savedView = localStorage.getItem('adminView');
      if (savedView === 'true') {
        setIsAdminView(true);
      }
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      if (user) {
        console.log('🔐 AdminContext: Checking admin status for user:', user.email);
        
        // First, ensure admins are seeded
        await supabase.rpc('ensure_admins_seeded');
        
        // Check admin status using the enhanced function
        const { data: isAdminResult, error: adminError } = await supabase.rpc('check_admin_status');
        
        console.log('🔐 AdminContext: Admin check result:', { isAdminResult, adminError });
        
        if (!adminError && isAdminResult === true) {
          console.log('✅ AdminContext: User is confirmed admin');
          setIsAdmin(true);
        } else {
          console.log('❌ AdminContext: User is not admin or error occurred');
          setIsAdmin(false);
        }
      } else {
        console.log('🔐 AdminContext: No user, resetting admin state');
        setIsAdmin(false);
        setIsAdminView(false);
      }
    } catch (error) {
      console.error('💥 AdminContext: Error checking admin status:', error);
      setIsAdmin(false);
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
    loading,
  };

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