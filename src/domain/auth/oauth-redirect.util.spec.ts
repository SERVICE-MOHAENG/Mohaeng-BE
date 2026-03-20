import { HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../../global/dto/ApiResponseDto';
import {
  buildOAuthRedirectUrl,
  extractOAuthFailurePayload,
  redirectOAuthFailure,
} from './oauth-redirect.util';

describe('oauth-redirect.util', () => {
  it('appends query params to the frontend redirect url', () => {
    const redirectUrl = buildOAuthRedirectUrl(
      'http://localhost:3000/oauth/callback/google?source=app',
      {
        code: 'oauth-code',
      },
    );

    expect(redirectUrl).toBe(
      'http://localhost:3000/oauth/callback/google?source=app&code=oauth-code',
    );
  });

  it('extracts error code and message from HttpException', () => {
    const error = new HttpException(
      ApiResponseDto.error('TRIP_CORE_HE_AUTH_A004', '이미 다른 방식으로 가입된 이메일입니다'),
      HttpStatus.CONFLICT,
    );

    expect(extractOAuthFailurePayload(error)).toEqual({
      errorCode: 'TRIP_CORE_HE_AUTH_A004',
      message: '이미 다른 방식으로 가입된 이메일입니다',
    });
  });

  it('redirects provider errors to the frontend callback url', () => {
    const response = {
      redirect: jest.fn(),
    } as unknown as Response;

    redirectOAuthFailure(
      response,
      'http://localhost:3000/oauth/callback/google',
      'google',
      undefined,
      {
        query: {
          error: 'access_denied',
          error_description: '사용자가 로그인을 취소했습니다',
        },
      },
    );

    expect(response.redirect).toHaveBeenCalledWith(
      'http://localhost:3000/oauth/callback/google?errorCode=access_denied&message=%EC%82%AC%EC%9A%A9%EC%9E%90%EA%B0%80+%EB%A1%9C%EA%B7%B8%EC%9D%B8%EC%9D%84+%EC%B7%A8%EC%86%8C%ED%96%88%EC%8A%B5%EB%8B%88%EB%8B%A4&provider=google',
    );
  });
});
