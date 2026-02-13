import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 이미 좋아요가 존재할 때 발생하는 예외
 */
export class CourseLikeAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_LIKE_ALREADY_EXISTS,
        CourseErrorMessage[CourseErrorCode.COURSE_LIKE_ALREADY_EXISTS],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
