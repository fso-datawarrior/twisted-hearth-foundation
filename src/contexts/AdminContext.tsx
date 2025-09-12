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
        const { data, error } = await supabase.rpc('is_admin');
        if (!error && data) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setIsAdminView(false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
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