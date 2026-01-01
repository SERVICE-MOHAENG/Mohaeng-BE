import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BOrderCannotCancelException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.B2B_ORDER_CANNOT_CANCEL,
        B2BErrorMessage[B2BErrorCode.B2B_ORDER_CANNOT_CANCEL],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
