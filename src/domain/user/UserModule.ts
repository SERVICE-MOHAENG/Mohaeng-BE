import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/User.entity';
import { RefreshToken } from './entity/RefreshToken.entity';
import { UserService } from './service/UserService';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
