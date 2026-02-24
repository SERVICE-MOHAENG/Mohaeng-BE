import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { AdminErrorCode, AdminErrorMessage } from './code';

export class AdminInvalidRefreshTokenException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        AdminErrorCode.INVALID_REFRESH_TOKEN,
        AdminErrorMessage[AdminErrorCode.INVALID_REFRESH_TOKEN],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
