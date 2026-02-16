import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode } from './code/CourseErrorCode';

/**
 * 여행 코스 접근 권한이 없을 때 발생하는 예외
 */
export class CourseAccessDeniedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_ACCESS_DENIED,
        '여행 코스에 대한 권한이 없습니다',
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
