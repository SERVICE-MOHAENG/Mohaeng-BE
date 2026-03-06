import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 재정렬 요청의 장소 ID가 해당 day의 장소 목록과 일치하지 않을 때 발생하는 예외
 */
export class InvalidPlaceIdsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.INVALID_PLACE_IDS,
        CourseErrorMessage[CourseErrorCode.INVALID_PLACE_IDS],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
