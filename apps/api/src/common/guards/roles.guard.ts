import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, AuthErrorCode } from '@lupbi/shared-types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Nếu không khai báo @Roles(), mặc định cho phép truy cập
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException({
        message: 'Bạn không có quyền thực hiện hành động này',
        code: AuthErrorCode.FORBIDDEN_ROLE,
      });
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);

    if (!hasRole) {
      const i18n = I18nContext.current();
      const message =
        i18n?.translate('auth.forbidden_role') ??
        'Bạn không có quyền thực hiện hành động này';

      throw new ForbiddenException({
        message,
        code: AuthErrorCode.FORBIDDEN_ROLE,
      });
    }

    return true;
  }
}
