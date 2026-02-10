import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelBlog } from './entity/TravelBlog.entity';
import { BlogLike } from './entity/BlogLike.entity';
import { TravelBlogRepository } from './persistence/TravelBlogRepository';
import { BlogLikeRepository } from './persistence/BlogLikeRepository';
import { TravelBlogService } from './service/TravelBlogService';
import { BlogLikeService } from './service/BlogLikeService';
import { TravelBlogController } from './presentation/TravelBlogController';
import { UserModule } from '../user/UserModule';

/**
 * Blog Module
 * @description
 * - 여행 블로그 도메인 모듈
 */
@Module({
  imports: [TypeOrmModule.forFeature([TravelBlog, BlogLike]), UserModule],
  providers: [
    TravelBlogRepository,
    BlogLikeRepository,
    TravelBlogService,
    BlogLikeService,
  ],
  controllers: [TravelBlogController],
  exports: [TravelBlogService, BlogLikeService],
})
export class BlogModule {}
