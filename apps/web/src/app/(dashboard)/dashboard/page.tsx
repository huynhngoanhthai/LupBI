'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { BarChart3, LogOut } from 'lucide-react';

// Dashboard placeholder - Tính năng đầy đủ sẽ implement ở DASH-01
export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg">LupBI</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">
            {user?.fullName ?? user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="p-8">
        <h1 className="text-2xl font-semibold mb-2">
          Chào mừng trở lại, {user?.fullName ?? 'Người dùng'} 👋
        </h1>
        <p className="text-slate-400">
          Dashboard đang được phát triển. Tính năng đầy đủ sẽ có trong sprint tiếp theo.
        </p>
      </main>
    </div>
  );
}
