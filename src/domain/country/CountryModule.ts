import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entity/Country.entity';
import { Region } from './entity/Region.entity';
import { RegionLike } from './entity/RegionLike.entity';
import { Place } from '../place/entity/Place.entity';
import { CountryRepository } from './persistence/CountryRepository';
import { RegionRepository } from './persistence/RegionRepository';
import { RegionLikeRepository } from './persistence/RegionLikeRepository';
import { CountryService } from './service/CountryService';
import { RegionService } from './service/RegionService';
import { RegionLikeService } from './service/RegionLikeService';
import { CountryController } from './presentation/CountryController';
import { RegionController } from './presentation/RegionController';
import { UserModule } from '../user/UserModule';
import { CourseModule } from '../course/CourseModule';

/**
 * Country Module
 * @description
 * - 국가 및 지역 도메인 모듈
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Country, Region, RegionLike, Place]),
    UserModule,
    CourseModule,
  ],
  controllers: [CountryController, RegionController],
  providers: [
    CountryRepository,
    RegionRepository,
    RegionLikeRepository,
    CountryService,
    RegionService,
    RegionLikeService,
  ],
  exports: [
    CountryService,
    RegionService,
    RegionLikeService,
    RegionLikeRepository,
  ],
})
export class CountryModule {}
