import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);

  const {
    login,
    register,
    loginWithGoogle,
    loginWithTwitch,
    error: authError,
    user,
  } = useAuth();

  const { mutate: forgotPasswordMutation } = useMutation({
    mutationFn: async (email: string) => {
      return await authService.forgotPassword(email);
    },
    onSuccess: () => {
      toast.success("Password reset email sent! Please check your inbox.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to send reset email");
    },
  });
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

  const authMutation = useMutation({
    mutationFn: async (data) => {
      const { email, password } = data;
      if (isLogin) {
        return await login(email, password);
      } else {
        return await register(email, password);
      }
    },
    onSuccess: (result) => {
      // Check if this was an email verification flow
      if (result && result.requiresVerification) {
        // Show success toast
        toast.success("Account created! Please check your email to verify your account.");
        // Don't navigate - stay on auth page
        return;
      }

      // Normal successful auth (shouldn't happen for registration)
      navigate(from, { replace: true });
    },
    onError: (error) => {
      setError(error.message || "Authentication failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    authMutation.mutate(formData);
  };

  const handleGoogleSignIn = () => {
    setError("");
    loginWithGoogle();
  };

  const handleTwitchSignIn = () => {
    setError("");
    loginWithTwitch();
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setFormData({ email: "", password: "" });
    setShowForgotPassword(false);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setError("Please enter your email address");
      return;
    }
    setIsSubmittingForgotPassword(true);
    forgotPasswordMutation(forgotPasswordEmail);
  };

  return (
    <div className="min-h-screen bg-teal-gradient relative overflow-hidden">
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
              <img src="/logo.png" alt="NeuStream" className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-medium text-white">NeuStream</h1>
          </div>
        </div>
      </div>

      <main className="relative py-4 px-4 sm:py-16 sm:px-6 lg:py-24 lg:px-8 lg:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Single column layout with centered form */}
          <div className="flex flex-col items-center justify-center lg:hidden gap-8">
            {/* Auth form - Centered on mobile */}
            <div className="w-full max-w-md order-1">
              <Card className="w-full shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </CardTitle>
                  <CardDescription>
                    {isLogin
                      ? "Sign in to your account to continue"
                      : "Create a new account to get started"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <img
                  src="/logo.png"
                  alt="NeuStream Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 animate-oscillate"
                />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight mb-4 sm:mb-6 leading-tight">
                Welcome to{" "}
                <span className="font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  NeuStream
                </span>
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

              <div className="mt-8 pt-8 border-t border-white/20">
                <p className="text-xs sm:text-sm opacity-70">
                  Trusted by{" "}
                  <span className="font-medium text-white">10,000+</span>{" "}
                  content creators worldwide
                </p>
              </div>
            </div>

            {/* Auth form - Centered in desktop */}
            <div className="col-span-2 max-w-md mx-auto order-1">
              <Card className="w-full shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </CardTitle>
                  <CardDescription>
                    {isLogin
                      ? "Sign in to your account to continue"
                      : "Create a new account to get started"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

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
                    disabled={authMutation.isPending}
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
                    disabled={authMutation.isPending}
                  >
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.64 5.36L10.2 8.74H14.38L12.96 12.12L16.28 12.13L14.86 15.5L18.18 15.51L19.6 12.13L22.92 12.14L11.64 5.36Z"
                        fill="#9146FF"
                      />
                      <path
                        d="M2.43 21.5L4.7 15.5L8.02 15.51L5.75 21.5H2.43Z"
                        fill="#9146FF"
                      />
                      <path
                        d="M5.75 21.5L8.02 15.5L11.34 15.51L9.07 21.5H5.75Z"
                        fill="#9146FF"
                      />
                      <path
                        d="M9.07 21.5L11.34 15.5L14.66 15.51L12.39 21.5H9.07Z"
                        fill="#9146FF"
                      />
                      <path
                        d="M12.39 21.5L14.66 15.5L17.98 15.51L15.71 21.5H12.39Z"
                        fill="#9146FF"
                      />
                    </svg>
                    Continue with Twitch
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 ">
                        Or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Email/Password Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className="pl-10"
                          required
                          disabled={authMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 " />
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Enter your password"
                          className="pl-10"
                          required
                          disabled={authMutation.isPending}
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={authMutation.isPending}
                      className="w-full"
                    >
                      {authMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isLogin ? "Signing In..." : "Creating Account..."}
                        </>
                      ) : isLogin ? (
                        "Sign In"
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>

                  {/* Forgot Password Link */}
                  {isLogin && !showForgotPassword && (
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-primary hover:text-primary"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotPasswordEmail(formData.email);
                          setError("");
                        }}
                        disabled={authMutation.isPending}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  )}

                  {/* Forgot Password Form */}
                  {showForgotPassword && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-medium">Reset Password</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enter your email address and we'll send you a link to reset your password
                        </p>
                      </div>

                      <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="forgot-email">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                            <Input
                              id="forgot-email"
                              type="email"
                              value={forgotPasswordEmail}
                              onChange={(e) => {
                                setForgotPasswordEmail(e.target.value);
                                if (error) setError("");
                              }}
                              placeholder="your@email.com"
                              className="pl-10"
                              required
                              disabled={isSubmittingForgotPassword}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmittingForgotPassword}
                          >
                            {isSubmittingForgotPassword ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send Reset Link"
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowForgotPassword(false);
                              setForgotPasswordEmail("");
                              setError("");
                            }}
                            disabled={isSubmittingForgotPassword}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Toggle between login/register */}
                  <div className="text-center space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={toggleMode}
                      disabled={authMutation.isPending}
                    >
                      {isLogin
                        ? "Don't have an account? Sign up"
                        : "Already have an account? Sign in"}
                    </Button>

                    <div className="text-xs ">
                      By {isLogin ? "signing in" : "creating an account"}, you
                      agree to our{" "}
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
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Close mobile layout div */}
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
