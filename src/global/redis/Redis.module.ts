import 'dotenv/config';
import { Module } from '@nestjs/common';
import { GlobalRedisService } from './GlobalRedisService';

@Module({
  providers: [GlobalRedisService],
  exports: [GlobalRedisService],
})
export class RedisModule {}
