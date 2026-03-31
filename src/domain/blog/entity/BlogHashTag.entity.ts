import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelBlog } from './TravelBlog.entity';

/**
 * BlogHashTag Entity
 * @description
 * - 여행 블로그 해시태그 엔티티
 */
@Entity('blog_hashtag_table')
@Unique(['travelBlog', 'tagName'])
export class BlogHashTag extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    name: 'tag_name',
    nullable: false,
  })
  tagName: string;

  @ManyToOne(() => TravelBlog, (blog) => blog.hashTags, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'travel_blog_id' })
  travelBlog: TravelBlog;

  static create(tagName: string, travelBlog: TravelBlog): BlogHashTag {
    const hashTag = new BlogHashTag();
    hashTag.tagName = tagName.startsWith('#') ? tagName : `#${tagName}`;
    hashTag.travelBlog = travelBlog;
    return hashTag;
  }
}
