import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type AuthenticatedUser = {
  id: string;
};

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    void data;
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    return request.user?.id;
  },
);
