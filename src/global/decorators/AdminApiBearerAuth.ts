import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AdminPermission } from '../../domain/admin/entity/AdminPermission.enum';
import { AdminAuthGuard } from '../guards/AdminAuth.guard';
import { ADMIN_PERMISSIONS_KEY } from './AdminAuth';

/**
 * 관리자 API Bearer 인증 데코레이터
 * @description
 * - 관리자 인증 및 권한 체크
 * - Swagger에 Bearer 인증 표시
 *
 * @param permissions - 필요한 권한(들). 생략 시 모든 관리자 접근 가능
 * @example
 * // 특정 권한 필요
 * @AdminApiBearerAuth(AdminPermission.PRODUCT_MANAGEMENT)
 *
 * // 여러 권한 중 하나
 * @AdminApiBearerAuth([AdminPermission.ORDER_MANAGEMENT, AdminPermission.PAYMENT_MANAGEMENT])
 *
 * // 모든 관리자 접근 가능
 * @AdminApiBearerAuth()
 */
export function AdminApiBearerAuth(
  permissions?: AdminPermission | AdminPermission[],
): MethodDecorator {
  const decorators = [
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: '인증 실패' }),
    UseGuards(AdminAuthGuard),
  ];

  if (permissions) {
    const permissionArray = Array.isArray(permissions)
      ? permissions
      : [permissions];
    if (permissionArray.length > 0) {
      decorators.push(SetMetadata(ADMIN_PERMISSIONS_KEY, permissionArray));
    }
  }

  return applyDecorators(...decorators);
}
