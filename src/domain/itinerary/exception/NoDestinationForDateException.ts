import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode, ItineraryErrorMessage } from './code';

export class NoDestinationForDateException extends HttpException {
  constructor(dailyDate: string) {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.NO_DESTINATION_FOR_DATE,
        `${ItineraryErrorMessage[ItineraryErrorCode.NO_DESTINATION_FOR_DATE]} (날짜: ${dailyDate})`,
      ),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
