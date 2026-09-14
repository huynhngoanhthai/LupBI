import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, UserListItemDto } from '@lupbi/shared-types';
import { UpdateRoleDto } from './dto/update-role.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN) // 🔒 Chỉ duy nhất Admin mới truy cập được phân hệ này (AUTH-02)
@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers(): Promise<UserListItemDto[]> {
    return this.adminService.getUsers();
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<UserListItemDto> {
    return this.adminService.updateUserRole(id, dto.role);
  }
}
