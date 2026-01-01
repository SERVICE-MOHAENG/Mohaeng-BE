import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BInvalidRefreshTokenException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.REFRESH_TOKEN_INVALID,
        B2BErrorMessage[B2BErrorCode.REFRESH_TOKEN_INVALID],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
