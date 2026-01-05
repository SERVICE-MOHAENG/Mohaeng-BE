import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../service/AuthService';
import { AuthKakaoProfileInvalidException } from '../exception/AuthKakaoProfileInvalidException';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // 필수 환경 변수 검증 (Fail-fast)
    const requiredEnvVars = [
      'KAKAO_CLIENT_ID',
      'KAKAO_CLIENT_SECRET',
      'KAKAO_CALLBACK_URL',
      'KAKAO_FRONTEND_REDIRECT_URL',
    ] as const;

    const missingVars = requiredEnvVars.filter(
      (key) => !configService.get<string>(key),
    );

    if (missingVars.length > 0) {
      throw new Error(
        `필수 Kakao OAuth 환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}. ` +
          `.env 파일에 해당 값을 설정해주세요.`,
      );
    }

    super({
      clientID: configService.get<string>('KAKAO_CLIENT_ID')!,
      clientSecret: configService.get<string>('KAKAO_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('KAKAO_CALLBACK_URL')!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<void> {
    void accessToken;
    void refreshToken;

    // 카카오 프로필 데이터 추출
    const email = profile._json?.kakao_account?.email;
    const nickname = profile._json?.kakao_account?.profile?.nickname;
    const profileImage = profile._json?.kakao_account?.profile?.profile_image_url;
    const providerId = profile.id;

    // 필수 필드 검증: 이메일, 이름, providerId가 없으면 인증 실패
    if (!email || !nickname || !providerId) {
      throw new AuthKakaoProfileInvalidException();
    }

    const user = await this.authService.validateKakaoUser({
      providerId,
      email,
      name: nickname,
      picture: profileImage,
    });

    done(null, user);
  }
}
