import { ApiProperty } from '@nestjs/swagger';

/**
 * CourseResponse DTO
 * @description
 * - 여행 코스 응답
 */
export class CourseResponse {
  @ApiProperty({ description: '코스 ID' })
  id: string;

  @ApiProperty({ description: '코스 제목' })
  title: string;

  @ApiProperty({ description: '코스 설명', nullable: true })
  description: string | null;

  @ApiProperty({ description: '코스 이미지 URL', nullable: true })
  imageUrl: string | null;

  @ApiProperty({ description: '조회수' })
  viewCount: number;

  @ApiProperty({ description: '숙박 일수 (몇 박)' })
  nights: number;

  @ApiProperty({ description: '여행 일수 (몇 일)' })
  days: number;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '북마크 수' })
  bookmarkCount: number;

  @ApiProperty({ description: '작성자 ID' })
  userId: string;

  @ApiProperty({ description: '작성자 닉네임' })
  userName: string;

  @ApiProperty({ description: '국가 목록', type: [String] })
  countries: string[];

  @ApiProperty({ description: '해시태그 목록', type: [String] })
  hashTags: string[];

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;
}
