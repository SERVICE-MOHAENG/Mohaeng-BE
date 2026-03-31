import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UuidParam } from '../../../global/decorators/UuidParam';
import { TravelBlogService } from '../service/TravelBlogService';
import { BlogLikeService } from '../service/BlogLikeService';
import { GetBlogsRequest } from './dto/request/GetBlogsRequest';
import { BlogsResponse } from './dto/response/BlogsResponse';
import { BlogResponse } from './dto/response/BlogResponse';
import { CreateBlogRequest } from './dto/request/CreateBlogRequest';

/**
 * TravelBlogController
 * @description
 * - 여행 블로그 관련 HTTP 요청 처리
 */
@ApiTags('blogs')
@Controller('v1/blogs')
export class TravelBlogController {
  constructor(
    private readonly travelBlogService: TravelBlogService,
    private readonly blogLikeService: BlogLikeService,
  ) {}

  @Post()
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '여행 블로그 생성' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: BlogResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '선택한 로드맵에 대한 권한이 없음' })
  @ApiResponse({ status: 404, description: '로드맵을 찾을 수 없음' })
  @ApiResponse({
    status: 409,
    description: '선택한 로드맵에 이미 블로그가 존재함',
  })
  async createBlog(
    @UserId() userId: string,
    @Body() request: CreateBlogRequest,
  ): Promise<BlogResponse> {
    const blog = await this.travelBlogService.createBlog(userId, request);
    return BlogResponse.fromEntityWithUser(blog);
  }

  /**
   * 여행 블로그 목록 조회 (메인페이지용)
   * @description
   * - 정렬 기준에 따라 공개 블로그 조회
   * - latest: 최신순, popular: 인기순
   * @param request - 조회 요청 (정렬 기준, 페이지네이션)
   * @returns BlogsResponse
  */
  @Get('mainpage')
  @UserApiBearerAuth()
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
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async getMainpageBlogs(
    @Query() request: GetBlogsRequest,
    @UserId() userId: string,
  ): Promise<BlogsResponse> {
    return this.travelBlogService.getBlogs(
      request.sortBy,
      request.page,
      request.limit,
      userId,
    );
  }

  /**
   * 블로그 상세 조회
   * @description
   * - 블로그 ID로 상세 조회 (조회수 증가)
   * - 공개 블로그는 로그인한 사용자 모두 조회 가능
   * - 비공개 블로그는 소유자만 조회 가능
   * - 좋아요 상태 포함
   * @param id - 블로그 ID
   * @param userId - 인증된 사용자 ID
   * @returns 블로그 상세 정보
   */
  @Get(':id')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '블로그 상세 조회' })
  @ApiParam({ name: 'id', description: '블로그 ID' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: BlogResponse,
  })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '블로그를 찾을 수 없음' })
  async getBlogById(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<BlogResponse> {
    // 조회수 증가 먼저 수행
    await this.travelBlogService.incrementViewCount(id);

    // 증가된 조회수 포함하여 조회
    return this.travelBlogService.findByIdWithUserStatus(id, userId);
  }

  /**
   * 블로그 좋아요 추가
   * @description
   * - 좋아요 추가 (이미 존재하면 409 Conflict)
   * @param id - 블로그 ID
   * @param userId - 사용자 ID (자동 주입)
   */
  @Post(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '블로그 좋아요 추가' })
  @ApiParam({
    name: 'id',
    description: '블로그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 201, description: '좋아요 추가 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '블로그를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 좋아요한 블로그' })
  async addLike(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.blogLikeService.addLike(userId, id);
  }

  /**
   * 블로그 좋아요 삭제
   * @description
   * - 좋아요 삭제 (멱등성 보장: 없어도 204 반환)
   * @param id - 블로그 ID
   * @param userId - 사용자 ID (자동 주입)
   */
  @Delete(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '블로그 좋아요 삭제' })
  @ApiParam({
    name: 'id',
    description: '블로그 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 204, description: '좋아요 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  @ApiResponse({ status: 404, description: '블로그를 찾을 수 없음' })
  async removeLike(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.blogLikeService.removeLike(userId, id);
  }
}
