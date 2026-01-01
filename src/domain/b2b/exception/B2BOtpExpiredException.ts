import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BOtpExpiredException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.OTP_EXPIRED,
        B2BErrorMessage[B2BErrorCode.OTP_EXPIRED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
