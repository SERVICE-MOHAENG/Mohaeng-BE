import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 여행 날짜 범위가 유효하지 않을 때 발생하는 예외
 */
export class InvalidDateRangeException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.INVALID_DATE_RANGE,
        CourseErrorMessage[CourseErrorCode.INVALID_DATE_RANGE],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
