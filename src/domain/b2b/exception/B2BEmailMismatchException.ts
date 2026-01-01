import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BEmailMismatchException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.EMAIL_MISMATCH,
        B2BErrorMessage[B2BErrorCode.EMAIL_MISMATCH],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
