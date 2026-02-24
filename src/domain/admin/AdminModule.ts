import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryModule } from '../country/CountryModule';
import { Admin } from './entity/Admin.entity';
import { AdminRepository } from './persistence/AdminRepository';
import { AdminAuthService } from './service/AdminAuthService';
import { AdminAuthController } from './presentation/AdminAuthController';
import { AdminCountryController } from './presentation/AdminCountryController';
import { AdminRegionController } from './presentation/AdminRegionController';

/**
 * Admin Module
 * @description
 * - 어드민 전용 도메인 모듈
 * - 관리자 인증 (로그인/가입/토큰 갱신) 포함
 */
@Module({
  imports: [TypeOrmModule.forFeature([Admin]), CountryModule],
  controllers: [AdminAuthController, AdminCountryController, AdminRegionController],
  providers: [AdminAuthService, AdminRepository],
  exports: [AdminAuthService],
})
export class AdminModule {}
