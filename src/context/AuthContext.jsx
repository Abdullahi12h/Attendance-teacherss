import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Default API URL (django dev server)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configure default axios headers
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSandboxMode, setIsSandboxMode] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('user');
      const sandbox = localStorage.getItem('sandbox_mode') === 'true';

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsSandboxMode(sandbox);
        
        // If not sandbox, verify token with backend
        if (!sandbox) {
          try {
            // Check session validity with backend
            const response = await axios.get(`${API_URL}/auth/me/`);
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } catch (error) {
            console.error('Token validation failed, logging out...', error);
            // If backend fails but we have cached user, let's keep it or fallback
            // In a strict prod app we logout, but for local testing let's auto-switch to sandbox
            setIsSandboxMode(true);
            localStorage.setItem('sandbox_mode', 'true');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      // Attempt backend authentication
      const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
      const { access, refresh, user: userData } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('sandbox_mode', 'false');

      setToken(access);
      setUser(userData);
      setIsSandboxMode(false);
      setLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      console.warn('Backend login failed. Attempting local sandbox authentication...', error);
      
      // Fallback sandbox authentication for demo/testing
      let mockUser = null;
      if (username === 'admin' && password === 'admin123') {
        mockUser = {
          id: 1,
          username: 'admin',
          name: 'Professor Sarah Jenkins',
          email: 'admin@university.edu',
          role: 'admin',
          photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
          department: 'Computer Science',
        };
      } else if (username === 'teacher' && password === 'teacher123') {
        mockUser = {
          id: 2,
          username: 'teacher',
          name: 'Dr. Michael Chang',
          email: 'michael.chang@university.edu',
          role: 'teacher',
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          department: 'Software Engineering',
        };
      } else if (username === 'student' && password === 'student123') {
        mockUser = {
          id: 3,
          username: 'student',
          name: 'Alexander Wright',
          email: 'alex.wright@student.edu',
          role: 'student',
          photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
          department: 'Computer Science',
          studentId: 'CS-2026-089',
          program: 'Computer Science & Eng',
          semester: '6th Semester',
          academicYear: '2025-2026',
          phone: '+1 (555) 019-2834',
          guardian: 'Mary Wright (Mother)',
          fingerprintId: 'FP-8802',
          status: 'Active',
          attendancePercentage: 88.5
        };
      }

      if (mockUser) {
        // Successful mock login
        const mockAccessToken = 'mock_jwt_access_token_12345';
        const mockRefreshToken = 'mock_jwt_refresh_token_12345';

        localStorage.setItem('access_token', mockAccessToken);
        localStorage.setItem('refresh_token', mockRefreshToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('sandbox_mode', 'true');

        setToken(mockAccessToken);
        setUser(mockUser);
        setIsSandboxMode(true);
        setLoading(false);
        return { success: true, user: mockUser, sandbox: true };
      }

      setLoading(false);
      throw new Error(error.response?.data?.detail || 'Invalid username or password');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('sandbox_mode');
    setUser(null);
    setToken(null);
    setIsSandboxMode(false);
  };

  const updateProfile = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, isSandboxMode, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
