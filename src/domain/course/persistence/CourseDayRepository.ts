import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseDay } from '../entity/CourseDay.entity';
import { CoursePlace } from '../entity/CoursePlace.entity';

/**
 * CourseDay Repository
 * @description
 * - 여행 코스 날짜 데이터 접근 계층
 */
@Injectable()
export class CourseDayRepository {
  constructor(
    @InjectRepository(CourseDay)
    private readonly courseDayRepo: Repository<CourseDay>,
    @InjectRepository(CoursePlace)
    private readonly coursePlaceRepo: Repository<CoursePlace>,
  ) {}

  async findByIdWithPlacesAndCourse(id: string): Promise<CourseDay | null> {
    return this.courseDayRepo.findOne({
      where: { id },
      relations: ['coursePlaces', 'travelCourse', 'travelCourse.user'],
    });
  }

  async saveCoursePlaces(places: CoursePlace[]): Promise<void> {
    await this.coursePlaceRepo.save(places);
  }
}
