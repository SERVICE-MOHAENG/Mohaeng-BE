import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { UserErrorCode, UserErrorMessage } from './code';

export class UserNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        UserErrorCode.USER_NOT_FOUND,
        UserErrorMessage[UserErrorCode.USER_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
