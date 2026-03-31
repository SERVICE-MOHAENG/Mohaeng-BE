import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CountryService } from '../service/CountryService';
import { RegionService } from '../service/RegionService';
import { GetRegionsByCountryRequest } from './dto/request/GetRegionsByCountryRequest';
import { CountriesResponse } from './dto/response/CountriesResponse';
import { RegionsResponse } from './dto/response/RegionsResponse';

/**
 * CountryController
 * @description
 * - 나라/도시 관련 HTTP 요청 처리
 */
@ApiTags('countries')
@Controller('v1/countries')
export class CountryController {
  constructor(
    private readonly countryService: CountryService,
    private readonly regionService: RegionService,
  ) {}

  /**
   * 전체 국가 목록 조회
   * @description
   * - 데이터베이스에 저장된 모든 국가 정보를 이름순으로 반환
   */
  @Get()
  @ApiOperation({ summary: '전체 국가 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '국가 목록 조회 성공',
    type: CountriesResponse,
  })
  async getCountries(): Promise<CountriesResponse> {
    const countries = await this.countryService.findAll();
    return CountriesResponse.from(countries);
  }

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
    const regions = await this.regionService.findByCountryName(
      request.countryName,
    );
    return RegionsResponse.from(regions);
  }
}
