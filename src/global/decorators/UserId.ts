import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 사용자 ID 주입 데코레이터
 * @description
 * - Request에서 사용자 ID만 가져옴
 * - JwtAuthGuard와 함께 사용
 *
 * @example
 * @UserApiBearerAuth()
 * async getMyOrders(@UserId() userId: string) {
 *   console.log('User ID:', userId);
 * }
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id; // JwtAuthGuard가 request.user에 사용자 정보 저장
  },
);
