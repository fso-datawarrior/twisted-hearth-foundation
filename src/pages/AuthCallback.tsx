import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

type ErrorType = 'expired' | 'already-used' | 'invalid' | 'generic';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'already-signed-in'>('checking');
  const [errorType, setErrorType] = useState<ErrorType>('generic');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      logger.info('🔐 AuthCallback: Processing magic link authentication...');
      
      // If user is already authenticated, show friendly message
      if (user) {
        logger.info('✅ User already authenticated');
        setStatus('already-signed-in');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
        return;
      }

      try {
        // Parse the hash fragment for token parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        const errorCode = hashParams.get('error_code');
        const errorDescription = hashParams.get('error_description');
        
        // If this is a password recovery link, let Supabase process it first, then redirect
        if (type === 'recovery') {
          logger.info('🔐 AuthCallback: Detected password recovery, processing recovery session...');
          
          // Let Supabase process the recovery session from the URL hash
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            logger.error('❌ AuthCallback: Error processing recovery session', sessionError);
            setErrorType('invalid');
            setStatus('error');
            return;
          }
          
          if (session) {
            logger.info('✅ AuthCallback: Recovery session established, redirecting to home with modal');
            // Wait a moment for the auth context to update, then redirect
            setTimeout(() => {
              navigate('/?modal=change-password', { replace: true });
            }, 500);
            return;
          } else {
            logger.error('❌ AuthCallback: No recovery session found');
            setErrorType('invalid');
            setStatus('error');
            return;
          }
        }
        
        // Check for error in URL params
        if (errorCode || errorDescription) {
          logger.error('❌ AuthCallback: Error in URL params', new Error(String(errorCode ?? errorDescription ?? 'unknown')));
          
          // Detect error type
          if (errorDescription?.includes('expired')) {
            setErrorType('expired');
          } else if (errorDescription?.includes('already') || errorCode === 'otp_expired') {
            setErrorType('already-used');
          } else {
            setErrorType('invalid');
          }
          
          setStatus('error');
          return;
        }
        
        if (accessToken) {
          logger.info('✅ AuthCallback: Found auth tokens in URL, establishing session...');
        }

        // Get the session (this will process the tokens from the URL automatically)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          logger.error('❌ AuthCallback: Session error', sessionError);
          
          // Detect error type from session error
          const errorMsg = sessionError.message.toLowerCase();
          if (errorMsg.includes('expired')) {
            setErrorType('expired');
          } else if (errorMsg.includes('invalid') || errorMsg.includes('used')) {
            setErrorType('already-used');
          } else {
            setErrorType('generic');
          }
          
          setStatus('error');
          return;
        }

        if (session) {
          logger.info('✅ AuthCallback: Magic link authentication successful!');
          setStatus('success');
          
          // Redirect to home page
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          logger.warn('❌ AuthCallback: No active session found');
          setErrorType('already-used');
          setStatus('error');
        }

      } catch (error) {
        logger.error('❌ AuthCallback: Unexpected error', error as Error);
        setErrorType('generic');
        setStatus('error');
      }
    };

    handleAuthCallback();
  }, [navigate, user]);

  const handleResendLink = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsResending(true);
    try {
      await signIn(email);
      toast({
        title: "Magic Link Sent!",
        description: "Check your email for a fresh sign-in link.\n🎃 Check your spam crypt if it doesn't appear!",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'expired':
        return {
          title: "Link Has Expired",
          description: "This magic link has expired. Magic links are valid for 60 minutes for security reasons."
        };
      case 'already-used':
        return {
          title: "Link Already Used",
          description: "This magic link has already been used. For security, each link only works once."
        };
      case 'invalid':
        return {
          title: "Invalid Link",
          description: "This magic link is not valid. It may have been tampered with or is malformed."
        };
      default:
        return {
          title: "Authentication Issue",
          description: "Unable to verify your authentication. Please try signing in again."
        };
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

  if (status === 'already-signed-in') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <h2 className="font-heading text-xl mb-2 text-accent-gold">
                  You're Already Signed In!
                </h2>
                <p className="font-body text-muted-foreground">
                  No need to use this link. Taking you to the app...
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

  const errorMessages = getErrorMessage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="font-heading text-xl">
              {errorMessages.title}
            </CardTitle>
          </div>
          <CardDescription className="font-body">
            {errorMessages.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resend Magic Link Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <Mail className="h-4 w-4 text-accent-gold" />
              <h3 className="font-subhead text-sm">Need a Fresh Link?</h3>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleResendLink()}
                className="font-body"
              />
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
                  'Send New Magic Link'
                )}
              </Button>
            </div>
          </div>

          {/* Return Home Button */}
          <Button
            onClick={() => navigate('/', { replace: true })}
            variant="outline"
            className="w-full font-subhead"
          >
            Return Home
          </Button>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center font-body">
            💡 Tip: After signing in, you'll stay logged in for days — no need to click the link again!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}