import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode } from './code/BlogErrorCode';

/**
 * 이미 좋아요가 존재할 때 발생하는 예외
 */
export class BlogLikeAlreadyExistsException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.LIKE_ALREADY_EXISTS,
        '이미 좋아요한 블로그입니다',
      ),
      HttpStatus.CONFLICT,
    );
  }
}
