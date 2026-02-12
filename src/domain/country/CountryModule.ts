import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entity/Country.entity';
import { Region } from './entity/Region.entity';
import { Place } from '../place/entity/Place.entity';
import { CountryRepository } from './persistence/CountryRepository';
import { RegionRepository } from './persistence/RegionRepository';
import { CountryService } from './service/CountryService';
import { RegionService } from './service/RegionService';

/**
 * Country Module
 * @description
 * - 국가 및 지역 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([Country, Region, Place])],
  providers: [
    CountryRepository,
    RegionRepository,
    CountryService,
    RegionService,
  ],
  exports: [CountryService, RegionService],
})
export class CountryModule {}
