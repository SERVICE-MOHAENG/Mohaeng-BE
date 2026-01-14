import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelCourse } from './entity/TravelCourse.entity';
import { CoursePlace } from './entity/CoursePlace.entity';
import { CourseHashTag } from './entity/CourseHashTag.entity';
import { CourseLike } from './entity/CourseLike.entity';
import { CourseBookmark } from './entity/CourseBookmark.entity';
import { CourseCountry } from './entity/CourseCountry.entity';
import { TravelCourseRepository } from './persistence/TravelCourseRepository';
import { TravelCourseService } from './service/TravelCourseService';

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
      CourseHashTag,
      CourseLike,
      CourseBookmark,
      CourseCountry,
    ]),
  ],
  providers: [TravelCourseRepository, TravelCourseService],
  exports: [TravelCourseService],
})
export class CourseModule {}
