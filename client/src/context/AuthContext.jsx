/**
 * Authentication Context Provider
 * ===============================
 * Manages the global authentication state of the React application.
 * Exposes methods to log in, register, verify email OTP, sign out,
 * and update user profiles.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session on component mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Fetch profile to verify session status
        const response = await api.get('/auth/me');
        if (response.data && response.data.success) {
          setUser(response.data.user);
        }
      } catch (err) {
        console.error('🚨 Session bootstrap error:', err.message);
        // Clear cached credentials if invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  /**
   * Register a new user account (Voter or Admin)
   */
  const registerUser = async (fullName, email, password, role = 'voter', adminKey = '') => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password,
        role,
        adminKey,
      });

      if (response.data && response.data.success) {
        toast.success(response.data.message);
        return { success: true, email };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify email via OTP verification code
   */
  const verifyOTP = async (email, otp) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/verify-otp', { email, otp });

      if (response.data && response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        toast.success('Account verified and logged in successfully!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed.';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend verification OTP code to user
   */
  const resendOTP = async (email) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      if (response.data && response.data.success) {
        toast.success('A new verification code has been sent to your email.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Resending OTP failed.';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Log in user
   */
  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });

      if (response.data && response.data.success) {
        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setUser(userData);
        toast.success('Logged in successfully!');
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed.';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update Profile (Name or Password)
   */
  const updateProfile = async (fullName, password) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/update-profile', { fullName, password });

      if (response.data && response.data.success) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Profile updated successfully.');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Profile update failed.';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user and clear tokens
   */
  const logoutUser = async () => {
    try {
      // Invalidate on backend
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Backend logout error (usually session already expired):', err.message);
    } finally {
      // Clear client storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register: registerUser,
        verifyOTP,
        resendOTP,
        login: loginUser,
        logout: logoutUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped in an AuthProvider');
  }
  return context;
};
