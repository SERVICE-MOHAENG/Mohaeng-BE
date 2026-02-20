import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { PreferenceErrorCode, PreferenceErrorMessage } from './code';

export class MissingCallbackDataException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        PreferenceErrorCode.MISSING_CALLBACK_DATA,
        PreferenceErrorMessage[PreferenceErrorCode.MISSING_CALLBACK_DATA],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class MissingCallbackErrorException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        PreferenceErrorCode.MISSING_CALLBACK_ERROR,
        PreferenceErrorMessage[PreferenceErrorCode.MISSING_CALLBACK_ERROR],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
