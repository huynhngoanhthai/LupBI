/**
 * Zustand Auth Store - quản lý trạng thái xác thực toàn ứng dụng.
 * Đảm bảo 100% không bị lỗi Hydration Mismatch trong Next.js App Router.
 */
import { create } from 'zustand';
import { UserProfileDto } from '@lupbi/shared-types';
import { apiClient } from '@/lib/api-client';

const ACCESS_TOKEN_KEY = 'lupbi_access_token';

interface AuthState {
  user: UserProfileDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: UserProfileDto, accessToken: string) => void;
  initClientAuth: () => void;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      document.cookie = 'is_logged_in=true; path=/; max-age=604800; SameSite=Lax';
    }
    set({ user, accessToken, isAuthenticated: true });
  },

  initClientAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        set({ accessToken: token, isAuthenticated: true });
      }
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Dù API lỗi vẫn clear client state
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        document.cookie = 'is_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        document.cookie = 'refreshToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      }
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      document.cookie = 'is_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'refreshToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
