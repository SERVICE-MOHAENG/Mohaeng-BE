import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegionService } from '../service/RegionService';
import { GetRegionsByCountryRequest } from './dto/request/GetRegionsByCountryRequest';
import { RegionsResponse } from './dto/response/RegionsResponse';

/**
 * CountryController
 * @description
 * - 나라/도시 관련 HTTP 요청 처리
 */
@ApiTags('countries')
@Controller('v1/countries')
export class CountryController {
  constructor(private readonly regionService: RegionService) {}

  /**
   * 나라 이름으로 도시 목록 조회
   * @description
   * - 나라 이름을 쿼리 파라미터로 받아 해당 나라의 도시 목록 반환
   */
  @Get('regions')
  @ApiOperation({ summary: '나라별 도시 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '도시 목록 조회 성공',
    type: RegionsResponse,
  })
  @ApiResponse({ status: 404, description: '나라를 찾을 수 없음' })
  async getRegionsByCountry(
    @Query() request: GetRegionsByCountryRequest,
  ): Promise<RegionsResponse> {
    const regions = await this.regionService.findByCountryName(request.countryName);
    return RegionsResponse.from(regions);
  }
}
