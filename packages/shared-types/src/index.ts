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
}

// ─────────────────────────────────────────
// Auth DTOs / Interfaces
// ─────────────────────────────────────────

/** POST /api/v1/auth/login - Request body */
export interface LoginRequestDto {
  email: string;
  password: string;
}

/** POST /api/v1/auth/login - Response body */
export interface LoginResponseDto {
  accessToken: string;
  user: UserProfileDto;
}

/** POST /api/v1/auth/refresh - Response body */
export interface RefreshResponseDto {
  accessToken: string;
}

/** GET /api/v1/auth/me - Response body */
export interface MeResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO 8601
}

/** Embedded user profile in login response */
export interface UserProfileDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

// ─────────────────────────────────────────
// JWT Payload (shared between BE sign and FE decode)
// ─────────────────────────────────────────

export interface JwtAccessPayload {
  sub: string;       // userId
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────
// API Error envelope
// ─────────────────────────────────────────

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code?: AuthErrorCode;
}
