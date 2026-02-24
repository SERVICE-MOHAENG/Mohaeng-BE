import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminApiBearerAuth } from '../../../global/decorators/AdminApiBearerAuth';
import { CountryService } from '../../country/service/CountryService';
import { UpdateImageUrlRequest } from './dto/request/UpdateImageUrlRequest';
import { CountryImageResponse } from './dto/response/CountryImageResponse';

/**
 * Admin Country Controller
 * @description
 * - 어드민 전용 국가 관리 API
 */
@ApiTags('admin/countries')
@Controller('v1/admin/countries')
export class AdminCountryController {
  constructor(private readonly countryService: CountryService) {}

  @Patch(':id/image')
  @AdminApiBearerAuth()
  @ApiOperation({ summary: '국가 이미지 URL 업데이트 (관리자)' })
  @ApiResponse({
    status: 200,
    description: '이미지 URL 업데이트 성공',
    type: CountryImageResponse,
  })
  @ApiResponse({ status: 404, description: '국가를 찾을 수 없음' })
  async updateCountryImage(
    @Param('id') id: string,
    @Body() request: UpdateImageUrlRequest,
  ): Promise<CountryImageResponse> {
    const country = await this.countryService.updateImageUrl(id, request.imageUrl);
    return CountryImageResponse.from(country);
  }
}
