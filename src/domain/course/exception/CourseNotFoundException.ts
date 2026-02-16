import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { CourseErrorCode } from './code/CourseErrorCode';

/**
 * 여행 코스를 찾을 수 없을 때 발생하는 예외
 */
export class CourseNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        CourseErrorCode.COURSE_NOT_FOUND,
        '여행 코스를 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
