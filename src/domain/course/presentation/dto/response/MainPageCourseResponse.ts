import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../entity/TravelCourse.entity';

export class MainPageCourseResponse {
  @ApiProperty({ description: '코스 ID' })
  id: string;

  @ApiProperty({ description: '코스 제목' })
  title: string;

  @ApiProperty({ description: '여행 시작 날짜 (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({ description: '여행 종료 날짜 (YYYY-MM-DD)' })
  end_date: string;

  @ApiProperty({ description: '태그 목록', type: [String] })
  tags: string[];

  @ApiProperty({ description: '좋아요 수' })
  like_count: number;

  @ApiProperty({ description: '현재 사용자의 좋아요 여부' })
  is_liked: boolean;

  static fromEntity(
    course: TravelCourse,
    isLiked: boolean = false,
  ): MainPageCourseResponse {
    const response = new MainPageCourseResponse();
    response.id = course.id;
    response.title = course.title;
    response.start_date = MainPageCourseResponse.formatDate(
      course.travelStartDay,
    );
    response.end_date = MainPageCourseResponse.formatDate(
      course.travelFinishDay,
    );
    response.tags = (course.hashTags || []).map((tag) =>
      tag.tagName.startsWith('#') ? tag.tagName.slice(1) : tag.tagName,
    );
    response.like_count = course.likeCount;
    response.is_liked = isLiked;
    return response;
  }

  private static formatDate(date: Date | string): string {
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
