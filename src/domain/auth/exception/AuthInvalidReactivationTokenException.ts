import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AuthErrorCode, AuthErrorMessage } from './code';

export class AuthInvalidReactivationTokenException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AuthErrorCode.INVALID_REACTIVATION_TOKEN,
        AuthErrorMessage[AuthErrorCode.INVALID_REACTIVATION_TOKEN],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
