import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

/**
 * 사용자 API Bearer 인증 데코레이터
 * @description
 * - JWT 사용자 인증
 * - Swagger에 Bearer 인증 표시
 *
 * @example
 * @UserApiBearerAuth()
 * async getMyOrders(@UserId() userId: string) {
 *   // 구현
 * }
 */
export function UserApiBearerAuth(): MethodDecorator {
  // 할 일: JwtAuthGuard 구현 후 UseGuards(JwtAuthGuard) 추가
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: '인증 실패' }),
    // UseGuards(JwtAuthGuard), // JwtAuthGuard 구현 후 주석 해제
  );
}
