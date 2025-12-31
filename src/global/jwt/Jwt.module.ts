import 'dotenv/config';
import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

@Module({
  imports: [
    NestJwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ||
          '1h') as StringValue,
      },
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule {}
