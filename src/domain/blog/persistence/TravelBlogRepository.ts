import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelBlog } from '../entity/TravelBlog.entity';

/**
 * TravelBlog Repository
 * @description
 * - 여행 블로그 정보 데이터 접근 계층
 */
@Injectable()
export class TravelBlogRepository {
  constructor(
    @InjectRepository(TravelBlog)
    private readonly repository: Repository<TravelBlog>,
  ) {}

  async findById(id: string): Promise<TravelBlog | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'likes'],
    });
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelBlog[], number]> {
    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: ['likes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findPublicBlogs(
    page: number = 1,
    limit: number = 20,
  ): Promise<[TravelBlog[], number]> {
    return this.repository.findAndCount({
      where: { isPublic: true },
      relations: ['user', 'likes'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async save(blog: TravelBlog): Promise<TravelBlog> {
    return this.repository.save(blog);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete({ id });
  }
}
