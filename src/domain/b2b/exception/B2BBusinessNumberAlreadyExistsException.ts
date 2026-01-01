import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { B2BErrorCode, B2BErrorMessage } from './code';

export class B2BBusinessNumberAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        B2BErrorCode.BUSINESS_NUMBER_ALREADY_EXISTS,
        B2BErrorMessage[B2BErrorCode.BUSINESS_NUMBER_ALREADY_EXISTS],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
