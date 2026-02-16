import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 좋아요를 찾을 수 없을 때 발생하는 예외
 */
export class CourseLikeNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_LIKE_NOT_FOUND,
        CourseErrorMessage[CourseErrorCode.COURSE_LIKE_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
