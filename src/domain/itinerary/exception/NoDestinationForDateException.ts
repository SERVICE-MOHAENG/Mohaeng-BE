import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

export class NoDestinationForDateException extends HttpException {
  constructor(dailyDate: string) {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.NO_DESTINATION_FOR_DATE,
        `날짜 ${dailyDate}에 해당하는 목적지를 찾을 수 없습니다`,
      ),
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
