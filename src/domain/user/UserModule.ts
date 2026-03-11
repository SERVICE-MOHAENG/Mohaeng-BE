import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { UserService } from './service/UserService';
import { UserController } from './presentation/UserController';
import { UserRepository } from './persistence/UserRepository';
import { CourseLike } from '../course/entity/CourseLike.entity';
import { BlogLike } from '../blog/entity/BlogLike.entity';
import { RegionLike } from '../country/entity/RegionLike.entity';
import { CourseLikeRepository } from '../course/persistence/CourseLikeRepository';
import { BlogLikeRepository } from '../blog/persistence/BlogLikeRepository';
import { RegionLikeRepository } from '../country/persistence/RegionLikeRepository';
import { UserLikeService } from './service/UserLikeService';

/**
 * UserModule
 * @description
 * - 사용자 도메인 모듈
 * - 회원가입, 사용자 정보 관리
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, CourseLike, BlogLike, RegionLike])],
  controllers: [UserController],
  providers: [
    UserService,
    UserLikeService,
    UserRepository,
    CourseLikeRepository,
    BlogLikeRepository,
    RegionLikeRepository,
  ],
  exports: [UserService, UserRepository],
})
export class UserModule {}
