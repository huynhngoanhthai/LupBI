'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, LogIn, BarChart3 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth.store';
import { useI18nStore } from '@/stores/i18n.store';
import LanguageSelector from '@/components/common/LanguageSelector';
import { LoginResponseDto, ApiErrorResponse } from '@lupbi/shared-types';
import { AxiosError } from 'axios';

// ─── Zod Schema Validation ────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── LoginForm Component ──────────────────────────────────────────────────

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const setAuth = useAuthStore((s) => s.setAuth);
  const t = useI18nStore((s) => s.t);

  const [showPassword, setShowPassword] = useState(false);

  // Form Management dùng react-hook-form + zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Mutation gọi API Login
  const { mutate: login, isPending, error, isError } = useMutation<
    LoginResponseDto,
    AxiosError<ApiErrorResponse>,
    LoginFormData
  >({
    mutationFn: async (dto) => {
      const { data } = await apiClient.post<LoginResponseDto>(
        '/api/v1/auth/login',
        dto,
      );
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(t('auth.login_success_toast', 'Đăng nhập thành công!'));
      router.replace(callbackUrl);
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? t('auth.login_failed_toast', 'Đăng nhập thất bại.');
      toast.error(msg);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  const apiErrorMessage =
    error?.response?.data?.message ?? (isError ? t('auth.login_failed_toast', 'Đăng nhập thất bại.') : null);

  return (
    <div className="min-h-screen bg-slate-950 flex relative">
      {/* Top right language selector */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* ── Left Panel: Brand ── */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-slate-900 to-slate-950 p-12 border-r border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white tracking-tight">LupBI</span>
        </div>
        <p className="text-slate-400 text-lg text-center max-w-sm">
          {t('auth.login_subtitle')}
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
            {t('auth.login_title')}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                {t('auth.email_label')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.email_placeholder')}
                disabled={isPending}
                {...register('email')}
                className={`w-full px-4 py-2.5 rounded-lg bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.email || isError ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('auth.password_placeholder')}
                  disabled={isPending}
                  {...register('password')}
                  className={`w-full px-4 py-2.5 pr-11 rounded-lg bg-slate-800 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.password || isError ? 'border-red-500' : 'border-slate-700'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                  aria-label={
                    showPassword ? t('auth.hide_password') : t('auth.show_password')
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Error Banner */}
            {isError && apiErrorMessage && (
              <div
                role="alert"
                className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-shake"
              >
                {apiErrorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('auth.submitting')}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t('auth.submit_button')}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
