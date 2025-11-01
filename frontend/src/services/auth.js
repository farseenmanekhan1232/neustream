const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "neustream_token";
const USER_KEY = "neustream_user";

class AuthService {
  constructor() {
    this.token = this.getToken();
    this.setupInterceptors();
  }

  // Token management
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // API request helpers
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
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
        error.message === "Unauthorized" ||
        error.message === "Invalid token" ||
        error.message === "User not found"
      ) {
        this.clearToken();
        // Don't redirect immediately, let the component handle it
        console.warn("Auth token invalid, cleared from storage");
      }
      throw error;
    }
  }

  // Authentication methods
  async login(email, password) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.user) {
      this.setToken(response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  async register(email, password) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (response.user) {
      this.setToken(response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }

    return response;
  }

  loginWithGoogle() {
    // Redirect to Google OAuth endpoint
    const googleAuthUrl = `${API_BASE}/auth/google`;
    window.location.href = googleAuthUrl;
  }

  loginWithTwitch() {
    // Redirect to Twitch OAuth endpoint
    const twitchAuthUrl = `${API_BASE}/auth/twitch`;
    window.location.href = twitchAuthUrl;
  }

  async validateToken(token) {
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
    } catch (error) {
      console.error("AuthService: Token validation failed:", error);
      // Remove the localStorage fallback - it causes inconsistent state
      // If token validation fails, we should clear auth data
      this.clearToken();
      throw error;
    }
  }


  // User management
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  logout() {
    this.clearToken();
  }

  // Setup request interceptors for automatic token handling
  setupInterceptors() {
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
