import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../global/BaseEntity';
import { TravelBlog } from './TravelBlog.entity';

/**
 * BlogImage Entity
 * @description
 * - 여행 블로그 이미지 엔티티
 * - 본문 하단 갤러리용 이미지 관리
 */
@Entity('blog_image_table')
export class BlogImage extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 500,
    name: 'image_url',
    nullable: false,
  })
  imageUrl: string;

  @Column({
    type: 'int',
    name: 'sort_order',
    nullable: false,
    default: 0,
  })
  sortOrder: number;

  @ManyToOne(() => TravelBlog, (blog) => blog.images, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'travel_blog_id' })
  travelBlog: TravelBlog;

  static create(
    imageUrl: string,
    travelBlog: TravelBlog,
    sortOrder: number,
  ): BlogImage {
    const image = new BlogImage();
    image.imageUrl = imageUrl;
    image.travelBlog = travelBlog;
    image.sortOrder = sortOrder;
    return image;
  }
}
