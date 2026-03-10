import { Injectable } from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';
import { UserRepository } from '../../user/persistence/UserRepository';
import { UserNotFoundException } from '../../user/exception/UserNotFoundException';
import { RegionLikeRepository } from '../persistence/RegionLikeRepository';
import { RegionService } from './RegionService';
import { RegionLikeAlreadyExistsException } from '../exception/RegionLikeAlreadyExistsException';
import { RegionLike } from '../entity/RegionLike.entity';

@Injectable()
export class RegionLikeService {
  constructor(
    private readonly regionLikeRepository: RegionLikeRepository,
    private readonly regionService: RegionService,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async addLike(userId: string, regionId: string): Promise<void> {
    const [region, user] = await Promise.all([
      this.regionService.findById(regionId),
      this.userRepository.findById(userId),
    ]);

    if (!user) {
      throw new UserNotFoundException();
    }

    try {
      await this.dataSource.transaction(async (manager) => {
        const existing = await manager.getRepository(RegionLike).findOne({
          where: {
            user: { id: userId },
            region: { id: regionId },
          },
        });

        if (existing) {
          throw new RegionLikeAlreadyExistsException();
        }

        await manager.save(RegionLike, RegionLike.create(region, user));
      });
    } catch (error) {
      if (error instanceof RegionLikeAlreadyExistsException) {
        throw error;
      }
      if (this.isDuplicateLikeError(error)) {
        throw new RegionLikeAlreadyExistsException();
      }
      throw error;
    }
  }

  async removeLike(userId: string, regionId: string): Promise<void> {
    await this.regionService.findById(regionId);

    const existing = await this.regionLikeRepository.findByUserIdAndRegionId(
      userId,
      regionId,
    );

    if (!existing) {
      return;
    }

    await this.regionLikeRepository.delete(existing.id);
  }

  async getMyLikes(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[RegionLike[], number]> {
    return this.regionLikeRepository.findByUserId(userId, page, limit);
  }

  async getLikeCount(regionId: string): Promise<number> {
    return this.regionLikeRepository.countByRegionId(regionId);
  }

  async getLikeCounts(regionIds: string[]): Promise<Record<string, number>> {
    return this.regionLikeRepository.countByRegionIds(regionIds);
  }

  async getLikedRegionIds(
    userId: string,
    regionIds: string[],
  ): Promise<Set<string>> {
    return this.regionLikeRepository.findLikedRegionIds(userId, regionIds);
  }

  async isLiked(userId: string, regionId: string): Promise<boolean> {
    return this.regionLikeRepository.existsByUserIdAndRegionId(
      userId,
      regionId,
    );
  }

  private isDuplicateLikeError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const message = typeof error.message === 'string' ? error.message : '';
    return (
      message.includes('duplicate key') ||
      message.includes('UNIQUE constraint failed') ||
      message.includes('Duplicate entry')
    );
  }
}
