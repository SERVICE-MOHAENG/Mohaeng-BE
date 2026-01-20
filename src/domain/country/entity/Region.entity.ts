import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Check } from 'typeorm';
import { Max, Min } from 'class-validator';
import { BaseEntity } from '../../../global/BaseEntity';
import { Country } from './Country.entity';
import { RegionEnvironment } from './RegionEnvironment.entity';
import { RegionFoodPersonality } from './RegionFoodPersonality.entity';
import { RegionMainInterest } from './RegionMainInterest.entity';
import { RegionCategory } from './RegionCategory.entity';
import { RegionTravelStyle } from './RegionTravelStyle.entity';
import { TravelRange } from '../../preference/entity/TravelRange.enum';
import { BudgetLevel } from '../../preference/entity/BudgetLevel.enum';

/**
 * Region Entity
 * @description
 * - 지역 정보 엔티티
 * - 국가별 세부 지역(도시, 주 등)을 관리
 * - 추천 알고리즘을 위한 환경, 식도락, 관심사 태그 포함
 */
@Entity('region_table')
@Check('chk_region_popularity_score', '"popularity_score" >= 0 AND "popularity_score" <= 5')
export class Region extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 100,
    name: 'region_name',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'latitude',
    nullable: true,
    comment: '위도',
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 7,
    name: 'longitude',
    nullable: true,
    comment: '경도',
  })
  longitude: number | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'region_image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'travel_range',
    nullable: false,
    comment: '한국에서 이동 거리 (설문 2번과 매칭)',
  })
  travelRange: TravelRange;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'average_budget_level',
    nullable: false,
    default: BudgetLevel.MEDIUM,
    comment: '평균 여행 예산 수준',
  })
  averageBudgetLevel: BudgetLevel;

  @Column({
    type: 'decimal',
    name: 'popularity_score',
    nullable: false,
    default: 0,
    comment: '인기도 점수 0-5',
    transformer: {
      from: (value: string | null | undefined) => parseFloat(value ?? '0'),
      to: (value: number | null | undefined) => value?.toString() ?? '0',
    },
  })
  @Min(0)
  @Max(5)
  popularityScore: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    name: 'ai_score',
    nullable: false,
    default: 0,
    comment: 'AI 추천 점수 (0-100)',
  })
  recommendationScore: number;

  @Column({
    type: 'text',
    name: 'region_description',
    nullable: true,
    comment: '지역 설명하는 요약 글',
  })
  regionDescription: string | null;

  @ManyToOne(() => Country, (country) => country.regions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  // 설문 3번: 선호 환경 매칭용
  @OneToMany(() => RegionEnvironment, (environment) => environment.region, {
    cascade: true,
  })
  environments: RegionEnvironment[];

  // 설문 5번: 식도락 성향 매칭용
  @OneToMany(
    () => RegionFoodPersonality,
    (foodPersonality) => foodPersonality.region,
    { cascade: true },
  )
  foodPersonalities: RegionFoodPersonality[];

  // 설문 6번: 핵심 관심사 매칭용
  @OneToMany(() => RegionMainInterest, (mainInterest) => mainInterest.region, {
    cascade: true,
  })
  mainInterests: RegionMainInterest[];

  // 카테고리 태그
  @OneToMany(() => RegionCategory, (category) => category.region, {
    cascade: true,
  })
  categories: RegionCategory[];

  // 여행 스타일 태그
  @OneToMany(() => RegionTravelStyle, (travelStyle) => travelStyle.region, {
    cascade: true,
  })
  travelStyles: RegionTravelStyle[];

  /**
   * 지역 생성 팩토리 메서드
   */
  static create(
    name: string,
    country: Country,
    travelRange: TravelRange,
    averageBudgetLevel: BudgetLevel = BudgetLevel.MEDIUM,
    latitude?: number,
    longitude?: number,
    imageUrl?: string,
  ): Region {
    const region = new Region();
    region.name = name;
    region.country = country;
    region.travelRange = travelRange;
    region.averageBudgetLevel = averageBudgetLevel;
    region.latitude = latitude ?? null;
    region.longitude = longitude ?? null;
    region.imageUrl = imageUrl || null;
    region.popularityScore = 0;
    region.recommendationScore = 0;
    region.environments = [];
    region.foodPersonalities = [];
    region.mainInterests = [];
    region.categories = [];
    region.travelStyles = [];
    return region;
  }

  /**
   * 인기도 점수 증가
   */
  incrementPopularityScore(points: number = 1): void {
    const current = Number(this.popularityScore);
    this.popularityScore = Math.min(5, Math.max(0, current + points));
  }

  /**
   * 추천 점수 계산 및 업데이트
   */
  updateRecommendationScore(score: number): void {
    this.recommendationScore = Math.min(100, Math.max(0, score));
  }
}
