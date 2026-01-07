import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthEmailNotVerifiedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.EMAIL_NOT_VERIFIED,
        AuthErrorMessage[AuthErrorCode.EMAIL_NOT_VERIFIED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
