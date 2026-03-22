import { ConfigService } from '@nestjs/config';
import { ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { GoogleAuthCallbackGuard } from './google-auth-callback.guard';
import { LogInterceptorService } from '../../../global/logger/LogInterceptorService';

describe('GoogleAuthCallbackGuard', () => {
  const frontendRedirectUrl = 'https://www.mohaeng.kr/oauth/callback/google';

  const createGuard = () => {
    const configService = {
      get: () => frontendRedirectUrl,
    } as unknown as ConfigService;

    return new GoogleAuthCallbackGuard(configService);
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs a safe failure payload and redirects to the frontend callback', () => {
    const guard = createGuard();
    const warnSpy = jest
      .spyOn(LogInterceptorService.prototype, 'warn')
      .mockImplementation(() => {});
    const response = {
      redirect: jest.fn(),
    } as unknown as Response;
    const request = {
      query: {
        error: 'access_denied',
        error_description: '사용자가 로그인을 취소했습니다',
      },
    } as unknown as Request;
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;

    const result = guard.handleRequest(
      undefined,
      undefined,
      {
        code: 'OAUTH_PROVIDER_FAILURE',
        message: 'provider rejected',
      },
      context,
    );

    expect(result).toBeNull();
    const [logMessage] = warnSpy.mock.calls[0];
    expect(logMessage).toContain('"provider":"google"');
    expect(logMessage).toContain('"queryError":"access_denied"');
    expect(logMessage).toContain('"infoMessage":"provider rejected"');
    expect(response.redirect).toHaveBeenCalledWith(
      `${frontendRedirectUrl}?errorCode=access_denied&message=%EC%82%AC%EC%9A%A9%EC%9E%90%EA%B0%80+%EB%A1%9C%EA%B7%B8%EC%9D%B8%EC%9D%84+%EC%B7%A8%EC%86%8C%ED%96%88%EC%8A%B5%EB%8B%88%EB%8B%A4&provider=google`,
    );
  });

  it('returns the authenticated user without logging on success', () => {
    const guard = createGuard();
    const warnSpy = jest
      .spyOn(LogInterceptorService.prototype, 'warn')
      .mockImplementation(() => {});
    const user = { id: 'user-id' };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ query: {} }),
        getResponse: () => ({ redirect: jest.fn() }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.handleRequest(undefined, user, undefined, context)).toBe(user);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
