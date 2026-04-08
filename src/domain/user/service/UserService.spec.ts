import { UserService } from './UserService';
import { EmailAlreadyExistsException } from '../exception/EmailAlreadyExistsException';

describe('UserService', () => {
  const createService = (
    userRepositoryOverrides: Record<string, jest.Mock> = {},
    redisServiceOverrides: Record<string, jest.Mock> = {},
  ) => {
    const userRepository = {
      findByEmail: jest.fn(),
      save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
      findById: jest.fn(),
      softDelete: jest.fn(),
      ...userRepositoryOverrides,
    };

    const redisService = {
      get: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      ...redisServiceOverrides,
    };

    const service = new UserService(userRepository as any, redisService as any);

    return {
      service,
      userRepository,
      redisService,
    };
  };

  it('normalizes mixed-case email before saving a new signup', async () => {
    const { service, userRepository, redisService } = createService(
      {
        findByEmail: jest.fn().mockResolvedValue(null),
      },
      {
        get: jest.fn().mockResolvedValue('1'),
      },
    );

    const result = await service.signup({
      name: '홍길동',
      email: ' User@Example.com ',
      password: 'P@ssw0rd!',
      passwordConfirm: 'P@ssw0rd!',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
      }),
    );
    expect(redisService.delete).toHaveBeenCalledWith(
      'auth:email-verified:user@example.com',
    );
    expect(result.email).toBe('user@example.com');
  });

  it('rejects signup when a deactivated account already exists for the email', async () => {
    const existingUser = {
      id: 'user-id',
      name: '기존 사용자',
      email: 'Old@Example.com',
      passwordHash: null,
      isActivate: false,
    };
    const { service, userRepository } = createService(
      {
        findByEmail: jest.fn().mockResolvedValue(existingUser),
      },
      {
        get: jest.fn().mockResolvedValue('1'),
      },
    );

    await expect(
      service.signup({
        name: '복구 사용자',
        email: ' User@Example.com ',
        password: 'P@ssw0rd!',
        passwordConfirm: 'P@ssw0rd!',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsException);
  });

  it('normalizes email before lookup', async () => {
    const user = {
      id: 'user-id',
      email: 'user@example.com',
      isActivate: true,
    };
    const { service, userRepository } = createService({
      findByEmail: jest.fn().mockResolvedValue(user),
    });

    await service.findByEmail(' User@Example.com ');

    expect(userRepository.findByEmail).toHaveBeenCalledWith('user@example.com');
  });
});
