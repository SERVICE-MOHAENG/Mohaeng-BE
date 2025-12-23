import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './global/logger/Logger.module';
import {GlobalModule} from "./global/GlobalModule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
      LoggerModule,
      GlobalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
