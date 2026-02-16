import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode } from './code/CourseErrorCode';

/**
 * 여행 날짜 범위가 유효하지 않을 때 발생하는 예외
 */
export class InvalidDateRangeException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.INVALID_DATE_RANGE,
        '여행 시작일은 종료일보다 이전이어야 합니다',
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
