import { AuthService } from './AuthService';
import { AuthEmailOtpPurpose } from '../presentation/dto/request/AuthEmailOtpPurpose.enum';
import { Provider } from '../../user/entity/Provider.enum';
import { AuthPasswordResetNotAvailableException } from '../exception/AuthPasswordResetNotAvailableException';
import { AuthPasswordResetNotVerifiedException } from '../exception/AuthPasswordResetNotVerifiedException';

describe('AuthService', () => {
  const createService = () => {
    const oauthCodeRepository = {
      generateCode: jest.fn(),
      save: jest.fn(),
      findAndDelete: jest.fn(),
    };
    const userService = {
      findByEmail: jest.fn(),
      verifyPassword: jest.fn(),
      updatePassword: jest.fn(),
    };
    const userRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };
    const jwtService = {
      verify: jest.fn(),
      sign: jest.fn(),
    };
    const configService = {
      get: jest.fn(),
    };
    const globalJwtService = {
      signUserToken: jest.fn(),
    };
    const emailOtpService = {
      sendOtp: jest.fn(),
    };
    const redisService = {
      exists: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      setWithExpiry: jest.fn(),
      increment: jest.fn(),
      expire: jest.fn(),
      deletePattern: jest.fn(),
      keys: jest.fn(),
    };

    const service = new AuthService(
      oauthCodeRepository as any,
      userService as any,
      userRepository as any,
      jwtService as any,
      configService as any,
      globalJwtService as any,
      emailOtpService as any,
      redisService as any,
    );

    return {
      service,
      userService,
      userRepository,
      emailOtpService,
      redisService,
    };
  };

  it('sends password reset OTP for active local users', async () => {
    const { service, userRepository, emailOtpService, redisService } =
      createService();
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      provider: Provider.LOCAL,
      passwordHash: 'hashed',
      isActivate: true,
    });
    redisService.exists.mockResolvedValue(false);
    redisService.get.mockResolvedValue(null);
    redisService.increment.mockResolvedValue(1);

    const result = await service.sendEmailOtp(
      'User@Example.com',
      AuthEmailOtpPurpose.PASSWORD_RESET,
    );

    expect(result).toEqual({ sent: true, isActivate: true });
    expect(emailOtpService.sendOtp).toHaveBeenCalledWith(
      'user@example.com',
      expect.stringMatching(/^\d{6}$/),
    );
    expect(redisService.setWithExpiry).toHaveBeenCalledWith(
      'auth:password-reset:otp:user@example.com',
      expect.stringMatching(/^\d{6}$/),
      300,
    );
  });

  it('rejects password reset OTP for social accounts', async () => {
    const { service, userRepository } = createService();
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      provider: Provider.GOOGLE,
      passwordHash: null,
      isActivate: true,
    });

    await expect(
      service.sendEmailOtp(
        'user@example.com',
        AuthEmailOtpPurpose.PASSWORD_RESET,
      ),
    ).rejects.toBeInstanceOf(AuthPasswordResetNotAvailableException);
  });

  it('stores a password reset verified flag after OTP verification', async () => {
    const { service, userRepository, redisService } = createService();
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      provider: Provider.LOCAL,
      passwordHash: 'hashed',
      isActivate: true,
    });
    redisService.get
      .mockResolvedValueOnce('123456')
      .mockResolvedValueOnce(null);

    const verified = await service.verifyEmailOtp(
      'user@example.com',
      '123456',
      AuthEmailOtpPurpose.PASSWORD_RESET,
    );

    expect(verified).toBe(true);
    expect(redisService.setWithExpiry).toHaveBeenCalledWith(
      'auth:password-reset:verified:user@example.com',
      '1',
      600,
    );
  });

  it('rejects password reset when email verification is missing', async () => {
    const { service, userService, redisService } = createService();
    userService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      provider: Provider.LOCAL,
      passwordHash: 'hashed',
      isActivate: true,
    });
    redisService.get.mockResolvedValue(null);

    await expect(
      service.resetPassword('user@example.com', 'NewP@ssw0rd!', 'NewP@ssw0rd!'),
    ).rejects.toBeInstanceOf(AuthPasswordResetNotVerifiedException);
  });

  it('updates the password and revokes refresh tokens after reset', async () => {
    const { service, userService, redisService } = createService();
    userService.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      provider: Provider.LOCAL,
      passwordHash: 'hashed',
      isActivate: true,
    });
    redisService.get.mockResolvedValue('1');
    userService.updatePassword.mockResolvedValue(undefined);
    redisService.delete.mockResolvedValue(undefined);
    redisService.deletePattern.mockResolvedValue(undefined);

    const result = await service.resetPassword(
      'User@Example.com',
      'NewP@ssw0rd!',
      'NewP@ssw0rd!',
    );

    expect(result).toBe(true);
    expect(userService.updatePassword).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user-id' }),
      'NewP@ssw0rd!',
      'NewP@ssw0rd!',
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      'auth:password-reset:verified:user@example.com',
    );
    expect(redisService.deletePattern).toHaveBeenCalledWith(
      'refresh:user:user-id:*',
    );
  });
});
