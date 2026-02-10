import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthEmailOtpTooManyRequestsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_OTP_TOO_MANY_REQUESTS,
        AuthErrorMessage[AuthErrorCode.EMAIL_OTP_TOO_MANY_REQUESTS],
      ),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
