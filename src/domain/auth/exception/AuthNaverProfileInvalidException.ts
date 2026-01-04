import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthNaverProfileInvalidException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.NAVER_PROFILE_EMAIL_MISSING,
        AuthErrorMessage[AuthErrorCode.NAVER_PROFILE_EMAIL_MISSING],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
