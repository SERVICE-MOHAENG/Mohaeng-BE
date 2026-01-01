import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BVoucherInvalidStateException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.B2B_VOUCHER_INVALID_STATE,
        B2BErrorMessage[B2BErrorCode.B2B_VOUCHER_INVALID_STATE],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
