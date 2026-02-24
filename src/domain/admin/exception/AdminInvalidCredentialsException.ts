import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AdminErrorCode, AdminErrorMessage } from './code';

export class AdminInvalidCredentialsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AdminErrorCode.INVALID_CREDENTIALS,
        AdminErrorMessage[AdminErrorCode.INVALID_CREDENTIALS],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
