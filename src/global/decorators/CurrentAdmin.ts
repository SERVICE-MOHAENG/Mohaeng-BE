import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type AuthenticatedAdmin = {
  id: string;
  email?: string;
  permissions?: number;
  isSuperAdmin?: boolean;
};

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    void data;
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { admin?: AuthenticatedAdmin }>();
    return request.admin;
  },
);
