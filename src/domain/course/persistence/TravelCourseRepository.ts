import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelCourse } from '../entity/TravelCourse.entity';

/**
 * TravelCourse Repository
 * @description
 * - 여행 코스 정보 데이터 접근 계층
 */
@Injectable()
export class TravelCourseRepository {
  constructor(
    @InjectRepository(TravelCourse)
    private readonly repository: Repository<TravelCourse>,
  ) {}

  async findById(id: string): Promise<TravelCourse | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'user',
        'courseCountries',
        'courseCountries.country',
        'coursePlaces',
        'coursePlaces.place',
        'hashTags',
      ],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelCourse[], number]> {
    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: [
        'courseCountries',
        'courseCountries.country',
        'coursePlaces',
        'hashTags',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicCourses(
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelCourse[], number]> {
    return this.repository.findAndCount({
      where: { isPublic: true },
      relations: [
        'user',
        'courseCountries',
        'courseCountries.country',
        'coursePlaces',
        'hashTags',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async save(course: TravelCourse): Promise<TravelCourse> {
    return this.repository.save(course);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
