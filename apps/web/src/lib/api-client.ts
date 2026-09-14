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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
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
          .catch(Promise.reject.bind(Promise));
      }

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
        if (typeof window !== 'undefined') {
          localStorage.removeItem('lupbi_access_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
