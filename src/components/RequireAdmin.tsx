import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface RequireAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAdmin({ children, fallback }: RequireAdminProps) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setAdminLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading || adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-10 p-6 rounded-2xl shadow-lg bg-black/70 text-white">
        <h2 className="text-xl font-semibold mb-3">Authentication Required</h2>
        <p className="mb-4 text-muted-foreground">
          Please sign in to access the admin area.
        </p>
        <Button onClick={() => navigate('/auth')} className="w-full">
          Sign In
        </Button>
      </div>
    );
  }

  if (!isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="max-w-md mx-auto my-10 p-6 rounded-2xl shadow-lg bg-destructive/20 text-foreground">
        <h2 className="text-xl font-semibold mb-3">Access Denied</h2>
        <p className="mb-4 text-muted-foreground">
          You don't have admin privileges to access this area.
        </p>
        <Button onClick={() => navigate('/')} variant="outline" className="w-full">
          Return Home
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}