import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "neustream_token";
const USER_KEY = "neustream_user";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

class AuthService {
  private token: string | null;

  constructor() {
    this.token = this.getToken();
    this.setupInterceptors();
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // API request helpers
  async request(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<AuthResponse> {
    const url = `${API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ error: "Request failed" }));
        throw new Error(error.error || "Request failed");
      }

      return await response.json();
    } catch (error) {
      // Only redirect on auth errors, not network errors
      if (
        error instanceof Error &&
        (error.message === "Unauthorized" ||
          error.message === "Invalid token" ||
          error.message === "User not found")
      ) {
        this.clearToken();
        // Don't redirect immediately, let the component handle it
        console.warn("Auth token invalid, cleared from storage");
      }
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.user) {
      this.setToken(response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.user) {
      this.setToken(response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  loginWithGoogle(): void {
    // Redirect to Google OAuth endpoint
    const googleAuthUrl = `${API_BASE}/auth/google`;
    window.location.href = googleAuthUrl;
  }

  loginWithTwitch(): void {
    // Redirect to Twitch OAuth endpoint
    const twitchAuthUrl = `${API_BASE}/auth/twitch`;
    window.location.href = twitchAuthUrl;
  }

  async validateToken(token: string): Promise<User> {
    console.log("AuthService: Validating token...");

    try {
      const response = await this.request("/auth/validate-token", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      console.log("AuthService: Validation response:", response);

      if (response.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        return response.user;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      console.error("AuthService: Token validation failed:", error);
      // Remove the localStorage fallback - it causes inconsistent state
      // If token validation fails, we should clear auth data
      this.clearToken();
      throw error;
    }
  }

  // User management
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? (JSON.parse(userData) as User) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    this.clearToken();
  }

  // Setup request interceptors for automatic token handling
  setupInterceptors(): void {
    // Add response interceptor to handle token expiration
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      // Check if response indicates token expiration
      if (response.status === 401) {
        this.clearToken();
        // Don't redirect here, let the component handle it
      }
      return response;
    };
  }
}

export const authService = new AuthService();
