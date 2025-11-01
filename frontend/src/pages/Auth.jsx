import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const {
    login,
    register,
    loginWithGoogle,
    loginWithTwitch,
    error: authError,
    user,
  } = useAuth();
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
    onSuccess: () => {
      // Navigate to the page they were trying to access, or dashboard
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
  };

  return (
    <div className=" min-h-screen bg-teal-gradient">
      <Header />
      <main className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center space-y-8 max-w-md mx-auto">
            <Card className="w-full">
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
      </main>
    </div>
  );
}

export default Auth;
