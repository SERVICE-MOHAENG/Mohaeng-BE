import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode, ItineraryErrorMessage } from './code';

export class SurveyNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.SURVEY_NOT_FOUND,
        ItineraryErrorMessage[ItineraryErrorCode.SURVEY_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
