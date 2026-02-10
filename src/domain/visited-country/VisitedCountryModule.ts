import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserVisitedCountry } from './entity/UserVisitedCountry.entity';
import { UserVisitedCountryRepository } from './persistence/UserVisitedCountryRepository';
import { UserVisitedCountryService } from './service/UserVisitedCountryService';
import { UserVisitedCountryController } from './presentation/UserVisitedCountryController';
import { CountryModule } from '../country/CountryModule';
import { UserModule } from '../user/UserModule';

/**
 * VisitedCountry Module
 * @description
 * - 사용자 방문 국가 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([UserVisitedCountry]), CountryModule, UserModule],
  providers: [UserVisitedCountryRepository, UserVisitedCountryService],
  controllers: [UserVisitedCountryController],
  exports: [UserVisitedCountryService],
})
export class VisitedCountryModule {}
