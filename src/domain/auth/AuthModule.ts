import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '../../global/jwt/Jwt.module';
import { RefreshToken } from '../user/entity/RefreshToken.entity';
import { User } from '../user/entity/User.entity';
import { UserModule } from '../user/UserModule';
import { AuthController } from './presentation/AuthController';
import { AuthService } from './service/AuthService';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken]), JwtModule, UserModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
