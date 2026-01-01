import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { TestDatabaseModule } from '../../config/test-database.module';
import { AuthModule } from '../../../src/domain/auth/AuthModule';
import { UserModule } from '../../../src/domain/user/UserModule';
import { GlobalModule } from '../../../src/global/GlobalModule';
import { GlobalExceptionFilter } from '../../../src/global/filters/GlobalExceptionFilter';
import { ResponseInterceptor } from '../../../src/global/interceptors/ResponseInterceptor';
import { TestDataBuilder } from '../../helpers/test-data-builder';
import { AuthHelper } from '../../helpers/auth-helper';
import { UserRepository } from '../../../src/domain/user/persistence/UserRepository';
import { RefreshTokenRepository } from '../../../src/domain/auth/persistence/RefreshTokenRepository';
import { UserErrorCode } from '../../../src/domain/user/exception/code';
import { RefreshTokenStatus } from '../../../src/domain/auth/entity/RefreshTokenStatus.enum';

describe('Integration: User Authentication Flow', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestDatabaseModule, AuthModule, UserModule, GlobalModule],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          const config: Record<string, string> = {
            JWT_ACCESS_SECRET: 'test-access-secret-key',
            JWT_ACCESS_EXPIRY: '15m',
            JWT_REFRESH_TOKEN_SECRET: 'test-refresh-secret-key',
            JWT_REFRESH_TOKEN_EXPIRES_IN: '7d',
            NODE_ENV: 'test',
          };
          return config[key];
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.setGlobalPrefix('api');

    await app.init();

    userRepository = moduleFixture.get<UserRepository>(UserRepository);
    refreshTokenRepository = moduleFixture.get<RefreshTokenRepository>(RefreshTokenRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await refreshTokenRepository.clear();
    await userRepository.clear();
  });

  it('should complete full user lifecycle: signup → login → get me → refresh → deactivate', async () => {
    const userData = TestDataBuilder.createUserData();

    // 1. Signup
    const signupResponse = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(userData)
      .expect(201);

    const userId = signupResponse.body.id;

    // 2. Login
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(200);

    const tokens = {
      accessToken: loginResponse.body.accessToken,
      refreshToken: loginResponse.body.refreshToken,
    };

    // 3. Get /me
    const meResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', AuthHelper.createAuthHeader(tokens.accessToken))
      .expect(200);

    expect(meResponse.body.id).toBe(userId);
    expect(meResponse.body.email).toBe(userData.email);

    // 4. Refresh tokens
    const refreshResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(200);

    const newTokens = {
      accessToken: refreshResponse.body.accessToken,
      refreshToken: refreshResponse.body.refreshToken,
    };

    expect(newTokens.accessToken).not.toBe(tokens.accessToken);
    expect(newTokens.refreshToken).not.toBe(tokens.refreshToken);

    // 5. Get /me with new token
    const meResponse2 = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', AuthHelper.createAuthHeader(newTokens.accessToken))
      .expect(200);

    expect(meResponse2.body.id).toBe(userId);

    // 6. Deactivate
    await request(app.getHttpServer())
      .delete('/api/v1/users/me')
      .set('Authorization', AuthHelper.createAuthHeader(newTokens.accessToken))
      .expect(204);

    // 7. Try to login after deactivation (should fail)
    const loginAfterDeactivation = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(403);

    expect(loginAfterDeactivation.body.errorCode).toBe(UserErrorCode.USER_NOT_ACTIVE);
  });

  it('should isolate multiple users', async () => {
    const user1 = await AuthHelper.signupAndLogin(app);
    const user2 = await AuthHelper.signupAndLogin(app);

    const me1 = await AuthHelper.getMe(app, user1.tokens.accessToken);
    const me2 = await AuthHelper.getMe(app, user2.tokens.accessToken);

    expect(me1.id).toBe(user1.userId);
    expect(me2.id).toBe(user2.userId);
    expect(me1.email).toBe(user1.userData.email);
    expect(me2.email).toBe(user2.userData.email);
  });

  it('should detect and prevent refresh token reuse attack', async () => {
    const { tokens, userId } = await AuthHelper.signupAndLogin(app);

    // Normal refresh
    const newTokens = await AuthHelper.refreshTokens(app, tokens.refreshToken);

    // Attacker tries to reuse old refresh token
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tokens.refreshToken })
      .expect(401);

    // All user tokens should be revoked
    const activeTokens = await refreshTokenRepository.count({
      where: { user: { id: userId }, status: RefreshTokenStatus.ACTIVE },
    });

    expect(activeTokens).toBe(0);

    // New token should not work
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: newTokens.refreshToken })
      .expect(401);
  });
});
