import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthKakaoProfileInvalidException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.KAKAO_PROFILE_EMAIL_MISSING,
        AuthErrorMessage[AuthErrorCode.KAKAO_PROFILE_EMAIL_MISSING],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
