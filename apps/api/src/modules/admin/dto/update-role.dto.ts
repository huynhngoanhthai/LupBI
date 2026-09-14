import { IsEnum } from 'class-validator';
import { UserRole, UpdateUserRoleDto } from '@lupbi/shared-types';

export class UpdateRoleDto implements UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  role!: UserRole;
}
