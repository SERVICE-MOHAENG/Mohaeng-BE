import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { UserErrorCode, UserErrorMessage } from './code';

export class InvalidPasswordException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        UserErrorCode.INVALID_PASSWORD,
        UserErrorMessage[UserErrorCode.INVALID_PASSWORD],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
