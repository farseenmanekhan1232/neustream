import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { toast } from "sonner";

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided. Please check your email for the verification link.");
        return;
      }

      try {
        setStatus("loading");

        // Make GET request with token in URL params (as expected by backend)
        const response = await fetch(`${import.meta.env.VITE_API_BASE || "/api"}/auth/verify-email/${token}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: "Verification failed" }));
          throw new Error(error.error || "Verification failed");
        }

        const data = await response.json().catch(() => ({}));
        setStatus("success");

        if (data.message) {
          setMessage(data.message);
        } else {
          setMessage("Your email has been verified successfully! You can now log in.");
        }

        toast.success("Email verified successfully! You can now log in.");
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Email verification failed. The link may have expired or is invalid.",
        );
        toast.error("Email verification failed");
      }
    };

    verifyEmail();
  }, [token]);

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
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {status === "loading" && "Please wait while we verify your email address"}
              {status === "success" && "Your email has been successfully verified"}
              {status === "error" && "There was a problem verifying your email"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              {status === "loading" && (
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              )}
              {status === "success" && (
                <CheckCircle className="w-16 h-16 text-green-500" />
              )}
              {status === "error" && (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>

            {/* Message */}
            {message && (
              <div className="text-center text-sm text-muted-foreground">
                {message}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {status === "success" && (
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

              {status === "error" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/auth")}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Didn't receive an email?{" "}
                    <Link to="/auth" className="underline hover:text-foreground">
                      Try signing up again
                    </Link>
                  </p>
                </>
              )}

              {status === "loading" && (
                <p className="text-xs text-center text-muted-foreground">
                  This may take a few seconds...
                </p>
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

export default EmailVerification;
