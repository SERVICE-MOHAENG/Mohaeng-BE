import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BSignupAlreadyRejectedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.SIGNUP_ALREADY_REJECTED,
        B2BErrorMessage[B2BErrorCode.SIGNUP_ALREADY_REJECTED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
