import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BSignupAlreadyPendingException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.SIGNUP_ALREADY_PENDING,
        B2BErrorMessage[B2BErrorCode.SIGNUP_ALREADY_PENDING],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
