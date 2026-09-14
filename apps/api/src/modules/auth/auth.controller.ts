import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MeResponseDto, LoginResponseDto, RefreshResponseDto } from '@lupbi/shared-types';

const REFRESH_COOKIE_NAME = 'refreshToken';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── POST /api/v1/auth/login ────────────────────────────────────────────
  // Rate limit chặt hơn: 5 lần / 60 giây để chống Brute Force
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
    const { response, refreshToken } = await this.authService.login(dto);

    // Gắn Refresh Token vào HTTP-Only Cookie (chống XSS)
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      this.authService.getRefreshTokenCookieOptions(),
    );

    return response;
  }

  // ─── POST /api/v1/auth/refresh ──────────────────────────────────────────
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request): Promise<RefreshResponseDto> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
    return this.authService.refresh(refreshToken);
  }

  // ─── POST /api/v1/auth/logout ───────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth',
    });
  }

  // ─── GET /api/v1/auth/me ────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request): Promise<MeResponseDto> {
    const user = req.user as { id: string };
    return this.authService.getMe(user.id);
  }
}
