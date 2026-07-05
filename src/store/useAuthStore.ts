import { create } from 'zustand';
import Cookies from 'js-cookie';

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

export const useAuthStore = create<AuthState>((set) => ({
  user: Cookies.get('user') ? JSON.parse(Cookies.get('user')!) : null,
  token: Cookies.get('token') || null,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid username or password.');

      Cookies.set('token', data.access, { expires: 1 });
      Cookies.set('user', JSON.stringify(data.user), { expires: 1 });

      set({ token: data.access, user: data.user, loading: false });
      return true;
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      set({ error: errorMessage, loading: false });
      return false;
    }
  },

  register: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = Object.values(data).flat().join(' ') || 'Registration failed.';
        throw new Error(errorMsg);
      }

      set({ loading: false });
      return true;
    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred during registration.';
      if (err instanceof Error) {
        errorMessage = err.message;
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