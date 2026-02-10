import { InternalServerErrorException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalInternalServerErrorException extends InternalServerErrorException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.INTERNAL_SERVER_ERROR,
        GlobalErrorMessage[GlobalErrorCode.INTERNAL_SERVER_ERROR],
      ),
    );
  }
}
