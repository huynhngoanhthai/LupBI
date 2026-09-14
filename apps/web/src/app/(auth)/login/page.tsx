import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Đăng nhập | LupBI',
  description: 'Đăng nhập vào hệ thống phân tích dữ liệu LupBI',
};

export default function LoginPage() {
  return (
    // Suspense wrapper bắt buộc cho useSearchParams() trong LoginForm
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
