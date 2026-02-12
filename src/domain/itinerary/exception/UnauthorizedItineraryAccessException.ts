import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { ItineraryErrorCode } from './code/ItineraryErrorCode';

/**
 * UnauthorizedItineraryAccessException
 * @description 로드맵에 대한 접근 권한이 없을 때 발생하는 예외
 */
export class UnauthorizedItineraryAccessException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        ItineraryErrorCode.UNAUTHORIZED_ITINERARY_ACCESS,
        '이 로드맵에 접근할 권한이 없습니다',
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
