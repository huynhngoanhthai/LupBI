import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@lupbi/shared-types';

const mockUsersList = [
  {
    id: 'user-001',
    email: 'admin@lupbi.com',
    fullName: 'LupBI Admin',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'user-002',
    email: 'viewer@lupbi.com',
    fullName: 'LupBI Viewer',
    role: UserRole.VIEWER,
    isActive: true,
    createdAt: new Date(),
  },
];

const mockPrismaService = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('AdminService (RBAC AUTH-02)', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('getUsers()', () => {
    it('RC-05: Trả về danh sách người dùng đầy đủ cho Admin (Zero N+1)', async () => {
      mockPrismaService.user.findMany.mockResolvedValueOnce(mockUsersList);

      const users = await service.getUsers();

      expect(users).toHaveLength(2);
      expect(users[0].role).toBe(UserRole.ADMIN);
      expect(users[1].role).toBe(UserRole.VIEWER);
      // ✅ Audit Zero N+1: chỉ 1 query duy nhất
      expect(mockPrismaService.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserRole()', () => {
    it('Cập nhật vai trò từ VIEWER thành CREATOR thành công', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({ id: 'user-002' });
      mockPrismaService.user.update.mockResolvedValueOnce({
        ...mockUsersList[1],
        role: UserRole.CREATOR,
      });

      const result = await service.updateUserRole('user-002', UserRole.CREATOR);

      expect(result.role).toBe(UserRole.CREATOR);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-002' },
        data: { role: UserRole.CREATOR },
        select: expect.any(Object),
      });
    });

    it('Ném NotFoundException khi user_id không tồn tại', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateUserRole('non-existent', UserRole.ADMIN),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
