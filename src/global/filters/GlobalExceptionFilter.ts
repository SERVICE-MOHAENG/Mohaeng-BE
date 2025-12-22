import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseDto } from '../dto/ApiResponseDto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiResponseDto;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        errorResponse = exceptionResponse as ApiResponseDto;
      } else {
        errorResponse = ApiResponseDto.error(
          'INTERNAL_SERVER_ERROR',
          exception.message,
        );
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
      errorResponse = ApiResponseDto.error(
        'INTERNAL_SERVER_ERROR',
        '서버 내부 오류가 발생했습니다.',
      );
    } else {
      this.logger.error('Unknown error occurred', exception);
      errorResponse = ApiResponseDto.error(
        'UNKNOWN_ERROR',
        '알 수 없는 오류가 발생했습니다.',
      );
    }

    response.status(status).json(errorResponse);
  }
}
