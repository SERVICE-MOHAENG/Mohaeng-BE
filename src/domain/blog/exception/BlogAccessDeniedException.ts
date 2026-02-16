import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode } from './code/BlogErrorCode';

/**
 * 블로그 접근 권한이 없을 때 발생하는 예외
 */
export class BlogAccessDeniedException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.BLOG_ACCESS_DENIED,
        '블로그에 접근할 권한이 없습니다',
      ),
      HttpStatus.FORBIDDEN,
    );
  }
}
