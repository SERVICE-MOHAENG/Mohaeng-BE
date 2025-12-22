import { UnauthorizedException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalMissingTokenException extends UnauthorizedException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.MISSING_TOKEN,
        GlobalErrorMessage[GlobalErrorCode.MISSING_TOKEN],
      ),
    );
  }
}
