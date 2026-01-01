import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BDepositAccountNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.DEPOSIT_ACCOUNT_NOT_FOUND,
        B2BErrorMessage[B2BErrorCode.DEPOSIT_ACCOUNT_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
