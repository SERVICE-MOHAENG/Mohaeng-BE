import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthInvalidCredentialsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.INVALID_CREDENTIALS,
        AuthErrorMessage[AuthErrorCode.INVALID_CREDENTIALS],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
