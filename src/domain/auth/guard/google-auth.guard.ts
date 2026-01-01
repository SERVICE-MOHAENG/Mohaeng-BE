import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// "google" Passport 전략을 사용하며, 보호된 라우트 접근 시 GoogleStrategy.validate가 실행됨
export class GoogleAuthGuard extends AuthGuard('google') {}
