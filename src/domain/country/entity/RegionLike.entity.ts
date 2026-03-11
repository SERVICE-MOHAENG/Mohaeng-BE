import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { Region } from './Region.entity';
import { User } from '../../user/entity/User.entity';

@Entity('region_like_table')
@Index('uq_region_like_region_user', ['regionId', 'userId'], { unique: true })
@Index('idx_region_like_region', ['regionId'])
@Index('idx_region_like_user', ['userId'])
export class RegionLike extends BaseEntity {
  @ManyToOne(() => Region, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @Column({ type: 'uuid', name: 'region_id' })
  regionId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  static create(region: Region, user: User): RegionLike {
    const like = new RegionLike();
    like.region = region;
    like.regionId = region.id;
    like.user = user;
    like.userId = user.id;
    return like;
  }
}
