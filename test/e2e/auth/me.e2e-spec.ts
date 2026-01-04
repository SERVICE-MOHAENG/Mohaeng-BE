import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import type { App } from 'supertest';
import { TestDatabaseModule } from '../../config/test-database.module';
import { AuthModule } from '../../../src/domain/auth/AuthModule';
import { UserModule } from '../../../src/domain/user/UserModule';
import { GlobalModule } from '../../../src/global/GlobalModule';
import { GlobalExceptionFilter } from '../../../src/global/filters/GlobalExceptionFilter';
import { ResponseInterceptor } from '../../../src/global/interceptors/ResponseInterceptor';
import { AuthHelper } from '../../helpers/auth-helper';
import { UserRepository } from '../../../src/domain/user/persistence/UserRepository';
import { RefreshTokenRepository } from '../../../src/domain/auth/persistence/RefreshTokenRepository';

describe('GET /v1/auth/me', () => {
  const getServer = (app: INestApplication): App =>
    app.getHttpServer() as App;

  type ErrorResponse = {
    success: boolean;
  };

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
    refreshTokenRepository = moduleFixture.get<RefreshTokenRepository>(
      RefreshTokenRepository,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await refreshTokenRepository.clear();
    await userRepository.clear();
  });

  describe('Success Cases', () => {
    it('should return user info with valid access token', async () => {
      const { tokens, userId, userData } = await AuthHelper.signupAndLogin(app);

      const response = await request(getServer(app))
        .get('/api/v1/auth/me')
        .set('Authorization', AuthHelper.createAuthHeader(tokens.accessToken))
        .expect(200);

      const body = response.body as { id: string; email: string };
      expect(body).toMatchObject({
        id: userId,
        email: userData.email,
      });
    });

    it('should return different user info for different tokens', async () => {
      const user1 = await AuthHelper.signupAndLogin(app);
      const user2 = await AuthHelper.signupAndLogin(app);

      const me1 = await AuthHelper.getMe(app, user1.tokens.accessToken);
      const me2 = await AuthHelper.getMe(app, user2.tokens.accessToken);

      expect(me1.id).toBe(user1.userId);
      expect(me2.id).toBe(user2.userId);
      expect(me1.id).not.toBe(me2.id);
    });
  });

  describe('Failure Cases', () => {
    it('should reject missing Authorization header', async () => {
      const response = await request(getServer(app))
        .get('/api/v1/auth/me')
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });

    it('should reject invalid token format', async () => {
      const response = await request(getServer(app))
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });

    it('should reject missing Bearer scheme', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      const response = await request(getServer(app))
        .get('/api/v1/auth/me')
        .set('Authorization', tokens.accessToken)
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });

    it('should reject refresh token instead of access token', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      const response = await request(getServer(app))
        .get('/api/v1/auth/me')
        .set('Authorization', AuthHelper.createAuthHeader(tokens.refreshToken))
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });
  });
});
