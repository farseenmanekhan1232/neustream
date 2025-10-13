import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import posthogService from '../services/posthog';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          const userData = await authService.validateToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle Google OAuth callback
  useEffect(() => {
    const handleGoogleCallback = async () => {
      console.log('=== AUTHCONTEXT OAUTH CHECK ===');
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('user');
      const currentPath = window.location.pathname;

      console.log('Current pathname:', currentPath);
      console.log('Full URL:', window.location.href);
      console.log('Token found:', !!token);
      console.log('User data found:', !!userData);

      if (token && userData) {
        console.log('Processing OAuth callback with token and user data...');
        try {
          console.log('Token length:', token.length);
          console.log('User data length:', userData.length);

          const parsedUser = JSON.parse(decodeURIComponent(userData));
          console.log('Parsed user data:', parsedUser);

          // Set the token and user immediately
          authService.setToken(token);
          setUser(parsedUser);
          setError(null);

          console.log('User state set successfully');

          // Clean up URL but keep the user logged in
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
          console.log('URL cleaned, user should be logged in');

        } catch (error) {
          console.error('OAuth callback processing error:', error);
          setError('Failed to complete Google sign-in');
          authService.clearToken();
        }
      } else {
        console.log('No OAuth callback data found, proceeding with normal auth check');
      }
    };

    handleGoogleCallback();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const register = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await authService.register(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  const logout = useCallback(() => {
    // Track logout event before clearing user data
    if (user) {
      posthogService.trackAuthEvent('user_logout', {
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
    console.log('PostHog analytics reset on logout');
  }, [user]);

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};