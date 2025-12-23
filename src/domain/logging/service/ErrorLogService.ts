import { Injectable} from '@nestjs/common';
import {LogInterceptorService} from "../../../global/logger/LogInterceptorService";

export interface ErrorLog {
  // TODO: 퍼시스턴스 레이어 준비 후 실제 엔티티로 교체
}

@Injectable()
export class ErrorLogService {
    private readonly logger = new LogInterceptorService();

  async logError(_data: {
    endpoint: string;
    method: string;
    clientIp: string;
    error: Error;
    statusCode: number;
    userAgent?: string;
  }): Promise<ErrorLog> {
    // TODO: DB 저장 구현 후 저장된 ErrorLog 엔티티 반환
    this.logger.debug('ErrorLogService.logError called (stub).');
    return {} as ErrorLog;
  }
}
