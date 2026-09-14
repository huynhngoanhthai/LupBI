import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { DriverFactory } from './drivers/driver.factory';
import {
  CreateDataSourceDto,
  UpdateDataSourceDto,
  DataSourceResponseDto,
  TestConnectionDto,
  TestConnectionResultDto,
  DataSourceType,
  DataSourceSchemaResponseDto,
  SyncSchemaResultDto,
} from '@lupbi/shared-types';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class DataSourceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
  ) {}

  // ─── TEST CONNECTION (CONN-01) ───────────────────────────────────────────

  async testConnection(dto: TestConnectionDto): Promise<TestConnectionResultDto> {
    const i18n = I18nContext.current();
    try {
      const { success, latencyMs } = await DriverFactory.testConnection(dto);
      const translated = i18n?.translate('datasource.test_success');
      const message =
        translated && typeof translated === 'string' && !translated.startsWith('datasource.')
          ? translated
          : 'Kết nối thành công!';
      return { success, latencyMs, message: `${message} (${latencyMs}ms)` };
    } catch (error: any) {
      const translated = i18n?.translate('datasource.test_failed');
      const prefix =
        translated && typeof translated === 'string' && !translated.startsWith('datasource.')
          ? (translated.endsWith(' ') ? translated : `${translated} `)
          : 'Kết nối thất bại: ';
      return {
        success: false,
        message: `${prefix}${error.message || 'Connection failed'}`,
      };
    }
  }

  // ─── CREATE DATA SOURCE (CONN-01) ────────────────────────────────────────

  async createDataSource(dto: CreateDataSourceDto): Promise<DataSourceResponseDto> {
    const encryptedPassword = dto.password
      ? this.encryptionService.encrypt(dto.password)
      : null;

    const ds = await this.prisma.dataSource.create({
      data: {
        name: dto.name,
        type: dto.type,
        host: dto.host,
        port: dto.port,
        database: dto.database,
        username: dto.username,
        encryptedPassword,
        ssl: dto.ssl ?? false,
      },
    });

    // 🚀 Trigger background job đồng bộ metadata lần đầu (CONN-02 FR-META-02)
    this.syncSchema(ds.id).catch((err) => {
      console.warn(`[Background Sync] Không thể đồng bộ schema lần đầu cho ${ds.id}:`, err.message);
    });

    return this.mapToResponse(ds);
  }

  // ─── GET ALL DATA SOURCES (CONN-01) ──────────────────────────────────────

  async getDataSources(): Promise<DataSourceResponseDto[]> {
    // ✅ Zero N+1: 1 query lấy danh sách
    const list = await this.prisma.dataSource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((ds) => this.mapToResponse(ds));
  }

  // ─── GET DATA SOURCE BY ID ───────────────────────────────────────────────

  async getDataSourceById(id: string): Promise<DataSourceResponseDto> {
    const i18n = I18nContext.current();
    const ds = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!ds) {
      throw new NotFoundException(
        i18n?.translate('datasource.not_found') ?? 'Không tìm thấy nguồn dữ liệu',
      );
    }
    return this.mapToResponse(ds);
  }

  // ─── UPDATE DATA SOURCE ──────────────────────────────────────────────────

  async updateDataSource(id: string, dto: UpdateDataSourceDto): Promise<DataSourceResponseDto> {
    const i18n = I18nContext.current();
    const existing = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(
        i18n?.translate('datasource.not_found') ?? 'Không tìm thấy nguồn dữ liệu',
      );
    }

    const dataToUpdate: any = { ...dto };
    delete dataToUpdate.password;

    if (dto.password) {
      dataToUpdate.encryptedPassword = this.encryptionService.encrypt(dto.password);
    }

    const updated = await this.prisma.dataSource.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.mapToResponse(updated);
  }

  // ─── DELETE DATA SOURCE ──────────────────────────────────────────────────

  async deleteDataSource(id: string): Promise<{ success: boolean }> {
    const i18n = I18nContext.current();
    const existing = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(
        i18n?.translate('datasource.not_found') ?? 'Không tìm thấy nguồn dữ liệu',
      );
    }

    await this.prisma.dataSource.delete({ where: { id } });
    return { success: true };
  }

  // ─── GET CACHED SCHEMA (CONN-02) ─────────────────────────────────────────

  async getSchema(id: string): Promise<DataSourceSchemaResponseDto> {
    const i18n = I18nContext.current();
    const ds = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!ds) {
      throw new NotFoundException(
        i18n?.translate('datasource.not_found') ?? 'Không tìm thấy nguồn dữ liệu',
      );
    }

    // ✅ Zero N+1: Query 1 lần lấy tất cả cached_tables kèm include columns
    const cachedTables = await this.prisma.cachedTable.findMany({
      where: { dataSourceId: id },
      include: {
        columns: {
          orderBy: { position: 'asc' },
        },
      },
      orderBy: [{ schema: 'asc' }, { tableName: 'asc' }],
    });

    return {
      dataSourceId: id,
      tables: cachedTables.map((t) => ({
        id: t.id,
        schema: t.schema,
        tableName: t.tableName,
        tableType: t.tableType,
        updatedAt: t.updatedAt.toISOString(),
        columns: t.columns.map((c) => ({
          id: c.id,
          name: c.name,
          dataType: c.dataType,
          normalizedType: c.normalizedType as any,
          isNullable: c.isNullable,
          isPrimaryKey: c.isPrimaryKey,
          position: c.position,
        })),
      })),
    };
  }

  // ─── SYNC SCHEMA METADATA (CONN-02) ───────────────────────────────────────

  async syncSchema(id: string): Promise<SyncSchemaResultDto> {
    const i18n = I18nContext.current();
    const ds = await this.prisma.dataSource.findUnique({ where: { id } });
    if (!ds) {
      throw new NotFoundException(
        i18n?.translate('datasource.not_found') ?? 'Không tìm thấy nguồn dữ liệu',
      );
    }

    // Giải mã password
    const rawPassword = ds.encryptedPassword
      ? this.encryptionService.decrypt(ds.encryptedPassword)
      : undefined;

    // Quét metadata từ database đích
    const rawColumns = await DriverFactory.fetchMetadata({
      type: ds.type as DataSourceType,
      host: ds.host ?? undefined,
      port: ds.port ?? undefined,
      database: ds.database,
      username: ds.username ?? undefined,
      password: rawPassword,
      ssl: ds.ssl,
    });

    // Gom nhóm columns theo (schema, tableName)
    const tableGroupMap = new Map<string, { schema: string; tableName: string; tableType: string; columns: any[] }>();

    rawColumns.forEach((col) => {
      const groupKey = `${col.schema}.${col.tableName}`;
      if (!tableGroupMap.has(groupKey)) {
        tableGroupMap.set(groupKey, {
          schema: col.schema,
          tableName: col.tableName,
          tableType: col.tableType,
          columns: [],
        });
      }

      tableGroupMap.get(groupKey)!.columns.push({
        name: col.columnName,
        dataType: col.dataType,
        normalizedType: DriverFactory.normalizeDataType(col.dataType),
        isNullable: col.isNullable,
        isPrimaryKey: col.isPrimaryKey,
        position: col.position,
      });
    });

    // Cập nhật nguyên tử (Atomically) vào DB nội bộ LupBI
    await this.prisma.$transaction(async (tx) => {
      // Xóa cache cũ của datasource này
      await tx.cachedTable.deleteMany({ where: { dataSourceId: id } });

      // Tạo mới cache tables & columns
      for (const group of Array.from(tableGroupMap.values())) {
        await tx.cachedTable.create({
          data: {
            dataSourceId: id,
            schema: group.schema,
            tableName: group.tableName,
            tableType: group.tableType,
            columns: {
              create: group.columns.map((c) => ({
                name: c.name,
                dataType: c.dataType,
                normalizedType: c.normalizedType,
                isNullable: c.isNullable,
                isPrimaryKey: c.isPrimaryKey,
                position: c.position,
              })),
            },
          },
        });
      }
    });

    const tableCount = tableGroupMap.size;
    const columnCount = rawColumns.length;

    return {
      success: true,
      tableCount,
      columnCount,
      message: i18n?.translate('schema.sync_success') ?? `Đồng bộ thành công ${tableCount} bảng và ${columnCount} cột`,
    };
  }

  // ─── HELPER ──────────────────────────────────────────────────────────────

  private mapToResponse(ds: any): DataSourceResponseDto {
    return {
      id: ds.id,
      name: ds.name,
      type: ds.type as DataSourceType,
      host: ds.host ?? undefined,
      port: ds.port ?? undefined,
      database: ds.database,
      username: ds.username ?? undefined,
      hasPassword: Boolean(ds.encryptedPassword), // 🔒 Bảo mật: không bao giờ trả về mật khẩu gốc
      ssl: ds.ssl,
      isActive: ds.isActive,
      createdAt: ds.createdAt.toISOString(),
      updatedAt: ds.updatedAt.toISOString(),
    };
  }
}
