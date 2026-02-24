import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AdminErrorCode, AdminErrorMessage } from './code';

export class AdminMissingRefreshTokenException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AdminErrorCode.MISSING_REFRESH_TOKEN,
        AdminErrorMessage[AdminErrorCode.MISSING_REFRESH_TOKEN],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
