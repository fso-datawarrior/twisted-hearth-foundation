import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'expired'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have an error in the URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.log('Auth callback error:', error, errorDescription);
        
        if (error === 'access_denied' && searchParams.get('error_code') === 'otp_expired') {
          setStatus('expired');
          setErrorMessage('The magic link has expired or been used already.');
        } else {
          setStatus('error');
          setErrorMessage(errorDescription || 'Authentication failed. Please try again.');
        }
        return;
      }

      // Check if we have auth tokens in the URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      
      if (accessToken && refreshToken) {
        try {
          // Set the session from the URL tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setStatus('error');
            setErrorMessage('Failed to authenticate. Please try again.');
          } else if (data.user) {
            console.log('Successfully authenticated user:', data.user.email);
            setStatus('success');
            toast({
              title: "Welcome back! 🎉",
              description: `Successfully signed in as ${data.user.email}`,
              duration: 5000,
            });
            
            // Redirect to discussion page after successful auth
            setTimeout(() => {
              navigate('/discussion', { replace: true });
            }, 2000);
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          setStatus('error');
          setErrorMessage('Something went wrong. Please try again.');
        }
      } else {
        // No tokens found, this might be a direct access
        setStatus('error');
        setErrorMessage('Invalid authentication link. Please request a new magic link.');
      }
    };

    if (!loading) {
      if (user) {
        // User is already authenticated, redirect them
        toast({
          title: "Already signed in",
          description: "You're already authenticated!",
          duration: 3000,
        });
        navigate('/discussion', { replace: true });
      } else {
        handleAuthCallback();
      }
    }
  }, [searchParams, navigate, user, loading, toast]);

  const handleResendLink = async () => {
    const email = prompt('Please enter your email address to resend the magic link:');
    if (!email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        toast({
          title: "Failed to send magic link",
          description: error.message,
          variant: "destructive",
          duration: 6000,
        });
      } else {
        toast({
          title: "Magic link sent! ✨",
          description: "Check your email and click the new link to sign in.",
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Error resending magic link:', error);
      toast({
        title: "Error",
        description: "Failed to resend magic link. Please try again.",
        variant: "destructive",
        duration: 6000,
      });
    } finally {
      setIsResending(false);
    }
  };

  if (loading || status === 'checking') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-accent-gold" />
              <div className="text-center">
                <h2 className="font-heading text-xl mb-2">Signing you in...</h2>
                <p className="font-body text-muted-foreground">
                  Please wait while we authenticate your magic link.
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
                  You're successfully signed in. Redirecting you now...
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
              {status === 'expired' ? 'Link Expired' : 'Authentication Failed'}
            </CardTitle>
          </div>
          <CardDescription className="font-body">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-3">
            <Button
              onClick={handleResendLink}
              disabled={isResending}
              className="w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send New Magic Link
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/', { replace: true })}
              className="w-full border-accent-purple/30 hover:bg-accent-purple/10"
            >
              Back to Home
            </Button>
          </div>
          
          <div className="text-center">
            <p className="font-body text-xs text-muted-foreground">
              Magic links expire after 1 hour and can only be used once. 
              Email scanners sometimes "use" links automatically, causing them to expire.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}