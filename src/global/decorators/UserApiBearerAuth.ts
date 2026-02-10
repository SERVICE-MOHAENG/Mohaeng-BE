import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserAuthGuard } from '../guards/UserAuth.guard';

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
  return applyDecorators(
    ApiBearerAuth('access-token'),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    UseGuards(UserAuthGuard),
  );
}
