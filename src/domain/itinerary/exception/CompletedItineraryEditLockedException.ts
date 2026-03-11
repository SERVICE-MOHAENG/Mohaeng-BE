import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode, ItineraryErrorMessage } from './code';

export class CompletedItineraryEditLockedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.COMPLETED_ITINERARY_EDIT_LOCKED,
        ItineraryErrorMessage[
          ItineraryErrorCode.COMPLETED_ITINERARY_EDIT_LOCKED
        ],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
