import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode, BlogErrorMessage } from './code';

/**
 * 여행 블로그를 찾을 수 없을 때 발생하는 예외
 */
export class BlogNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.BLOG_NOT_FOUND,
        BlogErrorMessage[BlogErrorCode.BLOG_NOT_FOUND],
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
