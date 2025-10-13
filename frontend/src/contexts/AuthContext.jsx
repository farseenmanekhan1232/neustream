import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';

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
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userData = urlParams.get('user');

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(userData));
          authService.setToken(token);
          setUser(parsedUser);

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Google OAuth callback error:', error);
          setError('Failed to complete Google sign-in');
        }
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
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

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