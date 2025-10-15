import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';
import { useSupportModal } from '@/contexts/SupportModalContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const { openSupportModal } = useSupportModal();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    setShowAuthModal(false);
    // Always navigate to homepage when canceling auth
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="max-w-md w-full mx-4 p-6 rounded-2xl shadow-lg bg-card border border-accent-gold/30">
          <h2 className="font-heading text-xl font-semibold mb-3 text-accent-gold">Please sign in to continue</h2>
          <p className="mb-4 text-muted-foreground">
            This feature requires authentication to ensure a personalized experience.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex-1 rounded-xl px-4 py-2 bg-accent-purple text-white hover:bg-accent-purple/90 transition-colors font-subhead"
            >
              Sign In
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 rounded-xl px-4 py-2 border-2 border-accent-gold/50 text-accent-gold hover:bg-accent-gold/10 transition-colors font-subhead"
            >
              Cancel
            </button>
          </div>
          
          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onOpenSupport={openSupportModal}
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}