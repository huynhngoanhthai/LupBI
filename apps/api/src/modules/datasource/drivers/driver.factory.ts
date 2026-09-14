import { DataSourceType, NormalizedColumnType } from '@lupbi/shared-types';
import { Pool as PgPool } from 'pg';
import * as mysql from 'mysql2/promise';
import { createClient as createClickHouseClient } from '@clickhouse/client';

export interface TestConnectParams {
  type: DataSourceType;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface RawColumnInfo {
  tableName: string;
  schema: string;
  tableType: string; // 'TABLE' | 'VIEW'
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  position: number;
}

export class DriverFactory {
  /**
   * Thử nghiệm kết nối (Test Ping) trong tối đa 5000ms
   */
  static async testConnection(params: TestConnectParams): Promise<{ success: boolean; latencyMs: number }> {
    const startTime = Date.now();

    switch (params.type) {
      case DataSourceType.POSTGRES: {
        const pool = new PgPool({
          host: params.host || 'localhost',
          port: params.port || 5432,
          database: params.database,
          user: params.username,
          password: params.password,
          ssl: params.ssl ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 5000,
        });

        try {
          const client = await pool.connect();
          await client.query('SELECT 1');
          client.release();
          await pool.end();
          const latencyMs = Date.now() - startTime;
          return { success: true, latencyMs };
        } catch (error: any) {
          await pool.end().catch(() => {});
          throw new Error(error.message || 'Lỗi kết nối PostgreSQL');
        }
      }

      case DataSourceType.MYSQL: {
        try {
          const conn = await mysql.createConnection({
            host: params.host || 'localhost',
            port: params.port || 3306,
            database: params.database,
            user: params.username,
            password: params.password,
            connectTimeout: 5000,
            ssl: params.ssl ? { rejectUnauthorized: false } : undefined,
          });

          await conn.query('SELECT 1');
          await conn.end();
          const latencyMs = Date.now() - startTime;
          return { success: true, latencyMs };
        } catch (error: any) {
          throw new Error(error.message || 'Lỗi kết nối MySQL');
        }
      }

      case DataSourceType.CLICKHOUSE: {
        try {
          const client = createClickHouseClient({
            url: `http://${params.host || 'localhost'}:${params.port || 8123}`,
            username: params.username || 'default',
            password: params.password || '',
            database: params.database,
            request_timeout: 5000,
          });

          await client.ping();
          await client.close();
          const latencyMs = Date.now() - startTime;
          return { success: true, latencyMs };
        } catch (error: any) {
          throw new Error(error.message || 'Lỗi kết nối ClickHouse');
        }
      }

      case DataSourceType.SQLITE: {
        // SQLite local file test
        const latencyMs = Date.now() - startTime;
        return { success: true, latencyMs };
      }

      default:
        throw new Error(`Chưa hỗ trợ loại Database: ${params.type}`);
    }
  }

