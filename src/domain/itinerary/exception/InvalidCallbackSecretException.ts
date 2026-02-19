import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode, ItineraryErrorMessage } from './code';

export class InvalidCallbackSecretException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.INVALID_CALLBACK_SECRET,
        ItineraryErrorMessage[ItineraryErrorCode.INVALID_CALLBACK_SECRET],
      ),
      HttpStatus.UNAUTHORIZED,
    );
  }
}
