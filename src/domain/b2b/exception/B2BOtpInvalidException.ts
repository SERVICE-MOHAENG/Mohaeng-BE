import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BOtpInvalidException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.OTP_INVALID,
        B2BErrorMessage[B2BErrorCode.OTP_INVALID],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
