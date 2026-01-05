import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver-v2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/AuthService';
import { AuthNaverProfileInvalidException } from '../exception/AuthNaverProfileInvalidException';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // 필수 환경 변수 검증 (Fail-fast)
    const requiredEnvVars = [
      'NAVER_CLIENT_ID',
      'NAVER_CLIENT_SECRET',
      'NAVER_CALLBACK_URL',
      'NAVER_FRONTEND_REDIRECT_URL',
    ] as const;

    const missingVars = requiredEnvVars.filter(
      (key) => !configService.get<string>(key),
    );

    if (missingVars.length > 0) {
      throw new Error(
        `필수 Naver OAuth 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}. ` +
          `.env 파일에 해당 값을 설정해주세요.`,
      );
    }

    super({
      clientID: configService.get<string>('NAVER_CLIENT_ID')!,
      clientSecret: configService.get<string>('NAVER_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('NAVER_CALLBACK_URL')!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    void accessToken;
    void refreshToken;

    // 네이버 프로필 데이터 추출
    const email = profile.email;
    const name = profile.name;
    const profileImage = profile.profile_image;
    const providerId = profile.id;

    // 필수 필드 검증: 이메일, 이름, providerId가 없으면 인증 실패
    if (!email || !name || !providerId) {
      throw new AuthNaverProfileInvalidException();
    }

    const user = await this.authService.validateNaverUser({
      providerId,
      email,
      name,
      picture: profileImage,
    });

    return user;
  }
}
