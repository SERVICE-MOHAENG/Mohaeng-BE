import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AdminErrorCode, AdminErrorMessage } from './code';

export class AdminNotActiveException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AdminErrorCode.NOT_ACTIVE,
        AdminErrorMessage[AdminErrorCode.NOT_ACTIVE],
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
