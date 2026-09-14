'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useI18nStore } from '@/stores/i18n.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  BarChart3,
  LogOut,
  Shield,
  PlusCircle,
  Eye,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import LanguageSelector from '@/components/common/LanguageSelector';
import PermissionGate from '@/components/auth/PermissionGate';
import { UserRole, UserListItemDto } from '@lupbi/shared-types';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const t = useI18nStore((s) => s.t);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  // ─── AUTH-02: Query lấy danh sách User dành riêng cho Admin ──────────────
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserListItemDto[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserListItemDto[]>('/api/v1/admin/users');
      return data;
    },
    enabled: user?.role === UserRole.ADMIN, // Chỉ fetch khi user là Admin
  });

  // ─── AUTH-02: Mutation cập nhật Role của User ──────────────────────────────
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const { data } = await apiClient.patch<UserListItemDto>(
        `/api/v1/admin/users/${userId}/role`,
        { role: newRole },
      );
      return data;
    },
    onSuccess: (updatedUser) => {
      toast.success(
        `Đã cập nhật vai trò của ${updatedUser.fullName} thành ${updatedUser.role}`,
      );
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error(t('rbac.forbidden_alert', 'Không thể cập nhật vai trò'));
    },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* ── Navbar ── */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">LupBI</span>

          {/* User Role Badge */}
          {user?.role && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                user.role === UserRole.ADMIN
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : user.role === UserRole.CREATOR
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {user.role}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />

          <div className="h-4 w-px bg-slate-800" />

          <span className="text-slate-300 text-sm font-medium">
            {user?.fullName ?? user?.email}
          </span>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            {t('dashboard.logout')}
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-xl border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('dashboard.welcome')}, {user?.fullName ?? 'User'} 👋
            </h1>
            <p className="text-slate-400 text-sm">{t('dashboard.dev_notice')}</p>
          </div>

          {/* RBAC Conditional UI Actions (AUTH-02) */}
          <div className="flex items-center gap-3">
            {/* Creator / Admin action button */}
            <PermissionGate allowedRoles={[UserRole.ADMIN, UserRole.CREATOR]}>
              <button
                onClick={() => toast.info('Chức năng SQL Editor (DASH-01)')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-md shadow-blue-500/10"
              >
                <PlusCircle className="w-4 h-4" />
                {t('rbac.creator_action')}
              </button>
            </PermissionGate>

            {/* Viewer badge */}
            <PermissionGate allowedRoles={[UserRole.VIEWER]}>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-sm">
                <Eye className="w-4 h-4 text-emerald-400" />
                {t('rbac.viewer_badge')}
              </div>
            </PermissionGate>
          </div>
        </div>

        {/* ── AUTH-02 RBAC User Management Section (Chỉ hiển thị cho ADMIN) ── */}
        <PermissionGate allowedRoles={[UserRole.ADMIN]}>
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {t('rbac.admin_section')}
                </h2>
                <p className="text-xs text-slate-400">
                  Phân quyền vai trò (Admin, Creator, Viewer) và kiểm soát truy cập hệ thống
                </p>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="text-center py-8 text-slate-500">Đang tải danh sách người dùng...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg">Họ & Tên</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Vai trò hiện tại</th>
                      <th className="px-4 py-3 rounded-r-lg text-right">Thay đổi vai trò (RBAC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          {u.fullName}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">{u.email}</td>
                        <td className="px-4 py-3.5">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              u.role === UserRole.ADMIN
                                ? 'bg-purple-500/20 text-purple-300'
                                : u.role === UserRole.CREATOR
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({
                                userId: u.id,
                                newRole: e.target.value as UserRole,
                              })
                            }
                            disabled={updateRoleMutation.isPending}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer"
                          >
                            <option value={UserRole.ADMIN}>ADMIN (Toàn quyền)</option>
                            <option value={UserRole.CREATOR}>CREATOR (Tạo & Sửa Query/Dashboard)</option>
                            <option value={UserRole.VIEWER}>VIEWER (Chỉ xem Báo cáo)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </PermissionGate>
      </main>
    </div>
  );
}
