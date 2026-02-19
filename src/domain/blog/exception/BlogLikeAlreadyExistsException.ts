import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode, BlogErrorMessage } from './code';

/**
 * 이미 좋아요가 존재할 때 발생하는 예외
 */
export class BlogLikeAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.BLOG_LIKE_ALREADY_EXISTS,
        BlogErrorMessage[BlogErrorCode.BLOG_LIKE_ALREADY_EXISTS],
      ),
      HttpStatus.CONFLICT,
    );
  }
}
