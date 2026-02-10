import { Injectable } from '@nestjs/common';
import { LogInterceptorService } from '../../../global/logger/LogInterceptorService';
import { DiscordService } from '../../../global/logger/DiscordService';

export type ErrorLog = {
  // TODO: 퍼시스턴스 레이어 준비 후 실제 엔티티로 교체
  id: string;
  endpoint: string;
  method: string;
  clientIp: string;
  statusCode: number;
  userAgent?: string;
  message: string;
  stack?: string;
};

@Injectable()
export class ErrorLogService {
  private readonly logger = new LogInterceptorService();

  constructor(private readonly discordService: DiscordService) {}

  async logError(data: {
    endpoint: string;
    method: string;
    clientIp: string;
    error: Error;
    statusCode: number;
    userAgent?: string;
  }): Promise<ErrorLog> {
    // TODO: DB 저장 구현 후 저장된 ErrorLog 엔티티 반환
    this.logger.debug('ErrorLogService.logError called.');

    const messageLines = [
      `Endpoint: ${data.endpoint}`,
      `Method: ${data.method}`,
      `Status: ${data.statusCode}`,
      `Client IP: ${data.clientIp}`,
      `User Agent: ${data.userAgent || 'unknown'}`,
      `Error: ${data.error.message}`,
    ];

    await this.discordService.sendError(
      messageLines.join('\n'),
      data.endpoint,
      data.error.stack,
    );

    return {
      id: 'discord',
      endpoint: data.endpoint,
      method: data.method,
      clientIp: data.clientIp,
      statusCode: data.statusCode,
      userAgent: data.userAgent,
      message: data.error.message,
      stack: data.error.stack,
    };
  }
}
