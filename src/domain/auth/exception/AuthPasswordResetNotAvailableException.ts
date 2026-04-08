import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthPasswordResetNotAvailableException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.PASSWORD_RESET_NOT_AVAILABLE,
        AuthErrorMessage[AuthErrorCode.PASSWORD_RESET_NOT_AVAILABLE],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
