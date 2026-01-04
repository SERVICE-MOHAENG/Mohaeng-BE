import { Global, Module } from '@nestjs/common';
import { UserModule } from '../domain/user/UserModule';
import { JwtModule } from './jwt/Jwt.module';
import { RedisModule } from './redis/Redis.module';
import { AdminAuthGuard } from './guards/AdminAuth.guard';
import { UserAuthGuard } from './guards/UserAuth.guard';

@Global()
@Module({
  imports: [JwtModule, RedisModule, UserModule],
  controllers: [],
  providers: [AdminAuthGuard, UserAuthGuard],
  exports: [AdminAuthGuard, UserAuthGuard, JwtModule, RedisModule],
})
export class GlobalModule {}
