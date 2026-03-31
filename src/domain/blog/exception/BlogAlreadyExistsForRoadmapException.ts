import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode, BlogErrorMessage } from './code';

/**
 * 선택한 로드맵에 이미 블로그가 존재할 때 발생하는 예외
 */
export class BlogAlreadyExistsForRoadmapException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.BLOG_ALREADY_EXISTS_FOR_ROADMAP,
        BlogErrorMessage[BlogErrorCode.BLOG_ALREADY_EXISTS_FOR_ROADMAP],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
