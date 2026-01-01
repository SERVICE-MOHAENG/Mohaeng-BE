import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BOrderCannotRefundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.B2B_ORDER_CANNOT_REFUND,
        B2BErrorMessage[B2BErrorCode.B2B_ORDER_CANNOT_REFUND],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
