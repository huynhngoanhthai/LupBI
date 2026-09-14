'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { useI18nStore } from '@/stores/i18n.store';
import { useAuthStore } from '@/stores/auth.store';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  // Tự động khởi tạo ngôn ngữ i18n & auth state từ localStorage sau khi mount client
  // Triệt tiêu 100% lỗi Hydration Mismatch của React 19 / Next.js 15
  useEffect(() => {
    useI18nStore.getState().initClientLanguage();
    useAuthStore.getState().initClientAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Sonner Toast Notifications */}
      <Toaster position="top-right" theme="dark" richColors />
    </QueryClientProvider>
  );
}
