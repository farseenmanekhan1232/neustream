import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { authService } from "../services/auth";

function PasswordReset() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "loading" | "success" | "error">("form");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setStep("error");
      setMessage("No reset token provided. Please use the link from your email to reset your password.");
    }
  }, [token]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!token) {
      setError("No reset token provided");
      return;
    }

    try {
      setStep("loading");

      const response = await authService.resetPassword(token, password);

      if (response.message) {
        setMessage(response.message);
      } else {
        setMessage("Your password has been reset successfully!");
      }

      setStep("success");
      toast.success("Password reset successfully! You can now log in with your new password.");
    } catch (error) {
      console.error("Password reset error:", error);
      setStep("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Password reset failed. The link may have expired or is invalid.",
      );
      toast.error("Password reset failed");
    }
  };

  const handleReturnToLogin = () => {
    navigate("/auth");
  };

  const handleReturnToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-teal-gradient relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse hidden sm:block"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000 hidden sm:block"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {step === "form" && "Reset Password"}
              {step === "loading" && "Resetting Password..."}
              {step === "success" && "Password Reset!"}
              {step === "error" && "Reset Failed"}
            </CardTitle>
            <CardDescription>
              {step === "form" && "Enter your new password below"}
              {step === "loading" && "Please wait while we update your password"}
              {step === "success" && "Your password has been updated"}
              {step === "error" && "There was a problem resetting your password"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Icon */}
            {(step === "success" || step === "error") && (
              <div className="flex justify-center">
                {step === "success" && <CheckCircle className="w-16 h-16 text-green-500" />}
                {step === "error" && <XCircle className="w-16 h-16 text-red-500" />}
              </div>
            )}

            {(step === "loading") && (
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
            )}

            {/* Message */}
            {message && (
              <div className="text-center text-sm text-muted-foreground">
                {message}
              </div>
            )}

            {/* Form */}
            {step === "form" && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {step === "success" && (
                <>
                  <Button onClick={handleReturnToLogin} className="w-full">
                    Continue to Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReturnToHome}
                    className="w-full"
                  >
                    Return to Home
                  </Button>
                </>
              )}

              {step === "error" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Need a new reset link?{" "}
                    <Link to="/auth" className="underline hover:text-foreground">
                      Request a new one
                    </Link>
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-white/70 text-sm">
          <p>
            Need help?{" "}
            <Link to="/contact" className="underline hover:text-white">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PasswordReset;
