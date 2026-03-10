import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RegionLike } from '../entity/RegionLike.entity';

@Injectable()
export class RegionLikeRepository {
  constructor(
    @InjectRepository(RegionLike)
    private readonly repository: Repository<RegionLike>,
  ) {}

  async findByUserIdAndRegionId(
    userId: string,
    regionId: string,
  ): Promise<RegionLike | null> {
    return this.repository.findOne({
      where: {
        user: { id: userId },
        region: { id: regionId },
      },
      relations: ['user', 'region'],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[RegionLike[], number]> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));

    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: ['region', 'region.country'],
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      order: { createdAt: 'DESC' },
    });
  }

  async existsByUserIdAndRegionId(
    userId: string,
    regionId: string,
  ): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        user: { id: userId },
        region: { id: regionId },
      },
    });
    return count > 0;
  }

  async countByRegionId(regionId: string): Promise<number> {
    return this.repository.count({ where: { region: { id: regionId } } });
  }

  async countByRegionIds(regionIds: string[]): Promise<Record<string, number>> {
    const uniqueRegionIds = [...new Set(regionIds)];
    if (uniqueRegionIds.length === 0) {
      return {};
    }

    const rows = await this.repository
      .createQueryBuilder('regionLike')
      .select('regionLike.regionId', 'regionId')
      .addSelect('COUNT(regionLike.id)', 'count')
      .where('regionLike.regionId IN (:...regionIds)', {
        regionIds: uniqueRegionIds,
      })
      .groupBy('regionLike.regionId')
      .getRawMany<{ regionId: string; count: string }>();

    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.regionId] = Number(row.count);
      return acc;
    }, {});
  }

  async findLikedRegionIds(
    userId: string,
    regionIds: string[],
  ): Promise<Set<string>> {
    const uniqueRegionIds = [...new Set(regionIds)];
    if (uniqueRegionIds.length === 0) {
      return new Set<string>();
    }

    const likes = await this.repository.find({
      where: {
        user: { id: userId },
        regionId: In(uniqueRegionIds),
      },
      select: {
        regionId: true,
      },
    });

    return new Set(likes.map((like) => like.regionId));
  }

  async save(like: RegionLike): Promise<RegionLike> {
    return this.repository.save(like);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
