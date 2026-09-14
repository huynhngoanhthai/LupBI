/**
 * Zustand Auth Store - quản lý trạng thái xác thực toàn ứng dụng.
 * Access Token lưu tại localStorage (theo yêu cầu dự án).
 * Refresh Token lưu an toàn trong HTTP-Only Cookie (không truy cập được từ JS).
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
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken:
    typeof window !== 'undefined'
      ? localStorage.getItem(ACCESS_TOKEN_KEY)
      : null,
  isAuthenticated:
    typeof window !== 'undefined'
      ? !!localStorage.getItem(ACCESS_TOKEN_KEY)
      : false,
  isLoading: false,

  setAuth: (user, accessToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    set({ user, accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try {
      // Gọi API logout để server xóa Refresh Token cookie
      await apiClient.post('/api/v1/auth/logout');
    } catch {
      // Dù API lỗi vẫn phải clear state client
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
      }
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
