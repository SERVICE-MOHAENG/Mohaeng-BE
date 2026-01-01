import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { UserErrorCode, UserErrorMessage } from './code';

export class UserNotActiveException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        UserErrorCode.USER_NOT_ACTIVE,
        UserErrorMessage[UserErrorCode.USER_NOT_ACTIVE],
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
