import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 현재 로그인한 관리자 ID 주입 데코레이터
 * @description
 * - Request에서 관리자 ID만 가져옴
 * - AdminGuard와 함께 사용
 *
 * @example
 * @AdminApiBearerAuth()
 * async getStats(@AdminId() adminId: string) {
 *   console.log('Admin ID:', adminId);
 * }
 */
export const AdminId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id; // AdminGuard가 request.user에 관리자 정보 저장
  },
);
