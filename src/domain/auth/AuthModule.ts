import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '../../global/jwt/Jwt.module';
import { RefreshToken } from './entity/RefreshToken.entity';
import { RefreshTokenRepository } from './persistence/RefreshTokenRepository';
import { OAuthCodeRepository } from './persistence/OAuthCodeRepository';
import { UserModule } from '../user/UserModule';
import { AuthController } from './presentation/AuthController';
import { AuthService } from './service/AuthService';
import { GoogleStrategy } from './strategy/google.strategy';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';

/**
 * AuthModule
 * @description
 * - 인증 도메인 모듈
 * - 로그인, 토큰 관리, OAuth 인증 코드 관리
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    JwtModule,
    UserModule, // UserService를 사용하기 위해 import
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RefreshTokenRepository,
    OAuthCodeRepository,
    GoogleStrategy,
    NaverStrategy,
    KakaoStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
