import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Create authentication context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, [checkAuthStatus]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete api.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed'
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Password change failed'
      };
    }
  };

  // Deactivate account
  const deactivateAccount = async () => {
    try {
      await api.put('/auth/deactivate');
      logout();
      return { success: true };
    } catch (error) {
      console.error('Account deactivation failed:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Account deactivation failed'
      };
    }
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deactivateAccount,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 