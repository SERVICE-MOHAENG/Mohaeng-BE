import { HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  GlobalErrorCode,
  GlobalErrorMessage,
} from '../../global/exception/code';

export type OAuthProviderName = 'google' | 'naver' | 'kakao';

type OAuthRedirectValue = string | number | boolean | null | undefined;

interface OAuthRedirectParams {
  [key: string]: OAuthRedirectValue;
}

interface OAuthErrorPayload {
  errorCode: string;
  message: string;
}

export function buildOAuthRedirectUrl(
  baseUrl: string,
  params: OAuthRedirectParams,
): string {
  const redirectUrl = new URL(baseUrl);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    redirectUrl.searchParams.set(key, String(value));
  }

  return redirectUrl.toString();
}

export function redirectOAuthSuccess(
  response: Response,
  frontendRedirectUrl: string,
  code: string,
): void {
  response.redirect(
    buildOAuthRedirectUrl(frontendRedirectUrl, {
      code,
    }),
  );
}

export function redirectOAuthFailure(
  response: Response,
  frontendRedirectUrl: string,
  provider: OAuthProviderName,
  error?: unknown,
  request?: Pick<Request, 'query'>,
): void {
  const { errorCode, message } = extractOAuthFailurePayload(error, request);

  response.redirect(
    buildOAuthRedirectUrl(frontendRedirectUrl, {
      errorCode,
      message,
      provider,
    }),
  );
}

export function extractOAuthFailurePayload(
  error?: unknown,
  request?: Pick<Request, 'query'>,
): OAuthErrorPayload {
  const httpExceptionPayload = extractHttpExceptionPayload(error);
  if (httpExceptionPayload) {
    return httpExceptionPayload;
  }

  const providerPayload = extractProviderPayload(request);
  if (providerPayload) {
    return providerPayload;
  }

  const objectPayload = extractRecordPayload(error);
  if (objectPayload) {
    return objectPayload;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return {
      errorCode: GlobalErrorCode.UNAUTHORIZED,
      message: error.message,
    };
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return {
      errorCode: GlobalErrorCode.UNAUTHORIZED,
      message: error,
    };
  }

  return {
    errorCode: GlobalErrorCode.UNAUTHORIZED,
    message: GlobalErrorMessage[GlobalErrorCode.UNAUTHORIZED],
  };
}

function extractHttpExceptionPayload(error: unknown): OAuthErrorPayload | null {
  if (!(error instanceof HttpException)) {
    return null;
  }

  const response = error.getResponse();
  if (typeof response === 'string' && response.trim().length > 0) {
    return {
      errorCode: GlobalErrorCode.UNAUTHORIZED,
      message: response,
    };
  }

  return extractRecordPayload(response);
}

function extractProviderPayload(
  request?: Pick<Request, 'query'>,
): OAuthErrorPayload | null {
  const errorCode = getQueryStringValue(request?.query?.error);
  const message =
    getQueryStringValue(request?.query?.error_description) ??
    getQueryStringValue(request?.query?.message);

  if (!errorCode && !message) {
    return null;
  }

  return {
    errorCode: errorCode ?? GlobalErrorCode.UNAUTHORIZED,
    message: message ?? GlobalErrorMessage[GlobalErrorCode.UNAUTHORIZED],
  };
}

function extractRecordPayload(value: unknown): OAuthErrorPayload | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const errorCode =
    getStringValue(record.errorCode) ??
    getStringValue(record.code) ??
    extractNestedStringValue(record.error, 'errorCode') ??
    extractNestedStringValue(record.error, 'code');
  const message =
    getStringValue(record.message) ??
    extractNestedStringValue(record.error, 'message');

  if (!errorCode && !message) {
    return null;
  }

  return {
    errorCode: errorCode ?? GlobalErrorCode.UNAUTHORIZED,
    message: message ?? GlobalErrorMessage[GlobalErrorCode.UNAUTHORIZED],
  };
}

function extractNestedStringValue(
  value: unknown,
  key: string,
): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return getStringValue((value as Record<string, unknown>)[key]);
}

function getQueryStringValue(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return getStringValue(value[0]);
  }

  return getStringValue(value);
}

function getStringValue(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}
