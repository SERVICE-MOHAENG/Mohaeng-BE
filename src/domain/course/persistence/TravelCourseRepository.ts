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
    const queryBuilder = this.repository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.user', 'user')
      .leftJoinAndSelect('course.courseCountries', 'courseCountries')
      .leftJoinAndSelect('courseCountries.country', 'country')
      .leftJoinAndSelect('course.hashTags', 'hashTags')
      .where('course.isPublic = :isPublic', { isPublic: true });

    // 국가 코드로 필터링
    if (countryCode) {
      queryBuilder.andWhere('country.code = :countryCode', { countryCode });
    }

    // 1:N 조인으로 인한 중복 제거
    queryBuilder.distinct(true);

    // 좋아요순 정렬
    queryBuilder.orderBy('course.likeCount', 'DESC');

    // 페이지네이션
    queryBuilder.skip((page - 1) * limit).take(limit);

    return queryBuilder.getManyAndCount();
  }
}
