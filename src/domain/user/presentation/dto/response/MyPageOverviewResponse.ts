import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from '../../../../course/presentation/dto/response/CourseResponse';
import { BlogResponse } from '../../../../blog/presentation/dto/response/BlogResponse';
import { MyLikesResponse } from './MyLikesResponse';

export class MyPageProfileResponse {
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '이메일' })
  email: string;

  @ApiProperty({ description: '프로필 이미지', nullable: true })
  profileImage: string | null;
}

export class MyPageStatsResponse {
  @ApiProperty({ description: '총 여행 횟수' })
  totalTrips: number;

  @ApiProperty({ description: '방문한 국가 수' })
  visitedCountries: number;

  @ApiProperty({ description: '작성한 여행 기록 수' })
  writtenBlogs: number;

  @ApiProperty({ description: '찜한 예정지 수' })
  likedRegions: number;
}

export class MyRoadmapsSectionResponse {
  @ApiProperty({ description: '내 로드맵 목록', type: [CourseResponse] })
  items: CourseResponse[];

  @ApiProperty({ description: '전체 내 로드맵 수' })
  total: number;
}

export class MyBlogsSectionResponse {
  @ApiProperty({ description: '내 블로그 목록', type: [BlogResponse] })
  items: BlogResponse[];

  @ApiProperty({ description: '전체 내 블로그 수' })
  total: number;
}

export class MyPageOverviewResponse {
  @ApiProperty({ description: '프로필 정보', type: MyPageProfileResponse })
  profile: MyPageProfileResponse;

  @ApiProperty({ description: '요약 통계', type: MyPageStatsResponse })
  stats: MyPageStatsResponse;

  @ApiProperty({ description: '내 로드맵 섹션', type: MyRoadmapsSectionResponse })
  myRoadmaps: MyRoadmapsSectionResponse;

  @ApiProperty({ description: '내 블로그 섹션', type: MyBlogsSectionResponse })
  myBlogs: MyBlogsSectionResponse;

  @ApiProperty({ description: '통합 찜 목록 섹션', type: MyLikesResponse })
  likes: MyLikesResponse;
}
