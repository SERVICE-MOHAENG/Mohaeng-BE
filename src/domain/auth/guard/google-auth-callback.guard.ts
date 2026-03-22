import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import {
  buildOAuthFailureLogPayload,
  redirectOAuthFailure,
} from '../oauth-redirect.util';
import { LogInterceptorService } from '../../../global/logger/LogInterceptorService';

@Injectable()
export class GoogleAuthCallbackGuard extends AuthGuard('google') {
  private readonly logger = new LogInterceptorService();

  constructor(private readonly configService: ConfigService) {
    super();
    this.logger.setContext(GoogleAuthCallbackGuard.name);
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
      const failurePayload = buildOAuthFailureLogPayload(
        'google',
        err,
        info,
        request,
      );

      this.logger.warn(
        `[OAUTH_CALLBACK_FAILURE] ${JSON.stringify(failurePayload)}`,
      );

      redirectOAuthFailure(
        response,
        this.getFrontendRedirectUrl(),
        'google',
        err ?? info,
        request,
      );

      return null as TUser;
    }

    return user as TUser;
  }

  private getFrontendRedirectUrl(): string {
    const frontendRedirectUrl = this.configService.get<string>(
      'GOOGLE_FRONTEND_REDIRECT_URL',
    );

    if (!frontendRedirectUrl) {
      throw new Error(
        'GOOGLE_FRONTEND_REDIRECT_URL 환경 변수가 설정되지 않았습니다. .env 파일에 해당 값을 설정해주세요.',
      );
    }

    return frontendRedirectUrl;
  }
}
