import { ForbiddenException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalForbiddenException extends ForbiddenException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.FORBIDDEN,
        GlobalErrorMessage[GlobalErrorCode.FORBIDDEN],
      ),
    );
  }
}
