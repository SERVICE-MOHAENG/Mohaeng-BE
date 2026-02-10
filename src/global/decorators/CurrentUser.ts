import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type AuthenticatedUser = {
  id: string;
  email: string;
} & Record<string, unknown>;

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    void data;
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    return request.user;
  },
);
