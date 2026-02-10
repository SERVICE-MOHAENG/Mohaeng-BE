import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode } from './code';

export class AuthEmailAlreadyRegisteredWithDifferentProviderException extends HttpException {
  constructor(provider: string) {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER,
        `이미 ${provider}로 가입된 이메일입니다`,
      ),
      HttpStatus.CONFLICT,
    );
  }
}
