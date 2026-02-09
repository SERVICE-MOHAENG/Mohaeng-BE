import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelCourse } from './entity/TravelCourse.entity';
import { CoursePlace } from './entity/CoursePlace.entity';
import { CourseDay } from './entity/CourseDay.entity';
import { CourseHashTag } from './entity/CourseHashTag.entity';
import { CourseLike } from './entity/CourseLike.entity';
import { CourseBookmark } from './entity/CourseBookmark.entity';
import { CourseCountry } from './entity/CourseCountry.entity';
import { TravelCourseRepository } from './persistence/TravelCourseRepository';
import { CourseBookmarkRepository } from './persistence/CourseBookmarkRepository';
import { CourseLikeRepository } from './persistence/CourseLikeRepository';
import { TravelCourseService } from './service/TravelCourseService';
import { CourseBookmarkService } from './service/CourseBookmarkService';
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
      CourseBookmark,
      CourseCountry,
    ]),
    UserModule,
  ],
  controllers: [TravelCourseController],
  providers: [
    TravelCourseRepository,
    CourseBookmarkRepository,
    CourseLikeRepository,
    TravelCourseService,
    CourseBookmarkService,
    CourseLikeService,
  ],
  exports: [TravelCourseService, CourseBookmarkService, CourseLikeService],
})
export class CourseModule {}
