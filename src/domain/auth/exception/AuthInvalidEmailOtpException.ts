import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthInvalidEmailOtpException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_OTP_INVALID,
        AuthErrorMessage[AuthErrorCode.EMAIL_OTP_INVALID],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
