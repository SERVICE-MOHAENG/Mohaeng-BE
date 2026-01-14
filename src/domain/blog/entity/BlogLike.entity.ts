import { Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelBlog } from './TravelBlog.entity';
import { User } from '../../user/entity/User.entity';

/**
 * BlogLike Entity
 * @description
 * - 여행 블로그 좋아요 엔티티
 * - 사용자의 블로그 좋아요 관리
 */
@Entity('blog_like_table')
@Unique(['travelBlog', 'user'])
export class BlogLike extends BaseEntity {
  @ManyToOne(() => TravelBlog, (blog) => blog.likes, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'travel_blog_id' })
  travelBlog: TravelBlog;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * 블로그 좋아요 생성 팩토리 메서드
   */
  static create(travelBlog: TravelBlog, user: User): BlogLike {
    const like = new BlogLike();
    like.travelBlog = travelBlog;
    like.user = user;
    return like;
  }
}
