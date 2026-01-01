import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BInsufficientPermissionException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.INSUFFICIENT_PERMISSION,
        B2BErrorMessage[B2BErrorCode.INSUFFICIENT_PERMISSION],
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
