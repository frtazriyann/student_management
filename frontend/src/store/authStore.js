import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null,

  loginAdmin: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login-admin', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  loginStudent: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login-student', { email, password });
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  registerAdmin: async (name, email, password, phone) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register-admin', { name, email, password, phone });
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, loading: false });
      return data;
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
