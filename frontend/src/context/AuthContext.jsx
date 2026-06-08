import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  // Attach token to axios on every render if token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/v1/auth/login', { email, password });
      const { user: u, token: t } = res.data.data;
      setUser(u);
      setToken(t);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/v1/admin/login', { email, password });
      const { user: u, token: t } = res.data.data;
      setUser(u);
      setToken(t);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Admin login failed.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const mentorLogin = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/v1/mentor/login', { email, password });
      const { user: u, token: t } = res.data.data;
      setUser(u);
      setToken(t);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Mentor login failed.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/v1/auth/signup', data);
      const { user: u, token: t } = res.data.data;
      setUser(u);
      setToken(t);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Signup failed.',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, adminLogin, mentorLogin, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
