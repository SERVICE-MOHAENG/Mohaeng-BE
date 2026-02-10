import { UnauthorizedException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalInvalidTokenException extends UnauthorizedException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.INVALID_TOKEN,
        GlobalErrorMessage[GlobalErrorCode.INVALID_TOKEN],
      ),
    );
  }
}
