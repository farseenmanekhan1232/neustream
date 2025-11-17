import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { authService } from "../services/auth";
import posthogService from "../services/posthog";
import type { User } from "@/types";
import type { AuthContextType } from "@/types";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async (): Promise<void> => {
      console.log("=== AUTH CONTEXT INITIALIZATION ===");
      try {
        const token = authService.getToken();
        console.log("Token found on mount:", !!token);

        if (token) {
          console.log("Validating existing token...");
          const userData = await authService.validateToken(token);
          console.log("Token validation successful, user data:", userData);
          setUser(userData);
        } else {
          console.log("No token found, user is not authenticated");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear invalid token but don't clear localStorage user data yet
        // It might be recovered during OAuth callback processing
        localStorage.removeItem("neustream_token");
      } finally {
        // Ensure loading is only set to false after all auth checks are complete
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle OAuth callback (Google and Twitch)
  useEffect(() => {
    const handleOAuthCallback = async (): Promise<void> => {
      console.log("=== AUTHCONTEXT OAUTH CHECK ===");
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userData = urlParams.get("user");
      const currentPath = window.location.pathname;

      console.log("Current pathname:", currentPath);
      console.log("Full URL:", window.location.href);
      console.log("Token found:", !!token);
      console.log("User data found:", !!userData);

      if (token && userData && currentPath === "/auth") {
        console.log("Processing OAuth callback with token and user data...");
        try {
          console.log("Token length:", token.length);
          console.log("User data length:", userData.length);

          const parsedUser = JSON.parse(decodeURIComponent(userData)) as User;
          console.log("Parsed user data:", parsedUser);

          // Set the token and user immediately
          authService.setToken(token);
          setUser(parsedUser);
          setError(null);
          setLoading(false); // Ensure loading is set to false

          console.log("User state set successfully");

          // Store user data in localStorage for persistence
          localStorage.setItem("neustream_user", JSON.stringify(parsedUser));
          console.log("User data stored in localStorage");

          // Clean up URL but keep the user logged in
          // Do this after storing user data to ensure redirect can happen
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log("URL cleaned, user should be logged in");

          // Validate the token with the server to ensure it's legitimate
          try {
            const validatedUser = await authService.validateToken(token);
            console.log("Token validated by server:", validatedUser);
            // Update user with validated data
            setUser(validatedUser);
            localStorage.setItem(
              "neustream_user",
              JSON.stringify(validatedUser),
            );
          } catch (validationError) {
            console.error(
              "Token validation failed, but keeping user session:",
              validationError,
            );
            // Keep the user logged in even if server validation fails
            // This prevents logout due to temporary network issues
          }
        } catch (error) {
          console.error("OAuth callback processing error:", error);
          setError("Failed to complete OAuth sign-in");
          authService.clearToken();
          setLoading(false);
        }
      } else {
        console.log(
          "No OAuth callback data found, proceeding with normal auth check",
        );

        // If we're on the auth page but there's no OAuth callback,
        // check if there's stored user data we can validate
        if (currentPath === "/auth" && !loading) {
          const storedUser = authService.getCurrentUser();
          if (storedUser && authService.getToken()) {
            console.log("Found stored user data, attempting validation...");
            try {
              const validatedUser = await authService.validateToken(
                authService.getToken()!,
              );
              setUser(validatedUser);
              console.log("Stored token validated successfully");
            } catch (validationError) {
              console.log("Stored token invalid, clearing auth data");
              authService.clearToken();
            }
          }
        }
      }
    };

    // Only run this effect after the initial auth initialization is complete
    // This prevents race conditions between initial auth check and OAuth processing
    if (!loading) {
      handleOAuthCallback();
    }
  }, [loading]);

  const loginWithGoogle = useCallback((): void => {
    authService.loginWithGoogle();
  }, []);

  const loginWithTwitch = useCallback((): void => {
    authService.loginWithTwitch();
  }, []);

  const logout = useCallback((): void => {
    // Track logout event before clearing user data
    if (user) {
      posthogService.trackAuthEvent("user_logout", {
        user_id: user.id,
        oauth_provider: user.oauthProvider,
        timestamp: new Date().toISOString(),
      });
    }

    // Clear authentication
    authService.logout();
    setUser(null);
    setError(null);

    // Reset PostHog analytics - clear user identification and tracking
    posthogService.resetUser();
    console.log("PostHog analytics reset on logout");
  }, [user]);

  const updateUser = useCallback((updates: Partial<User>): void => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithTwitch,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
