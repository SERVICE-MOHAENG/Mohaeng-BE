import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelBlog } from './entity/TravelBlog.entity';
import { BlogLike } from './entity/BlogLike.entity';
import { TravelBlogRepository } from './persistence/TravelBlogRepository';
import { TravelBlogService } from './service/TravelBlogService';

/**
 * Blog Module
 * @description
 * - 여행 블로그 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([TravelBlog, BlogLike])],
  providers: [TravelBlogRepository, TravelBlogService],
  exports: [TravelBlogService],
})
export class BlogModule {}
