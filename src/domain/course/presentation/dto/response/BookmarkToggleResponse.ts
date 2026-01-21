import { ApiProperty } from '@nestjs/swagger';

/**
 * BookmarkToggleResponse DTO
 * @description
 * - 북마크 토글 응답
 */
export class BookmarkToggleResponse {
  @ApiProperty({ description: '북마크 상태 (true: 북마크됨, false: 북마크 취소됨)' })
  bookmarked: boolean;

  @ApiProperty({ description: '응답 메시지' })
  message: string;

  static of(bookmarked: boolean): BookmarkToggleResponse {
    const response = new BookmarkToggleResponse();
    response.bookmarked = bookmarked;
    response.message = bookmarked
      ? '북마크가 추가되었습니다.'
      : '북마크가 취소되었습니다.';
    return response;
  }
}
