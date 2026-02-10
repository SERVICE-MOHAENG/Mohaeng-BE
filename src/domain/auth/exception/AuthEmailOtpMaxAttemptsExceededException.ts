import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthEmailOtpMaxAttemptsExceededException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_OTP_MAX_ATTEMPTS_EXCEEDED,
        AuthErrorMessage[AuthErrorCode.EMAIL_OTP_MAX_ATTEMPTS_EXCEEDED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
