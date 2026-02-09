import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InvalidCallbackSecretException } from '../exception/InvalidCallbackSecretException';

/**
 * ServiceSecretGuard
 * @description
 * - 내부 서비스 간 통신 인증 가드
 * - x-service-secret 헤더 검증
 * - Python LLM 서버 콜백 엔드포인트 전용
 */
@Injectable()
export class ServiceSecretGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const secret = request.headers['x-service-secret'];
    const expectedSecret = this.configService.get<string>('SERVICE_SECRET');

    if (!secret || secret !== expectedSecret) {
      throw new InvalidCallbackSecretException();
    }

    return true;
  }
}
