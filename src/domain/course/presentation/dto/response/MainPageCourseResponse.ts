import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../entity/TravelCourse.entity';

export class MainPageCourseResponse {
  @ApiProperty({ description: '코스 ID' })
  id: string;

  @ApiProperty({ description: '코스 제목' })
  title: string;

  @ApiProperty({ description: '총 여행 일수' })
  trip_days: number;

  @ApiProperty({ description: '코스 요약', nullable: true })
  summary: string | null;

  @ApiProperty({ description: '태그 목록', type: [String] })
  tags: string[];

  @ApiProperty({ description: '좋아요 수' })
  like_count: number;

  @ApiProperty({ description: '현재 사용자의 좋아요 여부' })
  is_liked: boolean;

  @ApiProperty({ description: '대표 이미지 URL', nullable: true })
  image_url: string | null;

  static fromEntity(
    course: TravelCourse,
    isLiked: boolean = false,
  ): MainPageCourseResponse {
    const response = new MainPageCourseResponse();
    response.id = course.id;
    response.title = course.title;
    response.trip_days = course.days;
    response.summary = course.description ?? null;
    response.tags = (course.hashTags || []).map((tag) =>
      tag.tagName.startsWith('#') ? tag.tagName.slice(1) : tag.tagName,
    );
    response.like_count = course.likeCount;
    response.is_liked = isLiked;
    response.image_url = course.imageUrl ?? null;
    return response;
  }
}
