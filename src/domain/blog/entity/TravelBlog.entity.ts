import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { User } from '../../user/entity/User.entity';
import { BlogLike } from './BlogLike.entity';

/**
 * TravelBlog Entity
 * @description
 * - 여행 블로그 정보 엔티티
 * - 사용자의 여행 기록 및 후기 관리
 */
@Entity('travel_blog_table')
export class TravelBlog extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 255,
    name: 'blog_title',
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    name: 'blog_content',
    nullable: false,
  })
  content: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'blog_image_url',
    nullable: true,
  })
  imageUrl: string | null;

  @Column({
    type: 'boolean',
    name: 'is_public',
    nullable: false,
    default: true,
    comment: '공개 여부',
  })
  isPublic: boolean;

  @Column({
    type: 'int',
    name: 'view_count',
    nullable: false,
    default: 0,
    comment: '조회수',
  })
  viewCount: number;

  @Column({
    type: 'int',
    name: 'like_count',
    nullable: false,
    default: 0,
    comment: '좋아요 수',
  })
  likeCount: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => BlogLike, (like) => like.travelBlog)
  likes: BlogLike[];

  /**
   * 여행 블로그 생성 팩토리 메서드
   */
  static create(
    title: string,
    content: string,
    user: User,
    imageUrl?: string,
    isPublic: boolean = true,
  ): TravelBlog {
    const blog = new TravelBlog();
    blog.title = title;
    blog.content = content;
    blog.user = user;
    blog.imageUrl = imageUrl || null;
    blog.isPublic = isPublic;
    blog.viewCount = 0;
    blog.likeCount = 0;
    return blog;
  }

  /**
   * 조회수 증가
   */
  incrementViewCount(): void {
    this.viewCount += 1;
  }

  /**
   * 좋아요 수 증가
   */
  incrementLikeCount(): void {
    this.likeCount += 1;
  }

  /**
   * 좋아요 수 감소
   */
  decrementLikeCount(): void {
    if (this.likeCount > 0) {
      this.likeCount -= 1;
    }
  }
}
