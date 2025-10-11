import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });

  const authMutation = useMutation({
    mutationFn: async (formData) => {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      onLogin(data.user);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    authMutation.mutate(authForm);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center space-y-8 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="text-4xl font-bold">
                Welcome to <span className="gradient-text">NeuStream</span>
              </div>
              <p className="text-xl text-muted-foreground">
                Multi-platform streaming made simple
              </p>
            </div>

            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </CardTitle>
                <CardDescription>
                  {isLogin
                    ? "Sign in to your account"
                    : "Create a new account to get started"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {authMutation.isError && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/20 border border-destructive rounded-md">
                    {authMutation.error.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={authForm.email}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={authForm.password}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, password: e.target.value })
                      }
                      placeholder="Your password"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={authMutation.isPending}
                    className="w-full"
                  >
                    {authMutation.isPending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </>
                    ) : isLogin ? (
                      "Sign In"
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Auth;
