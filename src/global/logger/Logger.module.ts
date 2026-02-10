import { Module, OnModuleInit } from '@nestjs/common';
import { DiscordService } from './DiscordService';
import { LogInterceptorService } from './LogInterceptorService';
import { ErrorLogService } from '../../domain/logging/service/ErrorLogService';

@Module({
  providers: [DiscordService, LogInterceptorService, ErrorLogService],
  exports: [DiscordService, LogInterceptorService, ErrorLogService],
})
export class LoggerModule implements OnModuleInit {
  constructor(
    private readonly discordService: DiscordService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  onModuleInit() {
    LogInterceptorService.setServices(
      this.discordService,
      this.errorLogService,
    );
  }
}
