'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { useI18nStore } from '@/stores/i18n.store';
import { toast } from 'sonner';
import {
  BarChart3,
  Shield,
  PlusCircle,
  Eye,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import UserMenu from '@/components/common/UserMenu';
import PermissionGate from '@/components/auth/PermissionGate';
import DataSourceManager from '@/components/datasource/DataSourceManager';
import { UserRole, UserListItemDto, MeResponseDto } from '@lupbi/shared-types';

export default function DashboardPage() {
  const { user, setAuth } = useAuthStore();
  const t = useI18nStore((s) => s.t);
  const queryClient = useQueryClient();

  // Tự động khôi phục thông tin User từ API /me nếu F5 / Reload trang
  useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const { data } = await apiClient.get<MeResponseDto>('/api/v1/auth/me');
      if (data) {
        setAuth(
          {
            id: data.id,
            email: data.email,
            fullName: data.fullName,
            role: data.role,
          },
          useAuthStore.getState().accessToken || '',
        );
      }
      return data;
    },
    enabled: typeof window !== 'undefined' && !user && !!localStorage.getItem('lupbi_access_token'),
  });

  // AUTH-02: Query danh sách User cho Admin
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<UserListItemDto[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserListItemDto[]>('/api/v1/admin/users');
      return data;
    },
    enabled: user?.role === UserRole.ADMIN,
  });

  // AUTH-02: Mutation cập nhật Role User
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
      {/* ── Navbar Header ── */}
      <nav className="border-b border-slate-800/80 px-6 py-3 flex items-center justify-between bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            LupBI
          </span>
        </div>

        {/* Right Action Items: User Menu Dropdown */}
        <div className="flex items-center gap-3">
          <UserMenu />
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl shadow-black/10">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('dashboard.welcome')}, {user?.fullName ?? 'User'} 👋
            </h1>
            <p className="text-slate-400 text-sm">{t('dashboard.dev_notice')}</p>
          </div>

          <div className="flex items-center gap-3">
            <PermissionGate allowedRoles={[UserRole.ADMIN, UserRole.CREATOR]}>
              <button
                onClick={() => toast.info('Chức năng SQL Editor (DASH-01)')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                <PlusCircle className="w-4 h-4" />
                {t('rbac.creator_action')}
              </button>
            </PermissionGate>

            <PermissionGate allowedRoles={[UserRole.VIEWER]}>
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 text-sm font-medium">
                <Eye className="w-4 h-4 text-emerald-400" />
                {t('rbac.viewer_badge')}
              </div>
            </PermissionGate>
          </div>
        </div>

        {/* ── CONN-01 & CONN-02 Data Source & Schema Explorer Section ── */}
        <PermissionGate allowedRoles={[UserRole.ADMIN, UserRole.CREATOR]}>
          <DataSourceManager />
        </PermissionGate>

        {/* ── AUTH-02 RBAC User Management Section (Chỉ dành cho ADMIN) ── */}
        <PermissionGate allowedRoles={[UserRole.ADMIN]}>
          <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-xl shadow-black/10">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl">
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
              <div className="text-center py-8 text-slate-500 text-sm">Đang tải danh sách người dùng...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs font-semibold">
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
                        <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{u.email}</td>
                        <td className="px-4 py-3.5">
                          {u.isActive ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 font-medium">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              u.role === UserRole.ADMIN
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : u.role === UserRole.CREATOR
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors cursor-pointer"
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
