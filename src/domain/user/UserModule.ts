import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { UserService } from './service/UserService';
import { UserController } from './presentation/UserController';
import { UserRepository } from './persistence/UserRepository';

/**
 * UserModule
 * @description
 * - 사용자 도메인 모듈
 * - 회원가입, 사용자 정보 관리
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository, // Repository 추가
  ],
  exports: [UserService, UserRepository], // 다른 모듈에서 UserService, UserRepository 사용 가능
})
export class UserModule {}
