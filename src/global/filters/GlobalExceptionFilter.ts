import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { LogInterceptorService } from '../logger/LogInterceptorService';
import { GlobalDatabaseErrorException } from '../exception/GlobalDatabaseErrorException';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new LogInterceptorService();

  /**
   * 전역 예외를 응답 + 로깅 정책으로 처리
   */
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiResponseDto;

    // TypeORM 에러 감지 (DB 연결 실패, 쿼리 실패 등)
    if (
      exception instanceof QueryFailedError ||
      exception instanceof EntityNotFoundError ||
      exception instanceof TypeORMError
    ) {
      const dbException = new GlobalDatabaseErrorException();
      status = dbException.getStatus();
      errorResponse = dbException.getResponse() as ApiResponseDto;
      //LogInterceptor로 전송
      this.logger.error(
        `[DB ERROR] ${(exception as Error).message}`,
        (exception as Error).stack,
      );
    }
    // Redis 에러 감지 (ioredis의 ReplyError, RedisError 등)
    else if (this.isRedisError(exception)) {
      const dbException = new GlobalDatabaseErrorException();
      status = dbException.getStatus();
      errorResponse = dbException.getResponse() as ApiResponseDto;
      //LogInterceptor로 전송
      this.logger.error(
        `[REDIS ERROR] ${(exception as Error).message}`,
        (exception as Error).stack,
      );
    }
    // HttpException (우리가 명시적으로 던진 예외)
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // ValidationPipe 에러 감지 및 변환
      if (this.isValidationError(exceptionResponse)) {
        errorResponse = this.convertValidationError(exceptionResponse);
        const message = this.extractValidationMessage(exceptionResponse);
        // 클라이언트 전송 데이터 포함하여 로그 기록
        const requestBody = request.body
          ? JSON.stringify(request.body)
          : 'undefined';
        this.logger.warn(
          `[VALIDATION_ERROR] ${request?.method ?? 'UNKNOWN'} ${request?.originalUrl ?? request?.url ?? 'UNKNOWN_URL'} - body: ${requestBody} - ${message}`,
        );
      }
      // 기존 커스텀 예외 처리
      else {
        const isCritical = this.extractCriticalFlag(exceptionResponse);
        const shouldLog =
          status >= HttpStatus.INTERNAL_SERVER_ERROR ||
          (status < HttpStatus.INTERNAL_SERVER_ERROR && isCritical);
        const logMessage = this.buildLogMessage(
          exceptionResponse,
          exception.message,
        );

        //응답이 객체 형태이면 그대로 Response
        if (
          typeof exceptionResponse === 'object' &&
          exceptionResponse !== null
        ) {
          errorResponse = exceptionResponse as ApiResponseDto;
        } else {
          //string 형태이면 객체로 수정
          errorResponse = ApiResponseDto.error(
            'INTERNAL_SERVER_ERROR',
            exception.message,
          );
        }

        if (shouldLog) {
          //status >= 500 → error 레벨로 로그
          if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
            //LogInterceptor로 전송
            this.logger.error(logMessage, exception.stack);
          } else {
            // status < 500 && isCritical === true → warn 레벨로 로그
            this.logger.warn(logMessage);
          }
        }
      }
    }
    // 일반 Error
    else if (exception instanceof Error) {
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
      errorResponse = ApiResponseDto.error(
        'INTERNAL_SERVER_ERROR',
        '서버 내부 오류가 발생했습니다.',
      );
    }
    // 알 수 없는 예외
    else {
      this.logger.error(
        `Unknown error occurred: ${this.formatUnknownException(exception)}`,
      );
      errorResponse = ApiResponseDto.error(
        'UNKNOWN_ERROR',
        '알 수 없는 오류가 발생했습니다.',
      );
    }

    //APIResponseDto 형식의 에러응답 반환
    response.status(status).json(errorResponse);
  }

  /**
   * 예외 응답에서 로그 메시지 구성
   */
  private buildLogMessage(response: unknown, fallback: string): string {
    if (response && typeof response === 'object') {
      const record = response as Record<string, unknown>;
      const code = this.extractErrorCode(record);
      const message = this.extractErrorMessage(record);
      if (code && message) {
        return `[${code}] ${message}`;
      }
      if (code) {
        return `[${code}] ${fallback}`;
      }
      if (message) {
        return message;
      }
    }

    if (typeof response === 'string' && response.length > 0) {
      return response;
    }

    return fallback;
  }

  /**
   * 응답 객체에서 에러 코드 추출
   */
  private extractErrorCode(
    response: Record<string, unknown>,
  ): string | undefined {
    if (typeof response.errorCode === 'string') {
      return response.errorCode;
    }
    if (typeof response.code === 'string') {
      return response.code;
    }
    if (response.error && typeof response.error === 'object') {
      const errorObj = response.error as Record<string, unknown>;
      if (typeof errorObj.errorCode === 'string') {
        return errorObj.errorCode;
      }
      if (typeof errorObj.code === 'string') {
        return errorObj.code;
      }
    }
    return undefined;
  }

  /**
   * 응답 객체에서 에러 메시지 추출
   */
  private extractErrorMessage(
    response: Record<string, unknown>,
  ): string | undefined {
    if (typeof response.message === 'string') {
      return response.message;
    }
    if (response.error && typeof response.error === 'object') {
      const errorObj = response.error as Record<string, unknown>;
      if (typeof errorObj.message === 'string') {
        return errorObj.message;
      }
    }
    return undefined;
  }

  /**
   * 응답 객체에서 critical 플래그 추출
   */
  private extractCriticalFlag(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }
    const record = response as Record<string, unknown>;
    if (typeof record.critical === 'boolean') {
      return record.critical;
    }
    if (record.error && typeof record.error === 'object') {
      const errorObj = record.error as Record<string, unknown>;
      if (typeof errorObj.critical === 'boolean') {
        return errorObj.critical;
      }
    }
    return false;
  }

  private formatUnknownException(exception: unknown): string {
    if (typeof exception === 'string') {
      return exception;
    }
    try {
      return JSON.stringify(exception);
    } catch {
      return String(exception);
    }
  }

  /**
   * Redis 에러인지 확인
   * ioredis의 ReplyError, RedisError 등을 감지
   */
  private isRedisError(exception: unknown): boolean {
    if (!exception || typeof exception !== 'object') {
      return false;
    }

    const constructorName = exception.constructor?.name;
    return (
      constructorName === 'ReplyError' ||
      constructorName === 'RedisError' ||
      constructorName === 'AbortError' ||
      constructorName === 'ParserError' ||
      constructorName === 'ConnectionError'
    );
  }

  /**
   * ValidationPipe 에러인지 확인
   * NestJS ValidationPipe가 던지는 BadRequestException 형식을 감지
   */
  private isValidationError(response: unknown): boolean {
    if (!response || typeof response !== 'object') {
      return false;
    }

    const record = response as Record<string, unknown>;
    return (
      typeof record.statusCode === 'number' &&
      Array.isArray(record.message) &&
      typeof record.error === 'string'
    );
  }

  /**
   * ValidationPipe 에러를 ApiResponseDto 형식으로 변환
   */
  private convertValidationError(response: unknown): ApiResponseDto {
    const record = response as Record<string, unknown>;
    const messages = record.message as string[];

    // 여러 validation 메시지를 하나로 합침
    const combinedMessage = messages.join(', ');

    return ApiResponseDto.error('VALIDATION_ERROR', combinedMessage);
  }

  private extractValidationMessage(response: unknown): string {
    if (!response || typeof response !== 'object') {
      return 'Validation failed';
    }
    const record = response as Record<string, unknown>;
    const messages = record.message as unknown;
    if (Array.isArray(messages)) {
      return messages.join(', ');
    }
    if (typeof messages === 'string') {
      return messages;
    }
    return 'Validation failed';
  }
}
