import { ApiProperty } from '@nestjs/swagger';

/**
 * BlogResponse DTO
 * @description
 * - 여행 블로그 응답
 */
export class BlogResponse {
  @ApiProperty({ description: '블로그 ID' })
  id: string;

  @ApiProperty({ description: '블로그 제목' })
  title: string;

  @ApiProperty({ description: '블로그 내용' })
  content: string;

  @ApiProperty({ description: '블로그 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: '조회수' })
  viewCount: number;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '작성자 ID' })
  userId: string;

  @ApiProperty({ description: '작성자 닉네임' })
  userName: string;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;
}
