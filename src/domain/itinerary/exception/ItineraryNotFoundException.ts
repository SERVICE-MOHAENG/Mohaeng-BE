import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

/**
 * ItineraryNotFoundException
 * @description 로드맵을 찾을 수 없을 때 발생하는 예외
 */
export class ItineraryNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.ITINERARY_NOT_FOUND,
        '로드맵을 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
