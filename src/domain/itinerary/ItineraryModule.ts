import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { ItineraryJob } from './entity/ItineraryJob.entity';
import { CourseSurvey } from '../course/entity/CourseSurvey.entity';
import { RoadmapSurvey } from '../course/entity/RoadmapSurvey.entity';
import { RoadmapSurveyCompanion } from '../course/entity/RoadmapSurveyCompanion.entity';
import { RoadmapSurveyTheme } from '../course/entity/RoadmapSurveyTheme.entity';
import { TravelCourse } from '../course/entity/TravelCourse.entity';
import { CourseDay } from '../course/entity/CourseDay.entity';
import { CoursePlace } from '../course/entity/CoursePlace.entity';
import { CourseHashTag } from '../course/entity/CourseHashTag.entity';
import { CourseRegion } from '../course/entity/CourseRegion.entity';
import { CourseAiChat } from '../course/entity/CourseAiChat.entity';
import { Place } from '../place/entity/Place.entity';
import { CourseSurveyDestination } from '../course/entity/CourseSurveyDestination.entity';
import { CourseSurveyCompanion } from '../course/entity/CourseSurveyCompanion.entity';
import { CourseSurveyTheme } from '../course/entity/CourseSurveyTheme.entity';
import { Region } from '../country/entity/Region.entity';
import { ItineraryJobRepository } from './persistence/ItineraryJobRepository';
import { ItineraryService } from './service/ItineraryService';
import { ItineraryCallbackService } from './service/ItineraryCallbackService';
import { ItineraryModificationService } from './service/ItineraryModificationService';
import { ItineraryModificationCallbackService } from './service/ItineraryModificationCallbackService';
import { ItineraryJobCleanupService } from './service/ItineraryJobCleanupService';
import { ItineraryProcessor } from './processor/ItineraryProcessor';
import { ItineraryModificationProcessor } from './processor/ItineraryModificationProcessor';
import { ItineraryController } from './presentation/ItineraryController';
import { ServiceSecretGuard } from './guard/ServiceSecretGuard';
import { UserModule } from '../user/UserModule';

/**
 * Itinerary Module
 * @description
 * - 여행 일정 비동기 생성 도메인 모듈
 * - BullMQ 기반 작업 큐, Python LLM 서버 연동
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItineraryJob,
      CourseSurvey,
      RoadmapSurvey,
      RoadmapSurveyCompanion,
      RoadmapSurveyTheme,
      TravelCourse,
      CourseDay,
      CoursePlace,
      CourseHashTag,
      CourseRegion,
      CourseAiChat,
      Place,
      Region,
      CourseSurveyDestination,
      CourseSurveyCompanion,
      CourseSurveyTheme,
    ]),
    UserModule,
    BullModule.registerQueue({
      name: 'itinerary-generation',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    BullModule.registerQueue({
      name: 'itinerary-modification',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    HttpModule.register({
      timeout: 60000,
    }),
  ],
  controllers: [ItineraryController],
  providers: [
    ItineraryJobRepository,
    ItineraryService,
    ItineraryCallbackService,
    ItineraryModificationService,
    ItineraryModificationCallbackService,
    ItineraryJobCleanupService,
    ItineraryProcessor,
    ItineraryModificationProcessor,
    ServiceSecretGuard,
  ],
  exports: [ItineraryService],
})
export class ItineraryModule {}
