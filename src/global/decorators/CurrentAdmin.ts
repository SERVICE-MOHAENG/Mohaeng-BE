import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 관리자 정보 주입 데코레이터
 * @description
 * - Request에서 관리자 전체 정보를 가져옴
 * - AdminGuard와 함께 사용
 *
 * @example
 * @AdminApiBearerAuth()
 * async createProduct(@CurrentAdmin() admin: AdminUser) {
 *   console.log(admin.id, admin.email, admin.permissions);
 * }
 */
export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // AdminGuard가 request.user에 관리자 정보 저장
  },
);
