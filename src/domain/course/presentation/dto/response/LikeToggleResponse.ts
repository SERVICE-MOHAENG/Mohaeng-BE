import { ApiProperty } from '@nestjs/swagger';

/**
 * LikeToggleResponse DTO
 * @description
 * - 좋아요 토글 응답
 */
export class LikeToggleResponse {
  @ApiProperty({ description: '좋아요 상태 (true: 좋아요됨, false: 좋아요 취소됨)' })
  liked: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  static of(liked: boolean): LikeToggleResponse {
    const response = new LikeToggleResponse();
    response.liked = liked;
    response.message = liked
      ? '좋아요가 추가되었습니다.'
      : '좋아요가 취소되었습니다.';
    return response;
  }
}
