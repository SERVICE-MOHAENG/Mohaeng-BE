import { InternalServerErrorException } from '@nestjs/common';
import { ApiResponseDto } from '../dto/ApiResponseDto';
import { GlobalErrorCode, GlobalErrorMessage } from './code';

export class GlobalDatabaseErrorException extends InternalServerErrorException {
  constructor() {
    super(
      ApiResponseDto.error(
        GlobalErrorCode.DATABASE_ERROR,
        GlobalErrorMessage[GlobalErrorCode.DATABASE_ERROR],
      ),
    );
  }
}
