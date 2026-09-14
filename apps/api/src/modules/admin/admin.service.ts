import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserListItemDto, UserRole } from '@lupbi/shared-types';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách toàn bộ người dùng trong hệ thống (Dành cho ADMIN)
   * ✅ Zero N+1: Query 1 lần với select cụ thể các trường
   */
  async getUsers(): Promise<UserListItemDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role as UserRole,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    }));
  }

  /**
   * Cập nhật vai trò (Role) của người dùng (AUTH-02 RBAC)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<UserListItemDto> {
    const i18n = I18nContext.current();

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(
        i18n?.translate('admin.user_not_found') ?? 'Không tìm thấy người dùng',
      );
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
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
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role as UserRole,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
    };
  }
}
