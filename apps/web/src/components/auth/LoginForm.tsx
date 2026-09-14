'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Loader2, LogIn, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { LoginRequestDto, LoginResponseDto, ApiErrorResponse } from '@lupbi/shared-types';
import { AxiosError } from 'axios';
import { cn } from '@/lib/utils';

// ─── Mutation Hook ────────────────────────────────────────────────────────

function useLoginMutation() {
  return useMutation<LoginResponseDto, AxiosError<ApiErrorResponse>, LoginRequestDto>({
    mutationFn: async (dto) => {
      const { data } = await apiClient.post<LoginResponseDto>(
        '/api/v1/auth/login',
        dto,
      );
      return data;
    },
  });
}

// ─── LoginForm Component ──────────────────────────────────────────────────

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending, error, isError } = useLoginMutation();

  const errorMessage =
    error?.response?.data?.message ??
    (isError ? 'Đã xảy ra lỗi. Vui lòng thử lại.' : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    login(
      { email, password },
      {
        onSuccess: (data) => {
          setAuth(data.user, data.accessToken);
          router.replace(callbackUrl);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ── Left Panel: Brand ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-slate-900 to-slate-950 p-12 border-r border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white tracking-tight">LupBI</span>
        </div>
        <p className="text-slate-400 text-lg text-center max-w-sm">
          Phân tích dữ liệu thông minh — Biến số liệu thành quyết định
        </p>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-8">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2 mb-10">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">LupBI</span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-white mb-8">
            Đăng nhập vào LupBI
          </h1>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@lupbi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg bg-slate-800 border text-white placeholder-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                  isError ? 'border-red-500' : 'border-slate-700',
                )}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  className={cn(
                    'w-full px-4 py-2.5 pr-11 rounded-lg bg-slate-800 border text-white placeholder-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
                    isError ? 'border-red-500' : 'border-slate-700',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {isError && errorMessage && (
              <div
                role="alert"
                className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
              >
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !email || !password}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-2.5 rounded-lg font-medium transition-all',
                'bg-blue-600 hover:bg-blue-500 text-white',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950',
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
