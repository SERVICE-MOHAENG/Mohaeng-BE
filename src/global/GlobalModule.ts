import { Global, Module } from '@nestjs/common';
import { UserModule } from '../domain/user/UserModule';
import { JwtModule } from './jwt/Jwt.module';
import { RedisModule } from './redis/Redis.module';
import { S3Module } from './s3/S3Module';
import { AdminAuthGuard } from './guards/AdminAuth.guard';
import { UserAuthGuard } from './guards/UserAuth.guard';

@Global()
@Module({
  imports: [JwtModule, RedisModule, UserModule, S3Module],
  controllers: [],
  providers: [AdminAuthGuard, UserAuthGuard],
  exports: [AdminAuthGuard, UserAuthGuard, JwtModule, RedisModule, S3Module, UserModule],
})
export class GlobalModule {}
