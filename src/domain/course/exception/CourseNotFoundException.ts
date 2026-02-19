import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 여행 코스를 찾을 수 없을 때 발생하는 예외
 */
export class CourseNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_NOT_FOUND,
        CourseErrorMessage[CourseErrorCode.COURSE_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
