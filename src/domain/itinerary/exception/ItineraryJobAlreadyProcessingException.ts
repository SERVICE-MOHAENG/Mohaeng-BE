import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

export class ItineraryJobAlreadyProcessingException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.JOB_ALREADY_PROCESSING,
        '이미 처리 중인 일정 생성 작업이 있습니다',
      ),
      HttpStatus.CONFLICT,
    );
  }
}
