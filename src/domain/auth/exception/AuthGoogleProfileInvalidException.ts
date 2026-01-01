import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthGoogleProfileInvalidException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.GOOGLE_PROFILE_EMAIL_MISSING,
        AuthErrorMessage[AuthErrorCode.GOOGLE_PROFILE_EMAIL_MISSING],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
