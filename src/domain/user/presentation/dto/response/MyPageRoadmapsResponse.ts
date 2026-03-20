import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../../course/entity/TravelCourse.entity';
import { MyPagePaginatedResponse } from './MyPagePaginatedResponse';

export class MyPageRoadmapCardResponse {
  @ApiProperty({ description: '로드맵 ID' })
  id: string;

  @ApiProperty({ description: '로드맵 제목' })
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
  ): MyPageRoadmapCardResponse {
    const response = new MyPageRoadmapCardResponse();
    response.id = course.id;
    response.title = course.title;
    response.start_date = MyPageRoadmapCardResponse.formatDate(
      course.travelStartDay,
    );
    response.end_date = MyPageRoadmapCardResponse.formatDate(
      course.travelFinishDay,
    );
    response.tags =
      course.hashTags?.map((hashTag) =>
        hashTag.tagName.startsWith('#')
          ? hashTag.tagName.slice(1)
          : hashTag.tagName,
      ) ?? [];
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

export class MyPageRoadmapsResponse extends MyPagePaginatedResponse {
  @ApiProperty({
    description: '로드맵 목록',
    type: [MyPageRoadmapCardResponse],
  })
  courses: MyPageRoadmapCardResponse[];

  static from(
    courses: MyPageRoadmapCardResponse[],
    total: number,
    page: number,
    limit: number,
  ): MyPageRoadmapsResponse {
    const response = new MyPageRoadmapsResponse();
    response.courses = courses;
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
