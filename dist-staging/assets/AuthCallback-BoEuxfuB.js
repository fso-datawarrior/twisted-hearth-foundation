import { j as jsxRuntimeExports } from "./ui-34HFLAJ-.js";
import { r as reactExports } from "./vendor-BeeObON2.js";
import { c as createLucideIcon, a as cn, k as useSearchParams, l as useNavigate, u as useAuth, d as useToast, B as Button, s as supabase } from "./index-ScHqtWhW.js";
import { M as Mail } from "./mail-DlWE3wHw.js";
import "./supabase-hOZgWq6G.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleAlert = createLucideIcon("CircleAlert", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["line", { x1: "12", x2: "12", y1: "8", y2: "12", key: "1pkeuh" }],
  ["line", { x1: "12", x2: "12.01", y1: "16", y2: "16", key: "4dfq90" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleCheckBig = createLucideIcon("CircleCheckBig", [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LoaderCircle = createLucideIcon("LoaderCircle", [
  ["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]
]);
const Card = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("rounded-lg border bg-card text-card-foreground shadow-sm", className), ...props }));
Card.displayName = "Card";
const CardHeader = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { ref, className: cn("text-2xl font-semibold leading-none tracking-tight", className), ...props })
);
CardTitle.displayName = "CardTitle";
const CardDescription = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = reactExports.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = reactExports.useState("checking");
  const [errorMessage, setErrorMessage] = reactExports.useState("");
  const [isResending, setIsResending] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔐 AuthCallback: Starting authentication process...");
        console.log("Current URL:", window.location.href);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlSearchParams = new URLSearchParams(window.location.search);
        console.log("Hash params:", Object.fromEntries(hashParams.entries()));
        console.log("Search params:", Object.fromEntries(urlSearchParams.entries()));
        const error = hashParams.get("error") || urlSearchParams.get("error");
        const errorDescription = hashParams.get("error_description") || urlSearchParams.get("error_description");
        if (error) {
          console.log("🚨 Auth callback error detected:", error, errorDescription);
          window.history.replaceState({}, document.title, window.location.pathname);
          if (error === "access_denied" && (hashParams.get("error_code") === "otp_expired" || urlSearchParams.get("error_code") === "otp_expired")) {
            setStatus("expired");
            setErrorMessage("The magic link has expired or been used already.");
          } else {
            setStatus("error");
            setErrorMessage(errorDescription || "Authentication failed. Please try again.");
          }
          return;
        }
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const tokenType = hashParams.get("token_type");
        const expiresIn = hashParams.get("expires_in");
        console.log("🔑 Tokens found:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          tokenType,
          expiresIn
        });
        if (accessToken && refreshToken) {
          console.log("🔄 Setting session with tokens...");
          window.history.replaceState({}, document.title, window.location.pathname);
          try {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            console.log("📋 Session result:", {
              hasData: !!data,
              hasUser: !!(data == null ? void 0 : data.user),
              hasSession: !!(data == null ? void 0 : data.session),
              error: sessionError
            });
            if (sessionError) {
              console.error("❌ Error setting session:", sessionError);
              setStatus("error");
              setErrorMessage("Failed to authenticate. Please try again.");
              setTimeout(async () => {
                var _a;
                console.log("🔄 Attempting defensive fallback...");
                const { data: fallbackData } = await supabase.auth.getSession();
                if ((_a = fallbackData == null ? void 0 : fallbackData.session) == null ? void 0 : _a.user) {
                  console.log("✅ Fallback successful:", fallbackData.session.user.email);
                  setStatus("success");
                  navigate("/discussion", { replace: true });
                }
              }, 1e3);
            } else if (data == null ? void 0 : data.user) {
              console.log("✅ Successfully authenticated user:", data.user.email);
              setStatus("success");
              toast({
                title: "Welcome back! 🎉",
                description: `Successfully signed in as ${data.user.email}`,
                duration: 5e3
              });
              setTimeout(() => {
                console.log("🔄 Redirecting to discussion...");
                navigate("/discussion", { replace: true });
              }, 2e3);
            } else {
              console.warn("⚠️ Session set but no user data received");
              setStatus("error");
              setErrorMessage("Authentication completed but user data is missing. Please try again.");
            }
          } catch (sessionError) {
            console.error("💥 Exception during session setting:", sessionError);
            setStatus("error");
            setErrorMessage("Something went wrong during authentication. Please try again.");
          }
        } else {
          console.log("🚫 No tokens found in URL");
          window.history.replaceState({}, document.title, window.location.pathname);
          setStatus("error");
          setErrorMessage("Invalid authentication link. Please request a new magic link.");
        }
      } catch (outerError) {
        console.error("💥 Critical error in AuthCallback:", outerError);
        window.history.replaceState({}, document.title, window.location.pathname);
        setStatus("error");
        setErrorMessage("A critical error occurred. Please try again.");
      }
    };
    if (!loading) {
      console.log("🔍 Auth loading complete. User status:", !!user);
      if (user) {
        console.log("✅ User already authenticated:", user.email);
        toast({
          title: "Already signed in",
          description: "You're already authenticated!",
          duration: 3e3
        });
        navigate("/discussion", { replace: true });
      } else {
        console.log("🔄 No authenticated user, processing callback...");
        handleAuthCallback();
      }
    } else {
      console.log("⏳ Auth still loading...");
    }
  }, [searchParams, navigate, user, loading, toast]);
  const handleResendLink = async () => {
    const email = prompt("Please enter your email address to resend the magic link:");
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
          duration: 6e3
        });
      } else {
        toast({
          title: "Magic link sent! ✨",
          description: "Check your email and click the new link to sign in.",
          duration: 8e3
        });
      }
    } catch (error) {
      console.error("Error resending magic link:", error);
      toast({
        title: "Error",
        description: "Failed to resend magic link. Please try again.",
        variant: "destructive",
        duration: 6e3
      });
    } finally {
      setIsResending(false);
    }
  };
  if (loading || status === "checking") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-accent-gold" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-xl mb-2", children: "Signing you in..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: "Please wait while we authenticate your magic link." })
      ] })
    ] }) }) }) });
  }
  if (status === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "w-full max-w-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-12 w-12 text-green-500" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-heading text-xl mb-2 text-accent-gold", children: "Welcome to the Bash!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-muted-foreground", children: "You're successfully signed in. Redirecting you now..." })
      ] })
    ] }) }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6 text-destructive" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "font-heading text-xl", children: status === "expired" ? "Link Expired" : "Authentication Failed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { className: "font-body", children: errorMessage })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleResendLink,
            disabled: isResending,
            className: "w-full bg-accent-gold hover:bg-accent-gold/80 text-background font-subhead",
            children: isResending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Sending..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "mr-2 h-4 w-4" }),
              "Send New Magic Link"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: () => navigate("/", { replace: true }),
            className: "w-full border-accent-purple/30 hover:bg-accent-purple/10",
            children: "Back to Home"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-body text-xs text-muted-foreground", children: 'Magic links expire after 1 hour and can only be used once. Email scanners sometimes "use" links automatically, causing them to expire.' }) })
    ] })
  ] }) });
}
export {
  AuthCallback as default
};
//# sourceMappingURL=AuthCallback-BoEuxfuB.js.map
