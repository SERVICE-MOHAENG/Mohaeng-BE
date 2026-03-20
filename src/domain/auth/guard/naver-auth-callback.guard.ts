import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { redirectOAuthFailure } from '../oauth-redirect.util';

@Injectable()
export class NaverAuthCallbackGuard extends AuthGuard('naver') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    void _status;

    if (err || !user) {
      const request = context.switchToHttp().getRequest<Request>();
      const response = context.switchToHttp().getResponse<Response>();

      redirectOAuthFailure(
        response,
        this.getFrontendRedirectUrl(),
        'naver',
        err ?? info,
        request,
      );

      return null as TUser;
    }

    return user as TUser;
  }

  private getFrontendRedirectUrl(): string {
    const frontendRedirectUrl = this.configService.get<string>(
      'NAVER_FRONTEND_REDIRECT_URL',
    );

    if (!frontendRedirectUrl) {
      throw new Error(
        'NAVER_FRONTEND_REDIRECT_URL 환경 변수가 설정되지 않았습니다. .env 파일에 해당 값을 설정해주세요.',
      );
    }

    return frontendRedirectUrl;
  }
}
