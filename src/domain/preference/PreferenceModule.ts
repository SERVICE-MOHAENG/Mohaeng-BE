import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { UserPreference } from './entity/UserPreference.entity';
import { UserPreferenceWeather } from './entity/UserPreferenceWeather.entity';
import { UserPreferenceTravelRange } from './entity/UserPreferenceTravelRange.entity';
import { UserPreferenceTravelStyle } from './entity/UserPreferenceTravelStyle.entity';
import { UserPreferenceFoodPersonality } from './entity/UserPreferenceFoodPersonality.entity';
import { UserPreferenceMainInterest } from './entity/UserPreferenceMainInterest.entity';
import { UserPreferenceBudget } from './entity/UserPreferenceBudget.entity';
import { PreferenceJob } from './entity/PreferenceJob.entity';
import { PreferenceRecommendation } from './entity/PreferenceRecommendation.entity';
import { Region } from '../country/entity/Region.entity';
import { UserPreferenceRepository } from './persistence/UserPreferenceRepository';
import { PreferenceJobRepository } from './persistence/PreferenceJobRepository';
import { RegionRepository } from '../country/persistence/RegionRepository';
import { UserPreferenceService } from './service/UserPreferenceService';
import { PreferenceCallbackService } from './service/PreferenceCallbackService';
import { PreferenceJobCleanupService } from './service/PreferenceJobCleanupService';
import { PreferenceProcessor } from './processor/PreferenceProcessor';
import { UserPreferenceController } from './presentation/UserPreferenceController';
import { UserModule } from '../user/UserModule';

/**
 * PreferenceModule
 * @description
 * - 사용자 초기 가입 설문(선호도) 도메인 모듈
 * - BullMQ preference-recommendation 큐 + Python LLM 연동
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreference,
      UserPreferenceWeather,
      UserPreferenceTravelRange,
      UserPreferenceTravelStyle,
      UserPreferenceFoodPersonality,
      UserPreferenceMainInterest,
      UserPreferenceBudget,
      PreferenceJob,
      PreferenceRecommendation,
      Region,
    ]),
    BullModule.registerQueue({
      name: 'preference-recommendation',
    }),
    HttpModule,
    UserModule,
  ],
  controllers: [UserPreferenceController],
  providers: [
    UserPreferenceRepository,
    PreferenceJobRepository,
    RegionRepository,
    UserPreferenceService,
    PreferenceCallbackService,
    PreferenceJobCleanupService,
    PreferenceProcessor,
  ],
  exports: [UserPreferenceService],
})
export class PreferenceModule {}
