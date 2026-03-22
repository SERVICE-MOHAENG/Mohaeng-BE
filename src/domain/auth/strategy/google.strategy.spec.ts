import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from '../service/AuthService';
import { User } from '../../user/entity/User.entity';
import { AuthGoogleProfileInvalidException } from '../exception/AuthGoogleProfileInvalidException';

describe('GoogleStrategy', () => {
  const oauthConfig = {
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret',
    GOOGLE_CALLBACK_URL: 'https://api.mohaeng.kr/api/v1/auth/google/callback',
    GOOGLE_FRONTEND_REDIRECT_URL:
      'https://www.mohaeng.kr/oauth/callback/google',
  };

  const createStrategy = () => {
    const validateGoogleUser = jest.fn();
    const configService = {
      get: (key: string) => oauthConfig[key as keyof typeof oauthConfig],
    } as ConfigService;
    const authService = {
      validateGoogleUser,
    } as unknown as AuthService;

    return {
      strategy: new GoogleStrategy(configService, authService),
      validateGoogleUser,
    };
  };

  it('returns the validated user with a combined google name', async () => {
    const user = { id: 'user-id' } as User;
    const { strategy, validateGoogleUser } = createStrategy();

    validateGoogleUser.mockResolvedValue(user);

    const profile = {
      id: 'google-user-id',
      displayName: 'Travel User',
      name: {
        givenName: 'Travel',
        familyName: 'User',
      },
      emails: [{ value: 'travel@example.com' }],
      photos: [{ value: 'https://cdn.example.com/profile.png' }],
    } as unknown as Profile;

    await expect(
      strategy.validate('access-token', 'refresh-token', profile),
    ).resolves.toBe(user);
    expect(validateGoogleUser).toHaveBeenCalledWith({
      providerId: 'google-user-id',
      email: 'travel@example.com',
      name: 'Travel User',
      picture: 'https://cdn.example.com/profile.png',
    });
  });

  it('falls back to displayName when google givenName is missing', async () => {
    const user = { id: 'user-id' } as User;
    const { strategy, validateGoogleUser } = createStrategy();

    validateGoogleUser.mockResolvedValue(user);

    const profile = {
      id: 'google-user-id',
      displayName: 'Display Name',
      name: {},
      emails: [{ value: 'display@example.com' }],
      photos: [],
    } as unknown as Profile;

    await expect(
      strategy.validate('access-token', 'refresh-token', profile),
    ).resolves.toBe(user);
    expect(validateGoogleUser).toHaveBeenCalledWith({
      providerId: 'google-user-id',
      email: 'display@example.com',
      name: 'Display Name',
      picture: undefined,
    });
  });

  it('falls back to the email local-part when names are missing', async () => {
    const user = { id: 'user-id' } as User;
    const { strategy, validateGoogleUser } = createStrategy();

    validateGoogleUser.mockResolvedValue(user);

    const profile = {
      id: 'google-user-id',
      displayName: '',
      name: {},
      emails: [{ value: 'fallback@example.com' }],
      photos: [],
    } as unknown as Profile;

    await expect(
      strategy.validate('access-token', 'refresh-token', profile),
    ).resolves.toBe(user);
    expect(validateGoogleUser).toHaveBeenCalledWith({
      providerId: 'google-user-id',
      email: 'fallback@example.com',
      name: 'fallback',
      picture: undefined,
    });
  });

  it('throws when the required google email or provider id is missing', async () => {
    const { strategy } = createStrategy();

    const profile = {
      id: '',
      displayName: 'Travel User',
      name: {
        givenName: 'Travel',
      },
      emails: [],
      photos: [],
    } as unknown as Profile;

    await expect(
      strategy.validate('access-token', 'refresh-token', profile),
    ).rejects.toBeInstanceOf(AuthGoogleProfileInvalidException);
  });
});
