import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { UserErrorCode, UserErrorMessage } from './code';

export class PasswordMismatchException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        UserErrorCode.PASSWORD_MISMATCH,
        UserErrorMessage[UserErrorCode.PASSWORD_MISMATCH],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
