import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 AuthCallback: Processing magic link authentication...');
      
      try {
        // Parse the hash fragment for token parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken) {
          console.log('✅ AuthCallback: Found auth tokens in URL, establishing session...');
        }

        // Get the session (this will process the tokens from the URL automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ AuthCallback: Session error:', sessionError);
          setStatus('error');
          return;
        }

        if (session) {
          console.log('✅ AuthCallback: Magic link authentication successful!');
          setStatus('success');
          
          // Redirect to home page
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          console.log('❌ AuthCallback: No active session found');
          setStatus('error');
        }

      } catch (error) {
        console.error('❌ AuthCallback: Unexpected error:', error);
        setStatus('error');
      }
    };

    // If user is already authenticated, redirect immediately
    if (user) {
      console.log('✅ User already authenticated, redirecting...');
      navigate('/', { replace: true });
      return;
    }

    handleAuthCallback();
  }, [navigate, user]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent-gold" />
              <div className="text-center">
                <h2 className="font-heading text-xl mb-2">Checking authentication...</h2>
                <p className="font-body text-muted-foreground">
                  Please wait a moment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <h2 className="font-heading text-xl mb-2 text-accent-gold">
                  Welcome to the Bash!
                </h2>
                <p className="font-body text-muted-foreground">
                  Redirecting you now...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="font-heading text-xl">
              Authentication Issue
            </CardTitle>
          </div>
          <CardDescription className="font-body">
            Unable to verify your authentication. Please try signing in again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => navigate('/', { replace: true })}
            className="w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
          >
            Return Home and Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}