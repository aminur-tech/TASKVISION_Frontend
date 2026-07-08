import { create } from 'zustand';
import Cookies from 'js-cookie';
import axios from 'axios';
import api from '@/libs/Api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: Record<string, string>) => Promise<boolean>;
  register: (credentials: Record<string, string>) => Promise<boolean>;
  logout: () => void;
}



const getInitialAuthState = () => {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }

  const storedUser = Cookies.get('user');
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: Cookies.get('token') || null,
  };
};

const initialAuthState = getInitialAuthState();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuthState.user,
  token: initialAuthState.token,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/api/auth/login/', credentials);
      const data = res.data;

      Cookies.set('token', data.access, { expires: 1, secure: process.env.NODE_ENV === 'production' });
      Cookies.set('user', JSON.stringify(data.user), { expires: 1, secure: process.env.NODE_ENV === 'production' });
      set({ token: data.access, user: data.user, loading: false, error: null });
      return true;
    } catch (err) {
      let errorMessage = 'An unexpected error occurred during login.';
      if (axios.isAxiosError(err) && err.response?.data) {
        // Extracts detailed error message from the API response
        errorMessage = Object.values(err.response.data).flat().join(' ');
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  register: async (credentials) => {
    set({ loading: true, error: null });
    try {
      await api.post('/api/auth/register/', credentials);
      set({ loading: false, error: null });
      return true;
    } catch (err) {
      let errorMessage = 'An unexpected error occurred during registration.';
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = Object.values(err.response.data).flat().join(' ') || 'Registration failed.';
      }
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ user: null, token: null });
  },
}));