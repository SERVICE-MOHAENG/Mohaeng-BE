import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelCourse } from './entity/TravelCourse.entity';
import { CoursePlace } from './entity/CoursePlace.entity';
import { CourseDay } from './entity/CourseDay.entity';
import { CourseHashTag } from './entity/CourseHashTag.entity';
import { CourseLike } from './entity/CourseLike.entity';
import { CourseCountry } from './entity/CourseCountry.entity';
import { ItineraryJob } from '../itinerary/entity/ItineraryJob.entity';
import { TravelCourseRepository } from './persistence/TravelCourseRepository';
import { CourseLikeRepository } from './persistence/CourseLikeRepository';
import { TravelCourseService } from './service/TravelCourseService';
import { CourseLikeService } from './service/CourseLikeService';
import { TravelCourseController } from './presentation/TravelCourseController';
import { UserModule } from '../user/UserModule';

/**
 * Course Module
 * @description
 * - 여행 코스 도메인 모듈
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TravelCourse,
      CoursePlace,
      CourseDay,
      CourseHashTag,
      CourseLike,
      CourseCountry,
      ItineraryJob,
    ]),
    UserModule,
  ],
  controllers: [TravelCourseController],
  providers: [
    TravelCourseRepository,
    CourseLikeRepository,
    TravelCourseService,
    CourseLikeService,
  ],
  exports: [TravelCourseService, CourseLikeService],
})
export class CourseModule {}
