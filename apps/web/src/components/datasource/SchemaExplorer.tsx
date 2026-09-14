'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Database,
  Table as TableIcon,
  Search,
  RefreshCw,
  Key,
  Hash,
  Type as TypeIcon,
  Calendar,
  ToggleLeft,
  ChevronRight,
  ChevronDown,
  Copy,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useI18nStore } from '@/stores/i18n.store';
import {
  DataSourceSchemaResponseDto,
  SyncSchemaResultDto,
  NormalizedColumnType,
} from '@lupbi/shared-types';

interface SchemaExplorerProps {
  dataSourceId: string;
  dataSourceName: string;
}

export default function SchemaExplorer({
  dataSourceId,
  dataSourceName,
}: SchemaExplorerProps) {
  const t = useI18nStore((s) => s.t);
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  // Fetch cached schema metadata (CONN-02)
  const { data: schemaData, isLoading } = useQuery<DataSourceSchemaResponseDto>({
    queryKey: ['datasource-schema', dataSourceId],
    queryFn: async () => {
      const { data } = await apiClient.get<DataSourceSchemaResponseDto>(
        `/api/v1/datasources/${dataSourceId}/schema`,
      );
      return data;
    },
    enabled: !!dataSourceId,
  });

  // Mutation đồng bộ schema thủ công (Sync Schema Button)
  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post<SyncSchemaResultDto>(
        `/api/v1/datasources/${dataSourceId}/sync-schema`,
      );
      return data;
    },
    onSuccess: (res) => {
      toast.success(res.message || t('schema.sync_success', 'Đồng bộ Schema thành công!'));
      queryClient.invalidateQueries({ queryKey: ['datasource-schema', dataSourceId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('schema.sync_failed', 'Đồng bộ thất bại'));
    },
  });

  const toggleTable = (tableId: string) => {
    setExpandedTables((prev) => ({ ...prev, [tableId]: !prev[tableId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép: "${text}"`);
  };

  // Icon hiển thị theo Normalized Type
  const renderTypeIcon = (type: NormalizedColumnType) => {
    switch (type) {
      case 'NUMBER':
        return <Hash className="w-3.5 h-3.5 text-blue-400" />;
      case 'DATETIME':
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case 'BOOLEAN':
        return <ToggleLeft className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <TypeIcon className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // Filter tables & columns realtime
  const tables = schemaData?.tables || [];
  const filteredTables = tables.filter((tbl) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchTable = tbl.tableName.toLowerCase().includes(term);
    const matchColumn = tbl.columns.some((c) => c.name.toLowerCase().includes(term));
    return matchTable || matchColumn;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <Database className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className="font-semibold text-sm truncate">{dataSourceName}</span>
        </div>

        {/* Sync Schema Button */}
        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
          title={t('schema.sync_button')}
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${syncMutation.isPending ? 'animate-spin text-blue-400' : ''}`}
          />
          {syncMutation.isPending ? t('schema.syncing') : t('schema.sync_button')}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder={t('schema.search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Tree View Content */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-slate-500">Đang tải cấu trúc Schema...</div>
        ) : filteredTables.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            {searchTerm ? 'Không tìm thấy bảng phù hợp' : 'Chưa có thông tin bảng. Bấm Sync để quét.'}
          </div>
        ) : (
          filteredTables.map((tbl) => {
            const isExpanded = expandedTables[tbl.id] || !!searchTerm;

            return (
              <div key={tbl.id} className="rounded-lg border border-slate-800/50 overflow-hidden">
                {/* Table Row Header */}
                <div
                  onClick={() => toggleTable(tbl.id)}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-slate-800/40 hover:bg-slate-800/80 cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <TableIcon className="w-3.5 h-3.5 text-slate-300" />
                    <span className="font-medium text-white">{tbl.tableName}</span>
                    <span className="text-[10px] text-slate-500">({tbl.columns.length})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(tbl.tableName);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-white text-slate-500 p-1"
                    title="Sao chép tên bảng"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                {/* Columns List */}
                {isExpanded && (
                  <div className="pl-6 pr-2 py-1 space-y-1 bg-slate-950/50">
                    {tbl.columns.map((col) => (
                      <div
                        key={col.id}
                        onClick={() => copyToClipboard(col.name)}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-slate-800/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {renderTypeIcon(col.normalizedType)}
                          <span className="text-slate-300 group-hover:text-white font-mono">
                            {col.name}
                          </span>
                          {col.isPrimaryKey && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">
                              <Key className="w-2.5 h-2.5" /> PK
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">
                          {col.dataType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
