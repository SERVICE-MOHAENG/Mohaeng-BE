import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { TravelBlogService } from '../service/TravelBlogService';
import { GetBlogsRequest } from './dto/request/GetBlogsRequest';
import { BlogsResponse } from './dto/response/BlogsResponse';

/**
 * TravelBlogController
 * @description
 * - 여행 블로그 관련 HTTP 요청 처리
 */
@ApiTags('blogs')
@Controller('v1/blogs')
export class TravelBlogController {
  constructor(private readonly travelBlogService: TravelBlogService) {}

  /**
   * 여행 블로그 목록 조회 (메인페이지용)
   * @description
   * - 정렬 기준에 따라 공개 블로그 조회
   * - latest: 최신순, popular: 인기순
   * @param request - 조회 요청 (정렬 기준, 페이지네이션)
   * @returns BlogsResponse
   */
  @Get('mainpage')
  @ApiOperation({ summary: '여행 블로그 목록 조회 (메인페이지)' })
  @ApiQuery({
    name: 'sortBy',
    description: '정렬 기준 (latest: 최신순, popular: 인기순)',
    required: false,
    example: 'latest',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: '페이지 크기',
    required: false,
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: BlogsResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async getMainpageBlogs(@Query() request: GetBlogsRequest): Promise<BlogsResponse> {
    return this.travelBlogService.getBlogs(
      request.sortBy,
      request.page,
      request.limit,
    );
  }
}
