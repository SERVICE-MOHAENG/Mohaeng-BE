import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

export class ItineraryJobNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.JOB_NOT_FOUND,
        '일정 생성 작업을 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
