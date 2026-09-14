/**
 * Axios instance với interceptor tự động refresh token và đính kèm ngôn ngữ (i18n x-lang header).
 */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { useI18nStore } from '@/stores/i18n.store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Gửi/nhận HTTP-Only cookie (Refresh Token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: gắn Access Token & x-lang header ────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('lupbi_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Đính kèm x-lang header cho Backend i18n
      const currentLang = useI18nStore.getState().lang;
      if (currentLang) {
        config.headers['x-lang'] = currentLang;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor: Auto Refresh Token khi nhận 401 ────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Helper: Xử lý hết phiên đăng nhập & Chuyển hướng về /login ──────────
const handleSessionExpired = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lupbi_access_token');
    document.cookie = 'is_logged_in=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = 'refreshToken=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

    // Chỉ redirect nếu hiện tại chưa ở trang login
    if (!window.location.pathname.startsWith('/login')) {
      const currentPath = window.location.pathname;
      const callbackParam =
        currentPath && currentPath !== '/'
          ? `?callbackUrl=${encodeURIComponent(currentPath)}`
          : '';
      window.location.href = `/login${callbackParam}`;
    }
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401) {
      const requestUrl = originalRequest?.url ?? '';

      // 1. Nếu là API Login thất bại: không redirect, trả lỗi về để Form hiển thị thông báo
      if (requestUrl.includes('/api/v1/auth/login')) {
        return Promise.reject(error);
      }

      // 2. Nếu chính API Refresh Token bị 401 (Refresh Token hết hạn / không hợp lệ)
      if (requestUrl.includes('/api/v1/auth/refresh')) {
        processQueue(error, null);
        handleSessionExpired();
        return Promise.reject(error);
      }

      // 3. Nếu đã retry rồi mà vẫn 401 -> Hết phiên, redirect về /login
      if (originalRequest._retry) {
        handleSessionExpired();
        return Promise.reject(error);
      }

      // 4. Nếu đang trong tiến trình Refresh Token của request trước đó
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>)[
                'Authorization'
              ] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            handleSessionExpired();
            return Promise.reject(err);
          });
      }

      // 5. Thử Refresh Token tự động
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await apiClient.post<{ accessToken: string }>(
          '/api/v1/auth/refresh',
        );
        const newToken = data.accessToken;

        if (typeof window !== 'undefined') {
          localStorage.setItem('lupbi_access_token', newToken);
        }

        processQueue(null, newToken);

        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>)[
            'Authorization'
          ] = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleSessionExpired();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
