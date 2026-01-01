import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BInvalidDepositTransactionException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.INVALID_DEPOSIT_TRANSACTION,
        B2BErrorMessage[B2BErrorCode.INVALID_DEPOSIT_TRANSACTION],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
