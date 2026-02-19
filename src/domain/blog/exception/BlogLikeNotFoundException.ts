import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode, BlogErrorMessage } from './code';

/**
 * 좋아요를 찾을 수 없을 때 발생하는 예외
 */
export class BlogLikeNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.BLOG_LIKE_NOT_FOUND,
        BlogErrorMessage[BlogErrorCode.BLOG_LIKE_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
