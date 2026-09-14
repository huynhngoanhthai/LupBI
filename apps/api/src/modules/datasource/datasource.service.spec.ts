import { Test, TestingModule } from '@nestjs/testing';
import { DataSourceService } from './datasource.service';
import { EncryptionService } from '../../common/services/encryption.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DataSourceType } from '@lupbi/shared-types';

const mockDataSource = {
  id: 'ds-cuid-001',
  name: 'Production Postgres',
  type: DataSourceType.POSTGRES,
  host: 'localhost',
  port: 5432,
  database: 'sales_db',
  username: 'postgres',
  encryptedPassword: 'iv:tag:ciphertext',
  ssl: false,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrismaService: any = {
  dataSource: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cachedTable: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(mockPrismaService)),
};

describe('DataSourceService (CONN-01 & CONN-02)', () => {
  let service: DataSourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSourceService,
        EncryptionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DataSourceService>(DataSourceService);
    jest.clearAllMocks();
  });

  describe('createDataSource()', () => {
    it('RC-CONN-03: Mã hóa password và không trả về password nguyên văn', async () => {
      mockPrismaService.dataSource.create.mockResolvedValueOnce(mockDataSource);
      mockPrismaService.dataSource.findUnique.mockResolvedValueOnce(mockDataSource);

      const result = await service.createDataSource({
        name: 'Production Postgres',
        type: DataSourceType.POSTGRES,
        host: 'localhost',
        port: 5432,
        database: 'sales_db',
        username: 'postgres',
        password: 'SuperSecretPassword!',
      });

      expect(result.id).toBe('ds-cuid-001');
      expect(result.hasPassword).toBe(true);
      // 🔒 RC-CONN-04: Bảo mật không trả về raw password
      expect((result as any).password).toBeUndefined();
      expect((result as any).encryptedPassword).toBeUndefined();
    });
  });

  describe('getDataSources()', () => {
    it('RC-CONN-04: Trả về danh sách Data Sources chuẩn Zero N+1', async () => {
      mockPrismaService.dataSource.findMany.mockResolvedValueOnce([mockDataSource]);

      const list = await service.getDataSources();

      expect(list).toHaveLength(1);
      expect(list[0].name).toBe('Production Postgres');
      expect(list[0].hasPassword).toBe(true);
      // ✅ Audit Zero N+1: findMany chỉ gọi 1 lần
      expect(mockPrismaService.dataSource.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSchema()', () => {
    it('RC-META-06: Trả về Schema Metadata đã cache (Zero N+1)', async () => {
      mockPrismaService.dataSource.findUnique.mockResolvedValueOnce(mockDataSource);
      mockPrismaService.cachedTable.findMany.mockResolvedValueOnce([
        {
          id: 'tbl-001',
          schema: 'public',
          tableName: 'orders',
          tableType: 'TABLE',
          updatedAt: new Date(),
          columns: [
            {
              id: 'col-001',
              name: 'id',
              dataType: 'int8',
              normalizedType: 'NUMBER',
              isNullable: false,
              isPrimaryKey: true,
              position: 1,
            },
          ],
        },
      ]);

      const schema = await service.getSchema('ds-cuid-001');

      expect(schema.dataSourceId).toBe('ds-cuid-001');
      expect(schema.tables).toHaveLength(1);
      expect(schema.tables[0].tableName).toBe('orders');
      expect(schema.tables[0].columns[0].normalizedType).toBe('NUMBER');
      // ✅ Zero N+1: findMany chỉ 1 lần query
      expect(mockPrismaService.cachedTable.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
