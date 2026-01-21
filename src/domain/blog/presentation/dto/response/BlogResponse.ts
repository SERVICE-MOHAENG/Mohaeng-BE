import { ApiProperty } from '@nestjs/swagger';
import { TravelBlog } from '../../../entity/TravelBlog.entity';

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

  @ApiProperty({ description: '공개 여부' })
  isPublic: boolean;

  @ApiProperty({ description: '조회수' })
  viewCount: number;

  @ApiProperty({ description: '좋아요 수' })
  likeCount: number;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ description: '작성자 ID', required: false })
  userId?: string;

  @ApiProperty({ description: '작성자 닉네임', required: false })
  userName?: string;

  /**
   * Entity를 Response DTO로 변환 (기본)
   */
  static fromEntity(entity: TravelBlog): BlogResponse {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      imageUrl: entity.imageUrl,
      isPublic: entity.isPublic,
      viewCount: entity.viewCount,
      likeCount: entity.likeCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Entity를 Response DTO로 변환 (작성자 정보 포함)
   */
  static fromEntityWithUser(entity: TravelBlog): BlogResponse {
    return {
      id: entity.id,
      title: entity.title,
      content: entity.content,
      imageUrl: entity.imageUrl,
      isPublic: entity.isPublic,
      viewCount: entity.viewCount,
      likeCount: entity.likeCount,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      userId: entity.user?.id,
      userName: entity.user?.name,
    };
  }
}
