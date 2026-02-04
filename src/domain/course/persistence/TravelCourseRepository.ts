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
        'courseDays',
        'courseDays.coursePlaces',
        'courseDays.coursePlaces.place',
        'hashTags',
      ],
      relationLoadStrategy: 'query',
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
        'user',
        'courseCountries',
        'courseCountries.country',
        'courseDays',
        'courseDays.coursePlaces',
        'courseDays.coursePlaces.place',
        'hashTags',
      ],
      relationLoadStrategy: 'query',
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
        'courseDays',
        'courseDays.coursePlaces',
        'courseDays.coursePlaces.place',
        'hashTags',
      ],
      relationLoadStrategy: 'query',
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

  /**
   * 메인페이지용 인기 코스 조회
   * @description
   * - 공개 코스만 조회
   * - 좋아요순 정렬
   * - 국가 필터링 옵션 (ISO 3166-1 alpha-2 코드)
   * - 최대 10개까지 조회
   */
  async findPopularCoursesForMainPage(
    countryCode?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<[TravelCourse[], number]> {
    // 1단계: 필터링/페이지네이션으로 코스 ID만 조회
    const queryBuilder = this.repository
      .createQueryBuilder('course')
      .select('course.id')
      .where('course.isPublic = :isPublic', { isPublic: true });

    if (countryCode) {
      queryBuilder
        .leftJoin('course.courseCountries', 'courseCountries')
        .leftJoin('courseCountries.country', 'country')
        .andWhere('country.code = :countryCode', { countryCode });
    }

    queryBuilder.orderBy('course.likeCount', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [courseIdEntities, total] = await queryBuilder.getManyAndCount();
    const courseIds = courseIdEntities.map((c) => c.id);

    if (courseIds.length === 0) {
      return [[], total];
    }

    // 2단계: ID 기반으로 relation 별도 로딩
    const courses = await this.repository.find({
      where: courseIds.map((id) => ({ id })),
      relations: [
        'user',
        'courseCountries',
        'courseCountries.country',
        'courseDays',
        'courseDays.coursePlaces',
        'courseDays.coursePlaces.place',
        'hashTags',
      ],
      relationLoadStrategy: 'query',
      order: { likeCount: 'DESC' },
    });

    return [courses, total];
  }
}
