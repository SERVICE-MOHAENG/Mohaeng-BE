import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BAccountDeactivatedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.ACCOUNT_DEACTIVATED,
        B2BErrorMessage[B2BErrorCode.ACCOUNT_DEACTIVATED],
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
