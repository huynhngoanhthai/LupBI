'use client';

import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@lupbi/shared-types';

interface PermissionGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGate wrapper - Kiểm tra phân quyền RBAC ở cấp độ UI (AUTH-02)
 * Ẩn hoàn toàn hoặc hiển thị fallback nếu user không đủ quyền.
 */
export default function PermissionGate({
  allowedRoles,
  children,
  fallback = null,
}: PermissionGateProps) {
  const user = useAuthStore((s) => s.user);

  if (!user || !user.role) {
    return <>{fallback}</>;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
