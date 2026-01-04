import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthInvalidOAuthCodeException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.INVALID_OAUTH_CODE,
        AuthErrorMessage[AuthErrorCode.INVALID_OAUTH_CODE],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
