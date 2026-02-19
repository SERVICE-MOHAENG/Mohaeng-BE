import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode, CourseErrorMessage } from './code';

/**
 * 이미 북마크가 존재할 때 발생하는 예외
 */
export class CourseBookmarkAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_BOOKMARK_ALREADY_EXISTS,
        CourseErrorMessage[CourseErrorCode.COURSE_BOOKMARK_ALREADY_EXISTS],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
