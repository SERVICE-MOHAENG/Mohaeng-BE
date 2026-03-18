import { Body, Controller, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminApiBearerAuth } from '../../../global/decorators/AdminApiBearerAuth';
import { UuidParam } from '../../../global/decorators/UuidParam';
import { RegionService } from '../../country/service/RegionService';
import { UpdateImageUrlRequest } from './dto/request/UpdateImageUrlRequest';
import { RegionImageResponse } from './dto/response/RegionImageResponse';

/**
 * Admin Region Controller
 * @description
 * - 어드민 전용 도시/지역 관리 API
 */
@ApiTags('admin/regions')
@Controller('v1/admin/regions')
export class AdminRegionController {
  constructor(private readonly regionService: RegionService) {}

  @Patch(':id/image')
  @AdminApiBearerAuth()
  @ApiOperation({ summary: '도시 이미지 URL 업데이트 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '이미지 URL 업데이트 성공',
    type: RegionImageResponse,
  })
  @ApiResponse({ status: 404, description: '도시를 찾을 수 없음' })
  async updateRegionImage(
    @UuidParam() id: string,
    @Body() request: UpdateImageUrlRequest,
  ): Promise<RegionImageResponse> {
    const region = await this.regionService.updateImageUrl(
      id,
      request.imageUrl,
    );
    return RegionImageResponse.from(region);
  }
}
