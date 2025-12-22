import { NotFoundException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalUserNotFoundException extends NotFoundException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.USER_NOT_FOUND,
        GlobalErrorMessage[GlobalErrorCode.USER_NOT_FOUND],
      ),
    );
  }
}
