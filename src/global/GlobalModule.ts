import { Global, Module } from '@nestjs/common';
import { UserModule } from '../domain/user/UserModule';
import { JwtModule } from './jwt/Jwt.module';
import { AdminAuthGuard } from './guards/AdminAuth.guard';
import { UserAuthGuard } from './guards/UserAuth.guard';

@Global()
@Module({
  imports: [JwtModule, UserModule],
  controllers: [],
  providers: [AdminAuthGuard, UserAuthGuard],
  exports: [AdminAuthGuard, UserAuthGuard, JwtModule],
})
export class GlobalModule {}
