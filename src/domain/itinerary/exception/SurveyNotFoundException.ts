import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

export class SurveyNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.SURVEY_NOT_FOUND,
        '설문을 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
