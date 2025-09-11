import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';
import { useState } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
      <div className="max-w-md mx-auto my-10 p-6 rounded-2xl shadow-lg bg-card text-card-foreground">
        <h2 className="text-xl font-semibold mb-3">Please sign in to continue</h2>
        <p className="mb-4 text-muted-foreground">
          This feature requires authentication to ensure a personalized experience.
        </p>
        <button
          onClick={() => setShowAuthModal(true)}
          className="w-full rounded-xl px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign In
        </button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </div>
    );
  }

  return <>{children}</>;
}