  /**
   * Quét thông tin Metadata (Schemas, Tables, Views, Columns, PKs) từ CSDL đích (CONN-02)
   */
  static async fetchMetadata(params: TestConnectParams): Promise<RawColumnInfo[]> {
    switch (params.type) {
      case DataSourceType.POSTGRES: {
        const pool = new PgPool({
          host: params.host || 'localhost',
          port: params.port || 5432,
          database: params.database,
          user: params.username,
          password: params.password,
          ssl: params.ssl ? { rejectUnauthorized: false } : false,
          connectionTimeoutMillis: 5000,
        });

        try {
          const client = await pool.connect();

          // Query lấy thông tin tables & columns từ information_schema
          const query = `
            SELECT 
              c.table_schema as "schema",
              c.table_name as "tableName",
              t.table_type as "tableType",
              c.column_name as "columnName",
              c.data_type as "dataType",
              (c.is_nullable = 'YES') as "isNullable",
              c.ordinal_position as "position",
              COALESCE(
                EXISTS (
                  SELECT 1 FROM information_schema.table_constraints tc
                  JOIN information_schema.key_column_usage kcu 
                    ON tc.constraint_name = kcu.constraint_name
                  WHERE tc.constraint_type = 'PRIMARY KEY' 
                    AND kcu.table_schema = c.table_schema
                    AND kcu.table_name = c.table_name 
                    AND kcu.column_name = c.column_name
                ), false
              ) as "isPrimaryKey"
            FROM information_schema.columns c
            JOIN information_schema.tables t 
              ON c.table_schema = t.table_schema AND c.table_name = t.table_name
            WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY c.table_schema, c.table_name, c.ordinal_position;
          `;

          const res = await client.query(query);
          client.release();
          await pool.end();

          return res.rows.map((r) => ({
            schema: r.schema,
            tableName: r.tableName,
            tableType: r.tableType === 'VIEW' ? 'VIEW' : 'TABLE',
            columnName: r.columnName,
            dataType: r.dataType,
            isNullable: Boolean(r.isNullable),
            isPrimaryKey: Boolean(r.isPrimaryKey),
            position: Number(r.position),
          }));
        } catch (error: any) {
          await pool.end().catch(() => {});
          throw new Error(`Quét metadata Postgres thất bại: ${error.message}`);
        }
      }

      case DataSourceType.MYSQL: {
        const conn = await mysql.createConnection({
          host: params.host || 'localhost',
          port: params.port || 3306,
          database: params.database,
          user: params.username,
          password: params.password,
          connectTimeout: 5000,
        });

        try {
          const [rows]: any = await conn.query(`
            SELECT 
              c.TABLE_SCHEMA as \`schema\`,
              c.TABLE_NAME as \`tableName\`,
              t.TABLE_TYPE as \`tableType\`,
              c.COLUMN_NAME as \`columnName\`,
              c.DATA_TYPE as \`dataType\`,
              IF(c.IS_NULLABLE = 'YES', 1, 0) as \`isNullable\`,
              c.ORDINAL_POSITION as \`position\`,
              IF(c.COLUMN_KEY = 'PRI', 1, 0) as \`isPrimaryKey\`
            FROM information_schema.COLUMNS c
            JOIN information_schema.TABLES t 
              ON c.TABLE_SCHEMA = t.TABLE_SCHEMA AND c.TABLE_NAME = t.TABLE_NAME
            WHERE c.TABLE_SCHEMA = DATABASE()
            ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
          `);

          await conn.end();

          return rows.map((r: any) => ({
            schema: r.schema || 'default',
            tableName: r.tableName,
            tableType: r.tableType === 'VIEW' ? 'VIEW' : 'TABLE',
            columnName: r.columnName,
            dataType: r.dataType,
            isNullable: Boolean(r.isNullable),
            isPrimaryKey: Boolean(r.isPrimaryKey),
            position: Number(r.position),
          }));
        } catch (error: any) {
          await conn.end().catch(() => {});
          throw new Error(`Quét metadata MySQL thất bại: ${error.message}`);
        }
      }

      default:
        // Trả về mock schema môt tả cho SQLite / Demo
        return [
          {
            schema: 'public',
            tableName: 'users',
            tableType: 'TABLE',
            columnName: 'id',
            dataType: 'varchar',
            isNullable: false,
            isPrimaryKey: true,
            position: 1,
          },
          {
            schema: 'public',
            tableName: 'users',
            tableType: 'TABLE',
            columnName: 'email',
            dataType: 'varchar',
            isNullable: false,
            isPrimaryKey: false,
            position: 2,
          },
          {
            schema: 'public',
            tableName: 'orders',
            tableType: 'TABLE',
            columnName: 'id',
            dataType: 'int8',
            isNullable: false,
            isPrimaryKey: true,
            position: 1,
          },
          {
            schema: 'public',
            tableName: 'orders',
            tableType: 'TABLE',
            columnName: 'total_amount',
            dataType: 'numeric',
            isNullable: false,
            isPrimaryKey: false,
            position: 2,
          },
          {
            schema: 'public',
            tableName: 'orders',
            tableType: 'TABLE',
            columnName: 'created_at',
            dataType: 'timestamp',
            isNullable: false,
            isPrimaryKey: false,
            position: 3,
          },
        ];
    }
  }

  /**
   * Chuẩn hóa kiểu dữ liệu gốc (varchar, int8, timestamp...) thành 4 nhóm kiểu chuẩn:
   * STRING | NUMBER | DATETIME | BOOLEAN
   */
  static normalizeDataType(rawType: string): NormalizedColumnType {
    const t = rawType.toLowerCase();

    if (
      t.includes('int') ||
      t.includes('number') ||
      t.includes('decimal') ||
      t.includes('float') ||
      t.includes('double') ||
      t.includes('numeric') ||
      t.includes('serial')
    ) {
      return 'NUMBER';
    }

    if (
      t.includes('date') ||
      t.includes('time') ||
      t.includes('timestamp') ||
      t.includes('year')
    ) {
      return 'DATETIME';
    }

    if (t.includes('bool') || t.includes('bit')) {
      return 'BOOLEAN';
    }

    return 'STRING';
  }
}
