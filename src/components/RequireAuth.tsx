import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    setShowAuthModal(false);
    // Navigate back or to homepage
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
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
      <div className="max-w-md mx-auto my-10 p-6 rounded-2xl shadow-lg bg-card border">
        <h2 className="text-xl font-semibold mb-3 text-foreground">Please sign in to continue</h2>
        <p className="mb-4 text-muted-foreground">
          This feature requires authentication to ensure a personalized experience.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAuthModal(true)}
            className="flex-1 rounded-xl px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 rounded-xl px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return <>{children}</>;
}