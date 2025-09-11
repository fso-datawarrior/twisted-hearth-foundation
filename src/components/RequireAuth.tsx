import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <>
        {/* Full screen overlay - hide when auth modal is open */}
        {!showAuthModal && (
          <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-background border border-accent/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Please sign in to continue</h2>
              <p className="mb-6 text-muted-foreground">
                This feature requires authentication to ensure a personalized experience.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full"
                  size="lg"
                >
                  Sign In
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return <>{children}</>;
}