import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode, ItineraryErrorMessage } from './code';

export class ItineraryJobNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.ITINERARY_JOB_NOT_FOUND,
        ItineraryErrorMessage[ItineraryErrorCode.ITINERARY_JOB_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
