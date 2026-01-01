import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BDuplicateExternalOrderException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.DUPLICATE_EXTERNAL_ORDER,
        B2BErrorMessage[B2BErrorCode.DUPLICATE_EXTERNAL_ORDER],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
