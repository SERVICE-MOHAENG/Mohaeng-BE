import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

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
  permissions?: string | string[],
): MethodDecorator {
  // 할 일: AdminGuard 구현 후 UseGuards(AdminGuard) 추가
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: '인증 실패' }),
    // UseGuards(AdminGuard), // AdminGuard 구현 후 주석 해제
  );
}
