import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthEmailOtpCooldownException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_OTP_COOLDOWN,
        AuthErrorMessage[AuthErrorCode.EMAIL_OTP_COOLDOWN],
      ),
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
