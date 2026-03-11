import { ApiProperty } from '@nestjs/swagger';
import { CourseResponse } from '../../../../course/presentation/dto/response/CourseResponse';
import { BlogResponse } from '../../../../blog/presentation/dto/response/BlogResponse';
import { LikedRegionResponse } from '../../../../country/presentation/dto/response/LikedRegionResponse';

export class MyLikedCoursesSectionResponse {
  @ApiProperty({ description: '좋아요한 로드맵 목록', type: [CourseResponse] })
  items: CourseResponse[];

  @ApiProperty({ description: '전체 좋아요한 로드맵 수' })
  total: number;
}

export class MyLikedBlogsSectionResponse {
  @ApiProperty({ description: '좋아요한 블로그 목록', type: [BlogResponse] })
  items: BlogResponse[];

  @ApiProperty({ description: '전체 좋아요한 블로그 수' })
  total: number;
}

export class MyLikedRegionsSectionResponse {
  @ApiProperty({
    description: '좋아요한 지역 목록',
    type: [LikedRegionResponse],
  })
  items: LikedRegionResponse[];

  @ApiProperty({ description: '전체 좋아요한 지역 수' })
  total: number;
}

export class MyLikesResponse {
  @ApiProperty({
    description: '좋아요한 로드맵 섹션',
    type: MyLikedCoursesSectionResponse,
  })
  likedCourses: MyLikedCoursesSectionResponse;

  @ApiProperty({
    description: '좋아요한 블로그 섹션',
    type: MyLikedBlogsSectionResponse,
  })
  likedBlogs: MyLikedBlogsSectionResponse;

  @ApiProperty({
    description: '좋아요한 지역 섹션',
    type: MyLikedRegionsSectionResponse,
  })
  likedRegions: MyLikedRegionsSectionResponse;
}
