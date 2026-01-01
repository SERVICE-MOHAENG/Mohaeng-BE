import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '../../global/jwt/Jwt.module';
import { RefreshToken } from './entity/RefreshToken.entity';
import { RefreshTokenRepository } from './persistence/RefreshTokenRepository';
import { UserModule } from '../user/UserModule';
import { AuthController } from './presentation/AuthController';
import { AuthService } from './service/AuthService';
import { GoogleStrategy } from './strategy/google.strategy';

/**
 * AuthModule
 * @description
 * - 인증 도메인 모듈
 * - 로그인, 토큰 관리
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    JwtModule,
    UserModule, // UserService를 사용하기 위해 import
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenRepository, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
