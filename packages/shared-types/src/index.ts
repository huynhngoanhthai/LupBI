// ─────────────────────────────────────────
// Enums
// ─────────────────────────────────────────

export enum UserRole {
  ADMIN = 'ADMIN',
  CREATOR = 'CREATOR',
  VIEWER = 'VIEWER',
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_TOKEN_MISSING = 'REFRESH_TOKEN_MISSING',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  FORBIDDEN_ROLE = 'FORBIDDEN_ROLE',
}

export enum DataSourceType {
  POSTGRES = 'POSTGRES',
  MYSQL = 'MYSQL',
  CLICKHOUSE = 'CLICKHOUSE',
  SQLITE = 'SQLITE',
}

export type NormalizedColumnType = 'STRING' | 'NUMBER' | 'DATETIME' | 'BOOLEAN';

// ─────────────────────────────────────────
// Supported Languages
// ─────────────────────────────────────────

export type SupportedLanguage = 'vi' | 'en' | 'cn';
export const DEFAULT_LANGUAGE: SupportedLanguage = 'vi';

// ─────────────────────────────────────────
// Auth DTOs / Interfaces (AUTH-01)
// ─────────────────────────────────────────

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  user: UserProfileDto;
}

export interface RefreshResponseDto {
  accessToken: string;
}

export interface MeResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

// ─────────────────────────────────────────
// User Management DTOs (AUTH-02 RBAC)
// ─────────────────────────────────────────

export interface UserListItemDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

// ─────────────────────────────────────────
// Data Source Management DTOs (CONN-01)
// ─────────────────────────────────────────

export interface CreateDataSourceDto {
  name: string;
  type: DataSourceType;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface UpdateDataSourceDto {
  name?: string;
  type?: DataSourceType;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  isActive?: boolean;
}

export interface DataSourceResponseDto {
  id: string;
  name: string;
  type: DataSourceType;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  hasPassword: boolean; // 🔒 Mật khẩu tuyệt đối không bao giờ trả về nguyên văn
  ssl: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestConnectionDto {
  name?: string;
  type: DataSourceType;
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export interface TestConnectionResultDto {
  success: boolean;
  latencyMs?: number;
  message?: string;
}

// ─────────────────────────────────────────
// Schema & Metadata DTOs (CONN-02)
// ─────────────────────────────────────────

export interface ColumnMetadataDto {
  id: string;
  name: string;
  dataType: string;
  normalizedType: NormalizedColumnType;
  isNullable: boolean;
  isPrimaryKey: boolean;
  position: number;
}

export interface TableMetadataDto {
  id: string;
  schema: string;
  tableName: string;
  tableType: string; // 'TABLE' | 'VIEW'
  columns: ColumnMetadataDto[];
  updatedAt: string;
}

export interface DataSourceSchemaResponseDto {
  dataSourceId: string;
  tables: TableMetadataDto[];
}

export interface SyncSchemaResultDto {
  success: boolean;
  tableCount: number;
  columnCount: number;
  message?: string;
}

// ─────────────────────────────────────────
// JWT Payload
// ─────────────────────────────────────────

export interface JwtAccessPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────
// API Error Envelope
// ─────────────────────────────────────────

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code?: AuthErrorCode;
}
