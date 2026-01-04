import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { RefreshToken } from '../entity/RefreshToken.entity';
import { RefreshTokenStatus } from '../entity/RefreshTokenStatus.enum';

/**
 * RefreshTokenRepository
 * @description
 * - Refresh token data access layer
 */
@Injectable()
export class RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.repository.findOne({
      where: { tokenHash },
      relations: ['user'],
    });
  }

  async save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return this.repository.save(refreshToken);
  }

  async revokeAllActiveByUserId(userId: string): Promise<void> {
    await this.repository.update(
      { user: { id: userId }, status: RefreshTokenStatus.ACTIVE },
      { status: RefreshTokenStatus.REVOKED, revokedAt: new Date() },
    );
  }

  async clear(): Promise<void> {
    await this.repository.clear();
  }

  async findAll(
    options?: FindManyOptions<RefreshToken>,
  ): Promise<RefreshToken[]> {
    return this.repository.find(options);
  }

  async count(options?: FindManyOptions<RefreshToken>): Promise<number> {
    return this.repository.count(options);
  }
}
