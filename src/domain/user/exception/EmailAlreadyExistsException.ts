import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { UserErrorCode, UserErrorMessage } from './code';

export class EmailAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        UserErrorCode.EMAIL_ALREADY_EXISTS,
        UserErrorMessage[UserErrorCode.EMAIL_ALREADY_EXISTS],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
