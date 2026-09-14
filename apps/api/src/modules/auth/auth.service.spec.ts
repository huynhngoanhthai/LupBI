import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@lupbi/shared-types';

// ─── Mock Factories ────────────────────────────────────────────────────────

const mockActiveUser = {
  id: 'user-cuid-001',
  email: 'admin@lupbi.com',
  passwordHash: '', // Được set trong beforeAll
  fullName: 'LupBI Administrator',
  role: UserRole.ADMIN,
  isActive: true,
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
};

// ─── Test Suite ────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(async () => {
    // Hash password một lần cho toàn bộ test suite (tránh tốn thời gian)
    mockActiveUser.passwordHash = await bcrypt.hash('Admin@123!', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ─── login() ─────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('RC-01 - Happy Path: trả về accessToken và user khi thông tin đúng', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockActiveUser);

      const result = await service.login({
        email: 'admin@lupbi.com',
        password: 'Admin@123!',
      });

      expect(result.response.accessToken).toBe('mock.jwt.token');
      expect(result.response.user.email).toBe('admin@lupbi.com');
      expect(result.response.user.role).toBe(UserRole.ADMIN);

      // ✅ Zero N+1 Audit: findUnique chỉ được gọi đúng 1 lần
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('RC-02 - Exception: ném UnauthorizedException khi mật khẩu sai', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockActiveUser);

      await expect(
        service.login({ email: 'admin@lupbi.com', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);

      // ✅ Zero N+1: vẫn chỉ 1 lần query
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('Exception: ném UnauthorizedException khi email không tồn tại', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.login({ email: 'nonexist@lupbi.com', password: 'Any@123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Exception: ném UnauthorizedException khi tài khoản bị vô hiệu hóa', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        ...mockActiveUser,
        isActive: false,
      });

      await expect(
        service.login({ email: 'admin@lupbi.com', password: 'Admin@123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── refresh() ───────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('RC-04 - Happy Path: trả về accessToken mới khi refreshToken hợp lệ', async () => {
      mockJwtService.verify.mockReturnValueOnce({
        sub: 'user-cuid-001',
        email: 'admin@lupbi.com',
        role: UserRole.ADMIN,
      });
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 'user-cuid-001',
        email: 'admin@lupbi.com',
        role: UserRole.ADMIN,
        isActive: true,
      });

      const result = await service.refresh('valid.refresh.token');

      expect(result.accessToken).toBe('mock.jwt.token');
      // ✅ Zero N+1: chỉ 1 query verify user
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('Exception: ném UnauthorizedException khi không có refreshToken', async () => {
      await expect(service.refresh(undefined)).rejects.toThrow(UnauthorizedException);
    });

    it('Exception: ném ForbiddenException khi refreshToken không hợp lệ', async () => {
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });

      await expect(service.refresh('expired.token')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── getMe() ─────────────────────────────────────────────────────────────

  describe('getMe()', () => {
    it('trả về đầy đủ thông tin user', async () => {
      const now = new Date();
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValueOnce({
        id: 'user-cuid-001',
        email: 'admin@lupbi.com',
        fullName: 'LupBI Administrator',
        role: UserRole.ADMIN,
        isActive: true,
        createdAt: now,
      });

      const result = await service.getMe('user-cuid-001');

      expect(result.id).toBe('user-cuid-001');
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.createdAt).toBe(now.toISOString());
      // ✅ Zero N+1: chỉ 1 query
      expect(mockPrismaService.user.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    });
  });
});
