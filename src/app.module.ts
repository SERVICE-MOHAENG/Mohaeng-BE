import { Module } from '@nestjs/common';
import { AppController } from './domain/app.controller';
import { AppService } from './domain/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
