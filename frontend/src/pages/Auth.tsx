import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useApiHealth } from "../hooks/useApiHealth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { MaintenanceBanner } from "../components/MaintenanceBanner";

function Auth() {
  const {
    loginWithGoogle,
    loginWithTwitch,
    error: authError,
    user,
  } = useAuth();

  // Monitor API health status
  const {
    isHealthy,
    isChecking,
    checkHealth,
  } = useApiHealth();

  const location = useLocation();
  const navigate = useNavigate();

  // Get return URL if redirected from protected route
  const from = location.state?.from?.pathname || "/dashboard";

  // Check if this is an OAuth callback and redirect if user is authenticated
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hasToken = urlParams.has("token");

    console.log("Auth component: checking for OAuth callback...");
    console.log("Has token in URL:", hasToken);
    console.log("Current user:", user);
    console.log("Current path:", location.pathname);

    // Only redirect if user is authenticated and this is not an OAuth callback
    // OAuth callbacks should be handled by AuthContext first
    if (user && !hasToken) {
      console.log("User authenticated, redirecting to dashboard...");
      // Redirect to dashboard after successful authentication
      navigate("/dashboard", { replace: true });
    }
  }, [user, location, navigate]);

  const handleGoogleSignIn = () => {
    loginWithGoogle();
  };

  const handleTwitchSignIn = () => {
    loginWithTwitch();
  };

  return (
    <div className="min-h-screen bg-teal-gradient relative overflow-hidden lg:flex justify-center items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
        {/* Mobile-optimized background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse sm:hidden"></div>
      </div>

      {/* Mobile Compact Header */}
      <div className="lg:hidden relative z-10 pt-6 pb-4">
        <div className="max-w-md mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <img src="/logo.png" alt="neustream" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-medium text-white">neustream</h1>
          </div>
        </div>
      </div>

      <main className="relative py-4 px-4 sm:py-16 sm:px-6 lg:py-24 lg:px-8 lg:pt-8">
        {/* Show maintenance banner if API is down */}
        <MaintenanceBanner
          isVisible={!isHealthy}
          onRetry={() => checkHealth()}
          isRetrying={isChecking}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-20">
            {/* Left side - Branding (Desktop only) */}
            <div className="flex-1 max-w-xl text-center lg:text-left text-white order-2 lg:order-1 hidden lg:block ">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 sm:mb-8 bg-white/10 rounded-2xl sm:rounded-3xl backdrop-blur-sm border border-white/20">
                <img
                  src="/logo.png"
                  alt="neustream Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 animate-oscillate"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight mb-4 sm:mb-6 leading-tight">
                Welcome to{" "}
                <div className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent font-bold tracking-tighter">
                  neustream.
                </div>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-light opacity-90 mb-6 sm:mb-8 leading-relaxed">
                The professional multistreaming platform for content creators
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-base sm:text-lg">
                      Stream to multiple platforms
                    </h3>
                    <p className="opacity-80 text-sm sm:text-base">
                      Broadcast to YouTube, Twitch, Facebook, and more
                      simultaneously
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-base sm:text-lg">
                      No performance impact
                    </h3>
                    <p className="opacity-80 text-sm sm:text-base">
                      Cloud encoding keeps your machine fast and responsive
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-base sm:text-lg">
                      Enterprise-grade security
                    </h3>
                    <p className="opacity-80 text-sm sm:text-base">
                      Your stream keys and connections are always protected
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Auth form */}
            <div className="w-full max-w-md mx-auto order-1 lg:order-2 lg:flex-none lg:mx-0">
              <Card className="w-full shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome</CardTitle>
                  <CardDescription>
                    Sign in to your account to continue
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {authError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Google Sign In */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={!isHealthy}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>

                  {/* Twitch Sign In */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleTwitchSignIn}
                    disabled={!isHealthy}
                  >
                    <svg
                      viewBox="0 0 256 268"
                      xmlns="http://www.w3.org/2000/svg"
                      width="256"
                      height="268"
                    >
                      <path
                        fill="#9146FF"
                        d="M17.458 0L0 46.556v186.201h63.983v34.934h34.931l34.898-34.934h52.36L256 162.954V0H17.458zm23.259 23.263H232.73v128.029l-40.739 40.741H128L93.113 226.92v-34.886H40.717V23.263zm64.008 116.405H128V69.844h-23.275v69.824zm63.997 0h23.27V69.844h-23.27v69.824z"
                      />
                    </svg>
                    Continue with Twitch
                  </Button>

                  <div className="text-xs text-center text-muted-foreground">
                    By signing in, you agree to our{" "}
                    <Link
                      to="/terms"
                      className="underline hover:text-foreground"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="underline hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Footer - Trust Indicators */}
      <div className="lg:hidden relative z-10 pb-6 pt-2">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2 text-xs">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>10,000+ Creators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
