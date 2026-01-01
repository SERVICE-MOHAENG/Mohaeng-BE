import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BEmailAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.EMAIL_ALREADY_EXISTS,
        B2BErrorMessage[B2BErrorCode.EMAIL_ALREADY_EXISTS],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
