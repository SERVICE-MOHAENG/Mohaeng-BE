import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { GlobalJwtService } from './GlobalJwtService';

@Module({
  imports: [
    NestJwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // access secret 및 만료 설정
        const secret = configService.get<string>('JWT_ACCESS_SECRET');
        if (!secret) {
          throw new Error('JWT access secret is not set.');
        }

        return {
          secret,
          signOptions: {
            // access token 기본 만료 시간
            expiresIn: (configService.get<string>('JWT_ACCESS_EXPIRY') ||
              '1h') as StringValue,
          },
        };
      },
    }),
  ],
  providers: [GlobalJwtService],
  exports: [NestJwtModule, GlobalJwtService],
})
export class JwtModule {}
