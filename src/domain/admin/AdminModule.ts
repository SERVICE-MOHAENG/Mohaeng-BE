import { Module } from '@nestjs/common';
import { CountryModule } from '../country/CountryModule';
import { AdminCountryController } from './presentation/AdminCountryController';
import { AdminRegionController } from './presentation/AdminRegionController';

/**
 * Admin Module
 * @description
 * - 어드민 전용 도메인 모듈
 * - CountryModule에서 CountryService, RegionService를 export하므로 그대로 사용
 */
@Module({
  imports: [CountryModule],
  controllers: [AdminCountryController, AdminRegionController],
})
export class AdminModule {}
