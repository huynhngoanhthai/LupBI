import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nContext } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import {
  LoginResponseDto,
  RefreshResponseDto,
  MeResponseDto,
  JwtAccessPayload,
  UserRole,
  AuthErrorCode,
} from '@lupbi/shared-types';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ─── LOGIN (AUTH-01) ──────────────────────────────────────────────────────

  async login(dto: LoginDto): Promise<{ response: LoginResponseDto; refreshToken: string }> {
    const i18n = I18nContext.current();

    // ✅ Zero N+1: 1 query duy nhất lấy user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        message: i18n?.translate('auth.invalid_credentials') ?? 'Tên đăng nhập hoặc mật khẩu không chính xác',
        code: AuthErrorCode.INVALID_CREDENTIALS,
      });
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        message: i18n?.translate('auth.invalid_credentials') ?? 'Tên đăng nhập hoặc mật khẩu không chính xác',
        code: AuthErrorCode.INVALID_CREDENTIALS,
      });
    }

    const { accessToken, refreshToken } = this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return {
      response: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role as UserRole,
        },
      },
      refreshToken,
    };
  }

  // ─── REFRESH (AUTH-01) ───────────────────────────────────────────────────

  async refresh(refreshToken: string | undefined): Promise<RefreshResponseDto> {
    const i18n = I18nContext.current();

    if (!refreshToken) {
      throw new UnauthorizedException({
        message: i18n?.translate('auth.refresh_token_missing') ?? 'Refresh Token không tồn tại',
        code: AuthErrorCode.REFRESH_TOKEN_MISSING,
      });
    }

    let payload: JwtAccessPayload;
    try {
      payload = this.jwtService.verify<JwtAccessPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_fallback',
      });
    } catch {
      throw new ForbiddenException({
        message: i18n?.translate('auth.token_invalid') ?? 'Refresh Token không hợp lệ hoặc đã hết hạn',
        code: AuthErrorCode.TOKEN_INVALID,
      });
    }

    // ✅ Zero N+1: 1 query kiểm tra user còn active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        message: i18n?.translate('auth.account_inactive') ?? 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa',
        code: AuthErrorCode.ACCOUNT_INACTIVE,
      });
    }

    const { accessToken } = this.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role as UserRole,
    });

    return { accessToken };
  }

  // ─── ME (AUTH-01) ────────────────────────────────────────────────────────

  async getMe(userId: string): Promise<MeResponseDto> {
    // ✅ Zero N+1: select cụ thể các cột cần thiết
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  private generateTokenPair(payload: JwtAccessPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'access_fallback',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email, role: payload.role },
      {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_fallback',
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  getRefreshTokenCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: '/api/v1/auth',
    };
  }
}
