import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../guards/AdminAuth.guard';
import { AdminPermission } from '../../domain/admin/entity/AdminPermission.enum';

export const ADMIN_PERMISSIONS_KEY = 'admin_permissions';

export function AdminAuth(
  permissions?: AdminPermission | AdminPermission[],
): MethodDecorator {
  const decorators = [UseGuards(AdminAuthGuard)];

  if (permissions) {
    const permissionArray = Array.isArray(permissions)
      ? permissions
      : [permissions];
    if (permissionArray.length > 0) {
      // Attach required permissions for AdminAuthGuard
      decorators.push(SetMetadata(ADMIN_PERMISSIONS_KEY, permissionArray));
    }
  }

  return applyDecorators(...decorators);
}
