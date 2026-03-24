import { ApiProperty } from '@nestjs/swagger';
import { TravelCourse } from '../../../../course/entity/TravelCourse.entity';
import { RoadmapCardResponse } from '../../../../course/presentation/dto/response/RoadmapListResponse';

export enum MyRoadmapStatus {
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
}

export class MyRoadmapCardResponse extends RoadmapCardResponse {
  @ApiProperty({
    description: '여행 일정 상태',
    enum: MyRoadmapStatus,
    example: MyRoadmapStatus.COMPLETED,
  })
  status: MyRoadmapStatus;

  static fromEntity(
    course: TravelCourse,
    isLiked: boolean = false,
  ): MyRoadmapCardResponse {
    const response = Object.assign(
      new MyRoadmapCardResponse(),
      RoadmapCardResponse.fromEntity(course, isLiked),
    );

    response.status = course.isCompleted
      ? MyRoadmapStatus.COMPLETED
      : MyRoadmapStatus.INCOMPLETE;

    return response;
  }
}

export class MyRoadmapListResponse {
  @ApiProperty({
    description: '내 여행 일정 목록',
    type: [MyRoadmapCardResponse],
  })
  courses: MyRoadmapCardResponse[];

  @ApiProperty({ description: '현재 페이지' })
  page: number;

  @ApiProperty({ description: '페이지 크기' })
  limit: number;

  @ApiProperty({ description: '전체 개수' })
  total: number;

  @ApiProperty({ description: '전체 페이지 수' })
  totalPages: number;

  static from(
    courses: TravelCourse[],
    total: number,
    page: number,
    limit: number,
    likedCourseIds: Set<string> = new Set<string>(),
  ): MyRoadmapListResponse {
    const response = new MyRoadmapListResponse();
    response.courses = courses.map((course) =>
      MyRoadmapCardResponse.fromEntity(course, likedCourseIds.has(course.id)),
    );
    response.page = page;
    response.limit = limit;
    response.total = total;
    response.totalPages = Math.ceil(total / limit);
    return response;
  }
}
