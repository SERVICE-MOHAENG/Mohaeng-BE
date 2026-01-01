import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BRootUserCannotBeModifiedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.ROOT_USER_CANNOT_BE_MODIFIED,
        B2BErrorMessage[B2BErrorCode.ROOT_USER_CANNOT_BE_MODIFIED],
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
