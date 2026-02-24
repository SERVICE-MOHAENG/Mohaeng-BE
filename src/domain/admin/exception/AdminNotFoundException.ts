import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AdminErrorCode, AdminErrorMessage } from './code';

export class AdminNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AdminErrorCode.NOT_FOUND,
        AdminErrorMessage[AdminErrorCode.NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
