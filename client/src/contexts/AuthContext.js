import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

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

  // Set up axios defaults
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const apiUrl = isLocalhost ? 'http://localhost:5000/api' : 'https://kestrelvotingsystem.onrender.com/api';
  console.log('API URL:', apiUrl);
  console.log('Current hostname:', window.location.hostname);
  console.log('Is localhost:', isLocalhost);
  axios.defaults.baseURL = apiUrl;

  // Add token to requests if it exists
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
        toast.error('Session expired. Please login again.');
      }
      return Promise.reject(error);
    }
  );

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, type) => {
    try {
      console.log('Attempting login with:', { credentials, type });
      const endpoint = type === 'admin' ? '/auth/admin/login' : '/auth/staff/login';
      console.log('Making request to:', axios.defaults.baseURL + endpoint);
      const response = await axios.post(endpoint, credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        
        toast.success(`Welcome back, ${user.name || user.username}!`);
        return { success: true, user };
      } else {
        // Handle case where response is not successful
        const message = response.data.message || 'Login failed. Please try again.';
        toast.error(message);
        return { success: false, error: message };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
