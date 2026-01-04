import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/AuthService';
import { AuthGoogleProfileInvalidException } from '../exception/AuthGoogleProfileInvalidException';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // 필수 환경 변수 검증 (Fail-fast)
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL',
    ] as const;

    const missingVars = requiredEnvVars.filter(
      (key) => !configService.get<string>(key),
    );

    if (missingVars.length > 0) {
      throw new Error(
        `필수 Google OAuth 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}. ` +
          `.env 파일에 해당 값을 설정해주세요.`,
      );
    }

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    void accessToken;
    void refreshToken;
    // 안전한 데이터 추출 (Optional chaining + 기본값)
    const email = profile.emails?.[0]?.value ?? null;
    const givenName = profile.name?.givenName ?? '';
    const familyName = profile.name?.familyName ?? '';
    const picture = profile.photos?.[0]?.value;
    const providerId = profile.id;

    // 필수 필드 검증: 이메일, 이름, providerId가 없으면 인증 실패
    if (!email || !givenName || !providerId) {
      throw new AuthGoogleProfileInvalidException();
    }

    const user = await this.authService.validateGoogleUser({
      providerId,
      email,
      name: givenName + (familyName ? ' ' + familyName : ''),
      picture,
    });

    done(null, user);
  }
}
