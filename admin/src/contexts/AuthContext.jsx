import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/validate-token`, {
        token
      });

      // Check if user is admin
      if (response.data.user.email === 'admin@neustream.app') {
        setUser(response.data.user);
        localStorage.setItem('admin_token', token);
      } else {
        localStorage.removeItem('admin_token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('admin_token');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Redirect to Google OAuth for admin login
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
  };

  const handleOAuthCallback = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));

        // Verify this is the admin user
        if (user.email === 'admin@neustream.app') {
          setUser(user);
          localStorage.setItem('admin_token', token);

          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          return true;
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    return false;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    handleOAuthCallback,
    isAdmin: user?.email === 'admin@neustream.app'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};