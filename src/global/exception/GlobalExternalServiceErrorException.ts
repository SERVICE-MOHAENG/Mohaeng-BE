import { ServiceUnavailableException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalExternalServiceErrorException extends ServiceUnavailableException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.EXTERNAL_SERVICE_ERROR,
        GlobalErrorMessage[GlobalErrorCode.EXTERNAL_SERVICE_ERROR],
      ),
    );
  }
}
