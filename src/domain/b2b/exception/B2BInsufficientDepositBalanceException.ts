import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BInsufficientDepositBalanceException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.INSUFFICIENT_DEPOSIT_BALANCE,
        B2BErrorMessage[B2BErrorCode.INSUFFICIENT_DEPOSIT_BALANCE],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
