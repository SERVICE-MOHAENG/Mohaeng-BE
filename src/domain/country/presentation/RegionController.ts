import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserApiBearerAuth } from '../../../global/decorators/UserApiBearerAuth';
import { UserId } from '../../../global/decorators/UserId';
import { UuidParam } from '../../../global/decorators/UuidParam';
import { TravelCourseService } from '../../course/service/TravelCourseService';
import { CoursesResponse } from '../../course/presentation/dto/response/CoursesResponse';
import { RegionLikeService } from '../service/RegionLikeService';
import { RegionService } from '../service/RegionService';
import { GetMyLikedRegionsRequest } from './dto/request/GetMyLikedRegionsRequest';
import { GetRegionCoursesRequest } from './dto/request/GetRegionCoursesRequest';
import { RegionLikesResponse } from './dto/response/RegionLikesResponse';
import { LikedRegionResponse } from './dto/response/LikedRegionResponse';

@ApiTags('regions')
@Controller('v1/regions')
export class RegionController {
  constructor(
    private readonly regionLikeService: RegionLikeService,
    private readonly regionService: RegionService,
    private readonly travelCourseService: TravelCourseService,
  ) {}

  @Get('me/likes')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '내가 좋아요한 지역 목록 조회' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: RegionLikesResponse,
  })
  async getMyLikes(
    @UserId() userId: string,
    @Query() request: GetMyLikedRegionsRequest,
  ): Promise<RegionLikesResponse> {
    const page = request.page ?? 1;
    const limit = request.limit ?? 20;
    const [likes, total] = await this.regionLikeService.getMyLikes(
      userId,
      page,
      limit,
    );

    const regionIds = likes.map((like) => like.regionId);
    const likeCounts = await this.regionLikeService.getLikeCounts(regionIds);

    return {
      items: likes.map((like) =>
        LikedRegionResponse.fromRegion(
          like.region,
          likeCounts[like.regionId] ?? 0,
          true,
        ),
      ),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get(':id/courses')
  @UserApiBearerAuth()
  @ApiOperation({ summary: '특정 지역의 공개 로드맵 목록 조회' })
  @ApiParam({ name: 'id', description: '지역 ID' })
  @ApiResponse({ status: 200, description: '조회 성공', type: CoursesResponse })
  async getCoursesByRegion(
    @UuidParam() id: string,
    @UserId() userId: string,
    @Query() request: GetRegionCoursesRequest,
  ): Promise<CoursesResponse> {
    await this.regionService.findById(id);
    return this.travelCourseService.getPublicCoursesByRegion(
      id,
      request.sortBy,
      request.page,
      request.limit,
      userId,
    );
  }

  @Post(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '지역 좋아요 추가' })
  @ApiParam({ name: 'id', description: '지역 ID' })
  @ApiResponse({ status: 201, description: '좋아요 추가 성공' })
  @ApiResponse({ status: 404, description: '지역을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 좋아요한 지역' })
  async addLike(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.regionLikeService.addLike(userId, id);
  }

  @Delete(':id/like')
  @UserApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '지역 좋아요 삭제' })
  @ApiParam({ name: 'id', description: '지역 ID' })
  @ApiResponse({ status: 204, description: '좋아요 삭제 성공' })
  @ApiResponse({ status: 404, description: '지역을 찾을 수 없음' })
  async removeLike(
    @UuidParam() id: string,
    @UserId() userId: string,
  ): Promise<void> {
    await this.regionLikeService.removeLike(userId, id);
  }
}
