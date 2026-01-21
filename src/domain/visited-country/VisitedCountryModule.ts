import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVisitedCountry } from './entity/UserVisitedCountry.entity';
import { UserVisitedCountryRepository } from './persistence/UserVisitedCountryRepository';
import { UserVisitedCountryService } from './service/UserVisitedCountryService';

/**
 * VisitedCountry Module
 * @description
 * - 사용자 방문 국가 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserVisitedCountry])],
  providers: [UserVisitedCountryRepository, UserVisitedCountryService],
  exports: [UserVisitedCountryService],
})
export class VisitedCountryModule {}
