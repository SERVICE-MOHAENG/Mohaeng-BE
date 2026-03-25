import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthEmailAlreadyRegisteredWithDifferentProviderException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER,
        AuthErrorMessage[
          AuthErrorCode.EMAIL_ALREADY_REGISTERED_WITH_DIFFERENT_PROVIDER
        ],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
