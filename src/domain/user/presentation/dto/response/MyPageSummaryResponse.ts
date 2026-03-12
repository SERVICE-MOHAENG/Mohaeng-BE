import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({ description: '여행 일정 생성 횟수' })
  createdRoadmaps: number;

  @ApiProperty({ description: '방문한 국가 수' })
  visitedCountries: number;

  @ApiProperty({ description: '작성한 여행 기록 수' })
  writtenBlogs: number;

  @ApiProperty({ description: '좋아요한 여행지 수' })
  likedRegions: number;
}

export class MyPageSummaryResponse {
  @ApiProperty({ description: '프로필 정보', type: MyPageProfileResponse })
  profile: MyPageProfileResponse;

  @ApiProperty({ description: '상단 요약 통계', type: MyPageStatsResponse })
  stats: MyPageStatsResponse;
}
