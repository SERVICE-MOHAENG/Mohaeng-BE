import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AdminErrorCode, AdminErrorMessage } from './code';

export class AdminEmailAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AdminErrorCode.EMAIL_ALREADY_EXISTS,
        AdminErrorMessage[AdminErrorCode.EMAIL_ALREADY_EXISTS],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
