import { ApiProperty } from '@nestjs/swagger';

/**
 * BlogLikeToggleResponse DTO
 * @description
 * - 블로그 좋아요 토글 응답
 */
export class BlogLikeToggleResponse {
  @ApiProperty({ description: '좋아요 상태 (true: 좋아요됨, false: 좋아요 취소됨)' })
  liked: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  static of(liked: boolean): BlogLikeToggleResponse {
    const response = new BlogLikeToggleResponse();
    response.liked = liked;
    response.message = liked
      ? '좋아요가 추가되었습니다.'
      : '좋아요가 취소되었습니다.';
    return response;
  }
}
