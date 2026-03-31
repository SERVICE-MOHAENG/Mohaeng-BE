import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode, BlogErrorMessage } from './code';

/**
 * 여행 완료되지 않은 로드맵으로 블로그를 생성할 때 발생하는 예외
 */
export class BlogRoadmapNotCompletedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.BLOG_ROADMAP_NOT_COMPLETED,
        BlogErrorMessage[BlogErrorCode.BLOG_ROADMAP_NOT_COMPLETED],
      ),
      HttpStatus.BAD_REQUEST,
    );
  }
}
