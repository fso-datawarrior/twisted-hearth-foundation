import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2, Mail, ArrowLeft } from "lucide-react";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'expired' | 'consumed'>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 AuthCallback: Starting authentication process...');
        console.log('Current URL:', window.location.href);
        console.log('Loading state:', loading, 'User state:', !!user);
        
        // Parse URL hash parameters (Supabase uses hash fragments, not search params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlSearchParams = new URLSearchParams(window.location.search);
        
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));
        console.log('Search params:', Object.fromEntries(urlSearchParams.entries()));
        
        // Check if we have an error in the URL
        const error = hashParams.get('error') || urlSearchParams.get('error');
        const errorDescription = hashParams.get('error_description') || urlSearchParams.get('error_description');
        
        if (error) {
          console.log('🚨 Auth callback error detected:', error, errorDescription);
          
          // Clear URL hash immediately to prevent reprocessing
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Specific handling for different error types
          if (error === 'access_denied' && (hashParams.get('error_code') === 'otp_expired' || urlSearchParams.get('error_code') === 'otp_expired')) {
            setStatus('expired');
            setErrorMessage('The magic link has expired or been used already.');
          } else if (errorDescription?.includes('not found') || errorDescription?.includes('consumed') || errorDescription?.includes('invalid')) {
            setStatus('consumed');
            setErrorMessage('This magic link has been consumed by an email security scanner or used multiple times.');
          } else {
            setStatus('error');
            setErrorMessage(errorDescription || 'Authentication failed. Please try again.');
          }
          return;
        }

        // Check if we have auth tokens in the URL (hash fragments)
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('token_type');
        const expiresIn = hashParams.get('expires_in');
        
        console.log('🔑 Tokens found:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          expiresIn
        });
        
        if (accessToken && refreshToken) {
          console.log('🔄 Setting session with tokens...');
          
          // Clear URL hash immediately to prevent token exposure
          window.history.replaceState({}, document.title, window.location.pathname);
          
          try {
            // Set the session from the URL tokens
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            console.log('📋 Session result:', {
              hasData: !!data,
              hasUser: !!data?.user,
              hasSession: !!data?.session,
              error: sessionError
            });
            
            if (sessionError) {
              console.error('❌ Error setting session:', sessionError);
              
              // Check if this is a token consumption issue
              if (sessionError.message?.includes('not found') || sessionError.message?.includes('expired') || sessionError.message?.includes('invalid')) {
                setStatus('consumed');
                setErrorMessage('This magic link has been consumed by an email security scanner.');
              } else {
                setStatus('error');
                setErrorMessage('Failed to authenticate. Please try again.');
              }
              
              // Defensive fallback - try to get session from storage
              setTimeout(async () => {
                console.log('🔄 Attempting defensive fallback...');
                const { data: fallbackData } = await supabase.auth.getSession();
                if (fallbackData?.session?.user) {
                  console.log('✅ Fallback successful:', fallbackData.session.user.email);
                  setStatus('success');
                  navigate('/', { replace: true });
                }
              }, 1000);
              
            } else if (data?.user) {
              console.log('✅ Successfully authenticated user:', data.user.email);
              setStatus('success');
              toast({
                title: "Welcome back! 🎉",
                description: `Successfully signed in as ${data.user.email}`,
                duration: 5000,
              });
              
              // Redirect to homepage after successful auth
              setTimeout(() => {
                console.log('🔄 Redirecting to homepage...');
                navigate('/', { replace: true });
              }, 2000);
            } else {
              console.warn('⚠️ Session set but no user data received');
              setStatus('error');
              setErrorMessage('Authentication completed but user data is missing. Please try again.');
            }
          } catch (sessionError) {
            console.error('💥 Exception during session setting:', sessionError);
            setStatus('error');
            setErrorMessage('Something went wrong during authentication. Please try again.');
          }
        } else {
          console.log('🚫 No tokens found in URL');
          // Clear URL hash anyway
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Check if this looks like a consumed token scenario
          const token = urlSearchParams.get('token') || hashParams.get('token');
          if (token) {
            setStatus('consumed');
            setErrorMessage('This magic link appears to have been consumed by an email security scanner.');
          } else {
            setStatus('expired');
            setErrorMessage('Invalid authentication link. Please request a new magic link.');
          }
        }
      } catch (outerError) {
        console.error('💥 Critical error in AuthCallback:', outerError);
        // Clear URL hash to prevent loops
        window.history.replaceState({}, document.title, window.location.pathname);
        setStatus('error');
        setErrorMessage('A critical error occurred. Please try again.');
      }
    };

    // Always handle the callback, even if loading
    console.log('🔍 Auth state - Loading:', loading, 'User:', !!user);
    
    if (user && !loading) {
      // User is already authenticated, redirect them
      console.log('✅ User already authenticated:', user.email);
      toast({
        title: "Already signed in",
        description: "You're already authenticated!",
        duration: 3000,
      });
      navigate('/', { replace: true });
    } else {
      console.log('🔄 Processing auth callback...');
      handleAuthCallback();
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
          title: "New magic link sent! ✨",
          description: "Check your email. If using corporate email, also check spam folder and click the link immediately.",
          duration: 10000,
        });
        // Navigate back to home after successful resend
        setTimeout(() => navigate('/', { replace: true }), 2000);
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

  if (status === 'checking') {
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
                <p className="font-body text-xs text-muted-foreground mt-2">
                  Debug: Loading={loading ? 'true' : 'false'}, Status={status}
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
              {status === 'expired' ? 'Link Expired' : 
               status === 'consumed' ? 'Link Already Used' : 
               'Authentication Failed'}
            </CardTitle>
          </div>
          <CardDescription className="font-body">
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'consumed' && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium text-foreground mb-2">💡 This commonly happens when:</p>
              <ul className="space-y-1 text-muted-foreground text-xs">
                <li>• Corporate email security scanners click links automatically</li>
                <li>• Email preview panes load the link content</li>
                <li>• The same link is opened multiple times</li>
              </ul>
              <p className="mt-2 text-xs font-medium text-foreground">
                <strong>Tip:</strong> Try using a personal email (Gmail, Yahoo, etc.) to avoid security scanners.
              </p>
            </div>
          )}
          
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
              {status === 'consumed' ? 
                ' Email scanners sometimes consume links before you can click them.' :
                ' Request a new link if this one has expired.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}