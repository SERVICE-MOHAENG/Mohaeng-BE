import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthMissingRefreshTokenException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.MISSING_REFRESH_TOKEN,
        AuthErrorMessage[AuthErrorCode.MISSING_REFRESH_TOKEN],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
