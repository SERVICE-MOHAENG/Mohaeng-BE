import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../entity/TravelCourse.entity';

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

  @ApiProperty({ description: '공개 여부' })
  isPublic: boolean;

  @ApiProperty({ description: '생성일시' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  updatedAt: Date;

  @ApiProperty({ description: '현재 사용자의 좋아요 여부', required: false })
  isLiked?: boolean;

  @ApiProperty({ description: '현재 사용자의 북마크 여부', required: false })
  isBookmarked?: boolean;

  /**
   * Entity -> DTO 변환
   */
  static fromEntity(course: TravelCourse): CourseResponse {
    const response = new CourseResponse();
    response.id = course.id;
    response.title = course.title;
    response.description = course.description;
    response.imageUrl = course.imageUrl;
    response.viewCount = course.viewCount;
    response.nights = course.nights;
    response.days = course.days;
    response.likeCount = course.likeCount;
    response.bookmarkCount = course.bookmarkCount;
    response.userId = course.user.id;
    response.userName = course.user.name;
    response.countries = course.courseCountries?.map((cc) => cc.country.name) || [];
    response.hashTags = course.hashTags?.map((ht) => ht.tagName) || [];
    response.isPublic = course.isPublic;
    response.createdAt = course.createdAt;
    response.updatedAt = course.updatedAt;
    return response;
  }

  /**
   * Entity -> DTO 변환 (좋아요/북마크 상태 포함)
   */
  static fromEntityWithUserStatus(
    course: TravelCourse,
    isLiked: boolean,
    isBookmarked: boolean,
  ): CourseResponse {
    const response = CourseResponse.fromEntity(course);
    response.isLiked = isLiked;
    response.isBookmarked = isBookmarked;
    return response;
  }
}
