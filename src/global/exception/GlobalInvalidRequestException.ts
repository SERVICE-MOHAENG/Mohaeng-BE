import { BadRequestException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalInvalidRequestException extends BadRequestException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.INVALID_REQUEST,
        GlobalErrorMessage[GlobalErrorCode.INVALID_REQUEST],
      ),
    );
  }
}
