import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode } from './code/CourseErrorCode';

/**
 * 이미 북마크가 존재할 때 발생하는 예외
 */
export class CourseBookmarkAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.BOOKMARK_ALREADY_EXISTS,
        '이미 북마크한 코스입니다',
      ),
      HttpStatus.CONFLICT,
    );
  }
}
