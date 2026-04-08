import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthPasswordResetNotVerifiedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.PASSWORD_RESET_NOT_VERIFIED,
        AuthErrorMessage[AuthErrorCode.PASSWORD_RESET_NOT_VERIFIED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
