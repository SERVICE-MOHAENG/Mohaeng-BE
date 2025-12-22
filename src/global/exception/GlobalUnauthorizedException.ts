import { UnauthorizedException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalUnauthorizedException extends UnauthorizedException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.UNAUTHORIZED,
        GlobalErrorMessage[GlobalErrorCode.UNAUTHORIZED],
      ),
    );
  }
}
