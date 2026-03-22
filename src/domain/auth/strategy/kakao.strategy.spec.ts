import { ConfigService } from '@nestjs/config';
import { KakaoStrategy } from './kakao.strategy';
import { AuthService } from '../service/AuthService';
import { User } from '../../user/entity/User.entity';
import { AuthKakaoProfileInvalidException } from '../exception/AuthKakaoProfileInvalidException';

describe('KakaoStrategy', () => {
  const oauthConfig = {
    KAKAO_CLIENT_ID: 'kakao-client-id',
    KAKAO_CLIENT_SECRET: 'kakao-client-secret',
    KAKAO_CALLBACK_URL: 'https://api.mohaeng.kr/api/v1/auth/kakao/callback',
    KAKAO_FRONTEND_REDIRECT_URL:
      'https://www.mohaeng.kr/oauth/callback/kakao',
  };

  const createStrategy = () => {
    const validateKakaoUser = jest.fn();
    const configService = {
      get: (key: string) => oauthConfig[key as keyof typeof oauthConfig],
    } as ConfigService;
    const authService = {
      validateKakaoUser,
    } as unknown as AuthService;

    return {
      strategy: new KakaoStrategy(configService, authService),
      validateKakaoUser,
    };
  };

  it('returns the validated kakao user', async () => {
    const user = { id: 'user-id' } as User;
    const { strategy, validateKakaoUser } = createStrategy();

    validateKakaoUser.mockResolvedValue(user);

    const profile = {
      id: 'kakao-user-id',
      _json: {
        kakao_account: {
          email: 'travel@example.com',
          profile: {
            nickname: 'Travel User',
            profile_image_url: 'https://cdn.example.com/profile.png',
          },
        },
      },
    };

    await expect(
      strategy.validate('access-token', 'refresh-token', profile),
    ).resolves.toBe(user);
    expect(validateKakaoUser).toHaveBeenCalledWith({
      providerId: 'kakao-user-id',
      email: 'travel@example.com',
      name: 'Travel User',
      picture: 'https://cdn.example.com/profile.png',
    });
  });

  it('throws when the required kakao profile fields are missing', async () => {
    const { strategy } = createStrategy();

    await expect(
      strategy.validate('access-token', 'refresh-token', {
        id: '',
        _json: {
          kakao_account: {
            profile: {},
          },
        },
      }),
    ).rejects.toBeInstanceOf(AuthKakaoProfileInvalidException);
  });
});
