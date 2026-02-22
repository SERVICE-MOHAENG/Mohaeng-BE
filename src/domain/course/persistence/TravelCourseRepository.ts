import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
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
    try {
      return await this.repository.findOne({
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
    } catch (error) {
      if (error instanceof QueryFailedError) {
        return null;
      }
      throw error;
    }
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
    const baseQuery = this.repository
      .createQueryBuilder('course')
      .where('course.isPublic = :isPublic', { isPublic: true });

    if (countryCode) {
      baseQuery
        .leftJoin('course.courseCountries', 'courseCountries')
        .leftJoin('courseCountries.country', 'country')
        .andWhere('country.code = :countryCode', { countryCode });
    }

    const total = await baseQuery.clone().getCount();

    // Postgres + pagination + getManyAndCount 조합에서 발생하는 별칭 오류를 피하기 위해
    // ID 목록은 raw 쿼리로 분리 조회한다.
    const pagedIds = await baseQuery
      .clone()
      .select('course.id', 'id')
      .orderBy('course.likeCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawMany<{ id: string }>();

    const courseIds = pagedIds.map((row) => row.id);

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
