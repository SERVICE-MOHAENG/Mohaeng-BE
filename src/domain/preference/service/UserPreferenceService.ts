import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { UserPreferenceRepository } from '../persistence/UserPreferenceRepository';
import { PreferenceJobRepository } from '../persistence/PreferenceJobRepository';
import { PreferenceJob } from '../entity/PreferenceJob.entity';
import { UserPreference } from '../entity/UserPreference.entity';
import { UserPreferenceWeather } from '../entity/UserPreferenceWeather.entity';
import { UserPreferenceTravelRange } from '../entity/UserPreferenceTravelRange.entity';
import { UserPreferenceTravelStyle } from '../entity/UserPreferenceTravelStyle.entity';
import { UserPreferenceFoodPersonality } from '../entity/UserPreferenceFoodPersonality.entity';
import { UserPreferenceMainInterest } from '../entity/UserPreferenceMainInterest.entity';
import { UserPreferenceBudget } from '../entity/UserPreferenceBudget.entity';
import { WeatherPreference } from '../entity/WeatherPreference.enum';
import { TravelRange } from '../entity/TravelRange.enum';
import { TravelStyle } from '../entity/TravelStyle.enum';
import { FoodPersonality } from '../entity/FoodPersonality.enum';
import { MainInterest } from '../entity/MainInterest.enum';
import { BudgetLevel } from '../entity/BudgetLevel.enum';
import { PreferenceJobData } from '../processor/PreferenceProcessor';

/**
 * 선호도 생성/수정 DTO
 * - weather / travelRange / travelStyle / budget : 단일값
 * - foodPersonalities / mainInterests            : 다중값 배열
 */
export interface CreateUserPreferenceDto {
  userId: string;
  weather: WeatherPreference;
  travelRange: TravelRange;
  travelStyle: TravelStyle;
  foodPersonalities: FoodPersonality[];
  mainInterests: MainInterest[];
  budget: BudgetLevel;
}

/**
 * UserPreferenceService
 * @description
 * - 사용자 선호도 비즈니스 로직
 */
@Injectable()
export class UserPreferenceService {
  private readonly logger = new Logger(UserPreferenceService.name);

  constructor(
    private readonly userPreferenceRepository: UserPreferenceRepository,
    private readonly preferenceJobRepository: PreferenceJobRepository,
    private readonly dataSource: DataSource,
    @InjectQueue('preference-recommendation')
    private readonly preferenceQueue: Queue,
  ) {}

  /**
   * 사용자 선호도 생성 또는 업데이트
   * @description
   * - 이미 선호도가 있으면 기존 것을 삭제하고 새로 생성
   * - 삭제-생성을 트랜잭션으로 묶어 데이터 유실 방지
   * - cascade 설정으로 매핑 테이블도 자동으로 저장됨
   */
  async createOrUpdate(dto: CreateUserPreferenceDto): Promise<UserPreference> {
    return this.dataSource.transaction(async (manager) => {
      // 기존 선호도가 있으면 삭제
      const existing = await manager.findOne(UserPreference, {
        where: { userId: dto.userId },
      });
      if (existing) {
        await manager.delete(UserPreference, existing.id);
      }

      // 새 선호도 생성
      const preference = UserPreference.create(dto.userId);
      const saved = await manager.save(UserPreference, preference);

      // 각 선호도 매핑 엔티티 생성
      // 단일 선택 4개 → 매핑 테이블에 row 1개씩 저장
      saved.weatherPreferences = [
        UserPreferenceWeather.create(saved.id, dto.weather),
      ];

      saved.travelRanges = [
        UserPreferenceTravelRange.create(saved.id, dto.travelRange),
      ];

      saved.travelStyles = [
        UserPreferenceTravelStyle.create(saved.id, dto.travelStyle),
      ];

      saved.budgets = [UserPreferenceBudget.create(saved.id, dto.budget)];

      // 다중 선택 2개 → 배열 그대로 저장
      saved.foodPersonalities = dto.foodPersonalities.map((food) =>
        UserPreferenceFoodPersonality.create(saved.id, food),
      );

      saved.mainInterests = dto.mainInterests.map((interest) =>
        UserPreferenceMainInterest.create(saved.id, interest),
      );

      // cascade로 매핑 테이블도 자동 저장
      return manager.save(UserPreference, saved);
    });
  }

  async createOrUpdateAndEnqueue(
    dto: CreateUserPreferenceDto,
  ): Promise<{ jobId: string; status: string }> {
    const preference = await this.createOrUpdate(dto);
    const job = PreferenceJob.create(dto.userId, preference.id);
    const savedJob = await this.preferenceJobRepository.save(job);
    const jobData: PreferenceJobData = {
      jobId: savedJob.id,
      preferenceId: preference.id,
    };

    try {
      await this.preferenceQueue.add('recommend', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } catch (error) {
      savedJob.markFailed('QUEUE_ERROR', '추천 작업 큐 등록에 실패했습니다');

      try {
        await this.preferenceJobRepository.save(savedJob);
      } catch (saveError) {
        this.logger.error(
          `PreferenceJob FAILED 상태 저장 실패: jobId=${savedJob.id}`,
          saveError,
        );
      }

      throw error;
    }

    return { jobId: savedJob.id, status: savedJob.status };
  }

  /**
   * 사용자 ID로 선호도 조회
   */
  async findByUserId(userId: string): Promise<UserPreference | null> {
    return this.userPreferenceRepository.findByUserId(userId);
  }

  /**
   * 선호도 ID로 조회
   */
  async findById(id: string): Promise<UserPreference | null> {
    return this.userPreferenceRepository.findById(id);
  }

  /**
   * 선호도 존재 여부 확인
   */
  async existsByUserId(userId: string): Promise<boolean> {
    return this.userPreferenceRepository.existsByUserId(userId);
  }

  /**
   * 선호도 삭제
   */
  async delete(id: string): Promise<void> {
    await this.userPreferenceRepository.delete(id);
  }
}
