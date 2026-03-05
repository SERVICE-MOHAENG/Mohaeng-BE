import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 여행 일정(day)을 찾을 수 없을 때 발생하는 예외
 */
export class CourseDayNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_DAY_NOT_FOUND,
        CourseErrorMessage[CourseErrorCode.COURSE_DAY_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
