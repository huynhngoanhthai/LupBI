'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Database,
  Plus,
  Zap,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Loader2,
  FolderTree,
  Server,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useI18nStore } from '@/stores/i18n.store';
import PermissionGate from '@/components/auth/PermissionGate';
import SchemaExplorer from '@/components/datasource/SchemaExplorer';
import {
  DataSourceResponseDto,
  DataSourceType,
  UserRole,
  TestConnectionResultDto,
} from '@lupbi/shared-types';

// Zod validation schema cho form Nguồn dữ liệu
const dataSourceSchema = z.object({
  name: z.string().min(2, 'Tên kết nối phải có ít nhất 2 ký tự'),
  type: z.nativeEnum(DataSourceType),
  host: z.string().optional(),
  port: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === '' || val === undefined || val === null) return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  }),
  database: z.string().min(1, 'Tên Database là bắt buộc'),
  username: z.string().optional(),
  password: z.string().optional(),
  ssl: z.boolean().optional(),
});

type DataSourceFormData = {
  name: string;
  type: DataSourceType;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
};

export default function DataSourceManager() {
  const t = useI18nStore((s) => s.t);
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestedSuccess, setIsTestedSuccess] = useState(false);
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [selectedSchemaDs, setSelectedSchemaDs] = useState<{ id: string; name: string } | null>(null);

  // Fetch danh sách Data Sources (CONN-01)
  const { data: datasources = [], isLoading } = useQuery<DataSourceResponseDto[]>({
    queryKey: ['datasources'],
    queryFn: async () => {
      const { data } = await apiClient.get<DataSourceResponseDto[]>('/api/v1/datasources');
      return data;
    },
  });

  // Form Management dùng react-hook-form + zod
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm<DataSourceFormData>({
    resolver: zodResolver(dataSourceSchema) as any,
    defaultValues: {
      name: '',
      type: DataSourceType.POSTGRES,
      host: '127.0.0.1',
      port: 5432,
      database: 'sales_db',
      username: 'postgres',
      password: '',
      ssl: false,
    },
  });

  // Tự động reset trạng thái Test Connection khi người dùng thay đổi bất kỳ trường nào trong form
  useEffect(() => {
    const subscription = watch(() => {
      setIsTestedSuccess(false);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Mutation Test Connection (Test Ping <= 5s)
  const testConnMutation = useMutation({
    mutationFn: async (dto: DataSourceFormData) => {
      const { data } = await apiClient.post<TestConnectionResultDto>(
        '/api/v1/datasources/test',
        dto,
      );
      return data;
    },
    onSuccess: (res) => {
      if (res.success) {
        setIsTestedSuccess(true);
        toast.success(res.message || t('datasource.test_success'));
      } else {
        setIsTestedSuccess(false);
        toast.error(res.message || t('datasource.test_failed'));
      }
    },
    onError: (err: any) => {
      setIsTestedSuccess(false);
      toast.error(err.response?.data?.message || 'Lỗi thử nghiệm kết nối');
    },
  });

  // Mutation Quick Test Ping cho từng dòng đã lưu
  const pingRowMutation = useMutation({
    mutationFn: async (ds: DataSourceResponseDto) => {
      setPingingId(ds.id);
      const { data } = await apiClient.post<TestConnectionResultDto>(
        '/api/v1/datasources/test',
        {
          name: ds.name,
          type: ds.type,
          host: ds.host,
          port: ds.port,
          database: ds.database,
          username: ds.username,
          ssl: ds.ssl,
        },
      );
      return data;
    },
    onSuccess: (res) => {
      setPingingId(null);
      if (res.success) {
        toast.success(`Kết nối đến CSDL phản hồi tốt! (${res.latencyMs || 0}ms)`);
      } else {
        toast.error(res.message || 'Không thể phản hồi từ CSDL');
      }
    },
    onError: () => {
      setPingingId(null);
      toast.error('Lỗi kiểm tra phản hồi từ CSDL');
    },
  });

  // Mutation Save Data Source
  const saveDsMutation = useMutation({
    mutationFn: async (dto: DataSourceFormData) => {
      if (!isTestedSuccess) {
        throw new Error('Vui lòng thử nghiệm kết nối thành công trước khi lưu!');
      }
      const { data } = await apiClient.post<DataSourceResponseDto>(
        '/api/v1/datasources',
        dto,
      );
      return data;
    },
    onSuccess: () => {
      toast.success(t('datasource.created', 'Tạo nguồn dữ liệu thành công!'));
      queryClient.invalidateQueries({ queryKey: ['datasources'] });
      setIsModalOpen(false);
      setIsTestedSuccess(false);
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || err.response?.data?.message || 'Không thể tạo nguồn dữ liệu');
    },
  });

  // Mutation Delete Data Source
  const deleteDsMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/v1/datasources/${id}`);
    },
    onSuccess: () => {
      toast.success(t('datasource.deleted', 'Xóa kết nối thành công!'));
      queryClient.invalidateQueries({ queryKey: ['datasources'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            {t('datasource.title')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý kết nối Database mã hóa AES-256-GCM bảo mật và đồng bộ metadata tự động
          </p>
        </div>

        <PermissionGate allowedRoles={[UserRole.ADMIN]}>
          <button
            onClick={() => {
              reset();
              setIsTestedSuccess(false);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            {t('datasource.add_button')}
          </button>
        </PermissionGate>
      </div>

      {/* Main Grid: Data Source Table + Optional Schema Explorer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table column */}
        <div className={`bg-slate-900/60 rounded-xl border border-slate-800 p-5 ${selectedSchemaDs ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              Đang tải danh sách Nguồn Dữ Liệu...
            </div>
          ) : datasources.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Database className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">Chưa có kết nối Database nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">{t('datasource.name')}</th>
                    <th className="px-4 py-3">{t('datasource.type')}</th>
                    <th className="px-4 py-3">{t('datasource.host')}</th>
                    <th className="px-4 py-3">{t('datasource.database')}</th>
                    <th className="px-4 py-3">Trạng thái CSDL</th>
                    <th className="px-4 py-3">Mã hóa Password</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">{t('rbac.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {datasources.map((ds) => (
                    <tr key={ds.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-medium text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-400" />
                        {ds.name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {ds.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">
                        {ds.host ? `${ds.host}:${ds.port}` : 'Local / Internal'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-mono text-xs">
                        {ds.database}
                      </td>
                      {/* Dấu chấm xanh lá thể hiện kết nối CSDL thành công */}
                      <td className="px-4 py-3.5">
                        {ds.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Đã kết nối (Online)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            Mất kết nối
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {ds.hasPassword ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> AES-256
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {/* Quick Test Ping từng dòng */}
                        <button
                          onClick={() => pingRowMutation.mutate(ds)}
                          disabled={pingingId === ds.id}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Thử nghiệm phản hồi CSDL (Test Ping)"
                        >
                          {pingingId === ds.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          ) : (
                            <Zap className="w-4 h-4 text-amber-400" />
                          )}
                        </button>

                        {/* Schema Explorer Button (CONN-02) */}
                        <button
                          onClick={() =>
                            setSelectedSchemaDs(
                              selectedSchemaDs?.id === ds.id
                                ? null
                                : { id: ds.id, name: ds.name },
                            )
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            selectedSchemaDs?.id === ds.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                          title="Xem cây Schema (CONN-02)"
                        >
                          <FolderTree className="w-4 h-4" />
                        </button>

                        {/* Admin Only Delete */}
                        <PermissionGate allowedRoles={[UserRole.ADMIN]}>
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa kết nối "${ds.name}"?`)) {
                                deleteDsMutation.mutate(ds.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                            title="Xóa kết nối"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Schema Explorer Panel Column (CONN-02) */}
        {selectedSchemaDs && (
          <div className="lg:col-span-1 h-[500px]">
            <SchemaExplorer
              dataSourceId={selectedSchemaDs.id}
              dataSourceName={selectedSchemaDs.name}
            />
          </div>
        )}
      </div>

      {/* ── Modal Create Data Source (CONN-01) ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl shadow-black/50">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              {t('datasource.add_button')}
            </h3>

            <form onSubmit={handleSubmit((d) => saveDsMutation.mutate(d as DataSourceFormData))} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('datasource.name')}
                </label>
                <input
                  type="text"
                  placeholder="Production Database"
                  {...register('name')}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('datasource.type')}
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={DataSourceType.POSTGRES}>PostgreSQL</option>
                    <option value={DataSourceType.MYSQL}>MySQL</option>
                    <option value={DataSourceType.CLICKHOUSE}>ClickHouse</option>
                    <option value={DataSourceType.SQLITE}>SQLite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('datasource.port')}
                  </label>
                  <input
                    type="number"
                    placeholder="5432"
                    {...register('port', { valueAsNumber: true })}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('datasource.host')}
                </label>
                <input
                  type="text"
                  placeholder="localhost"
                  {...register('host')}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {t('datasource.database')}
                </label>
                <input
                  type="text"
                  placeholder="sales_db"
                  {...register('database')}
                  className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.database && (
                  <p className="text-xs text-red-400 mt-1">{errors.database.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('datasource.username')}
                  </label>
                  <input
                    type="text"
                    placeholder="postgres"
                    {...register('username')}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('datasource.password')}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="ssl"
                  {...register('ssl')}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="ssl" className="text-xs text-slate-300 cursor-pointer">
                  {t('datasource.ssl')}
                </label>
              </div>

              {/* Thông báo trạng thái kiểm tra kết nối */}
              <div className="pt-2">
                {isTestedSuccess ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Kết nối CSDL hợp lệ! Nút 'Lưu kết nối' đã sẵn sàng.
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 font-medium">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Bắt buộc bấm <strong>'Kiểm tra kết nối (Test Ping)'</strong> thành công trước khi lưu.
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {/* Test Ping button */}
                <button
                  type="button"
                  onClick={handleSubmit((values) => testConnMutation.mutate(values))}
                  disabled={testConnMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors disabled:opacity-50"
                >
                  {testConnMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  {testConnMutation.isPending
                    ? t('datasource.testing')
                    : t('datasource.test_button')}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-2 text-xs rounded-lg text-slate-400 hover:text-white transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!isTestedSuccess || saveDsMutation.isPending}
                    title={!isTestedSuccess ? 'Vui lòng kiểm tra kết nối thành công trước khi lưu' : ''}
                    className={`px-4 py-2 text-xs rounded-lg font-medium transition-all shadow-md ${
                      isTestedSuccess
                        ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {saveDsMutation.isPending ? 'Đang lưu...' : t('datasource.save_button')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
