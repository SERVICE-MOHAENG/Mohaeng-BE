import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
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
import { TravelBlogService } from '../service/TravelBlogService';
import { BlogLikeService } from '../service/BlogLikeService';
import { GetBlogsRequest } from './dto/request/GetBlogsRequest';
import { CreateBlogRequest } from './dto/request/CreateBlogRequest';
import { UpdateBlogRequest } from './dto/request/UpdateBlogRequest';
import { GetMyBlogsRequest } from './dto/request/GetMyBlogsRequest';
import { BlogsResponse } from './dto/response/BlogsResponse';
import { BlogResponse } from './dto/response/BlogResponse';
import { BlogLikesResponse } from './dto/response/BlogLikesResponse';

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
    @UserId() userId: string,
    @Query() request: GetBlogsRequest,
  ): Promise<BlogsResponse> {
    return this.travelBlogService.getBlogs(
      request.sortBy,
      request.page,
      request.limit,
      userId,
    );
  }

  /**
   * 내 블로그 목록 조회
   * @description
   * - 인증된 사용자의 블로그 목록 조회 (공개/비공개 모두)
   * @param userId - 인증된 사용자 ID
   * @param request - 페이지네이션 요청
   * @returns 블로그 목록
   */
  @Get('me')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 블로그 목록 조회' })
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
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async getMyBlogs(
    @UserId() userId: string,
    @Query() request: GetMyBlogsRequest,
  ): Promise<BlogsResponse> {
    return this.travelBlogService.getMyBlogs(userId, request.page, request.limit);
  }

  /**
   * 내 좋아요 목록 조회
   * @description
   * - 로그인한 사용자가 좋아요한 블로그 목록 조회
   * @param userId - 사용자 ID (자동 주입)
   * @param request - 페이지네이션 요청
   * @returns BlogLikesResponse
   */
  @Get('me/likes')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내 좋아요 목록 조회' })
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
    type: BlogLikesResponse,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getMyLikes(
    @UserId() userId: string,
    @Query() request: GetMyBlogsRequest,
  ): Promise<BlogLikesResponse> {
    const page = request.page ?? 1;
    const limit = request.limit ?? 6;
    const [likes, total] = await this.blogLikeService.getMyLikes(
      userId,
      page,
      limit,
    );
    return BlogLikesResponse.from(likes, total, page, limit);
  }

  /**
   * 블로그 생성
   * @description
   * - 새로운 여행 블로그 생성
   * @param userId - 인증된 사용자 ID
   * @param request - 블로그 생성 요청
   * @returns 생성된 블로그 정보
   */
  @Post()
  @UserApiBearerAuth()
  @ApiOperation({ summary: '블로그 생성' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: BlogResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  async createBlog(
    @UserId() userId: string,
    @Body() request: CreateBlogRequest,
  ): Promise<BlogResponse> {
    const blog = await this.travelBlogService.createBlog(userId, request);
    return BlogResponse.fromEntity(blog);
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
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<BlogResponse> {
    // 조회수 증가 먼저 수행
    await this.travelBlogService.incrementViewCount(id);

    // 증가된 조회수 포함하여 조회
    return this.travelBlogService.findByIdWithUserStatus(id, userId);
  }

  /**
   * 블로그 수정
   * @description
   * - 블로그 수정 (소유권 검증 포함)
   * @param userId - 인증된 사용자 ID
   * @param id - 블로그 ID
   * @param request - 블로그 수정 요청
   * @returns 수정된 블로그 정보
   */
  @Patch(':id')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '블로그 수정' })
  @ApiParam({ name: 'id', description: '블로그 ID' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: BlogResponse,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '블로그를 찾을 수 없음' })
  async updateBlog(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() request: UpdateBlogRequest,
  ): Promise<BlogResponse> {
    const blog = await this.travelBlogService.update(id, userId, request);
    return BlogResponse.fromEntity(blog);
  }

  /**
   * 블로그 삭제
   * @description
   * - 블로그 삭제 (소유권 검증 포함)
   * @param userId - 인증된 사용자 ID
   * @param id - 블로그 ID
   */
  @Delete(':id')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '블로그 삭제' })
  @ApiParam({ name: 'id', description: '블로그 ID' })
  @ApiResponse({ status: 204, description: '삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않음' })
  @ApiResponse({ status: 403, description: '접근 권한 없음' })
  @ApiResponse({ status: 404, description: '블로그를 찾을 수 없음' })
  async deleteBlog(
    @UserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.travelBlogService.delete(id, userId);
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
    @Param('id') id: string,
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
    @Param('id') id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.blogLikeService.removeLike(userId, id);
  }
}
