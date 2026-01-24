import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponseDto } from '../../../global/dto/ApiResponseDto';
import { BlogErrorCode } from './code/BlogErrorCode';

/**
 * 좋아요를 찾을 수 없을 때 발생하는 예외
 */
export class BlogLikeNotFoundException extends HttpException {
  constructor() {
    super(
      ApiResponseDto.error(
        BlogErrorCode.LIKE_NOT_FOUND,
        '좋아요를 찾을 수 없습니다',
      ),
      HttpStatus.NOT_FOUND,
    );
  }
}
