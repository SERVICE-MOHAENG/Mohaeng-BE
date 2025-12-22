import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 사용자 정보 주입 데코레이터
 * @description
 * - Request에서 사용자 전체 정보를 가져옴
 * - JwtAuthGuard와 함께 사용
 *
 * @example
 * @UserApiBearerAuth()
 * async getMyProfile(@CurrentUser() user: User) {
 *   console.log(user.id, user.email, user.name);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // JwtAuthGuard가 request.user에 사용자 정보 저장
  },
);
