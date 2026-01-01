import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthInvalidRefreshTokenException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
        AuthErrorMessage[AuthErrorCode.INVALID_REFRESH_TOKEN],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
