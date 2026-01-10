import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
import type { App } from 'supertest';
import { createHash } from 'crypto';
import { TestDatabaseModule } from '../../config/test-database.module';
import { AuthModule } from '../../../src/domain/auth/AuthModule';
import { UserModule } from '../../../src/domain/user/UserModule';
import { GlobalModule } from '../../../src/global/GlobalModule';
import { GlobalExceptionFilter } from '../../../src/global/filters/GlobalExceptionFilter';
import { ResponseInterceptor } from '../../../src/global/interceptors/ResponseInterceptor';
import { TestDataBuilder } from '../../helpers/test-data-builder';
import { AuthHelper } from '../../helpers/auth-helper';
import { UserRepository } from '../../../src/domain/user/persistence/UserRepository';
import { GlobalRedisService } from '../../../src/global/redis/GlobalRedisService';
import { AuthErrorCode } from '../../../src/domain/auth/exception/code';
import { UserErrorCode } from '../../../src/domain/user/exception/code';

describe('POST /v1/auth/login', () => {
  const getServer = (app: INestApplication): App =>
    app.getHttpServer() as App;

  type JwtPayload = {
    userId: string;
    email: string;
    sub: string;
    iat: number;
    exp: number;
  };

  type ErrorResponse = {
    success: boolean;
    errorCode?: string;
  };

  let app: INestApplication;
  let userRepository: UserRepository;
  let redisService: GlobalRedisService;
  let jwtService: JwtService;

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
    redisService = moduleFixture.get<GlobalRedisService>(GlobalRedisService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Redis의 모든 refresh token 키 삭제
    const keys = await redisService.keys('refresh:*');
    for (const key of keys) {
      await redisService.delete(key);
    }
    await userRepository.clear();
  });

  describe('Success Cases', () => {
    it('should return tokens with valid credentials', async () => {
      const userData = TestDataBuilder.createUserData();
      await AuthHelper.signupUser(app, userData);

      const response = await request(getServer(app))
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      const body = response.body as { accessToken: string; refreshToken: string };
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.refreshToken).toBe('string');
    });

    it('should include correct JWT payload in access token', async () => {
      const { tokens, userId } = await AuthHelper.signupAndLogin(app);

      const decoded = jwtService.decode<JwtPayload>(tokens.accessToken);
      if (!decoded || typeof decoded === 'string') {
        throw new Error('Invalid token payload');
      }

      expect(decoded).toHaveProperty('userId', userId);
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('sub', userId);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should store hashed refresh token in Redis', async () => {
      const { tokens, userId } = await AuthHelper.signupAndLogin(app);

      const tokenHash = createHash('sha256')
        .update(tokens.refreshToken)
        .digest('hex');

      const storedToken = await redisService.get(
        `refresh:valid:${tokenHash}`,
      );

      expect(storedToken).toBeDefined();
      const tokenData = JSON.parse(storedToken!);
      expect(tokenData.userId).toBe(userId);
    });

    it('should allow multiple logins from same user', async () => {
      const userData = TestDataBuilder.createUserData();
      await AuthHelper.signupUser(app, userData);

      // First login
      const tokens1 = await AuthHelper.loginUser(
        app,
        userData.email,
        userData.password,
      );

      // Second login
      const tokens2 = await AuthHelper.loginUser(
        app,
        userData.email,
        userData.password,
      );

      // Both tokens should be different
      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);

      // Both should be valid
      await AuthHelper.getMe(app, tokens1.accessToken);
      await AuthHelper.getMe(app, tokens2.accessToken);
    });
  });

  describe('Failure Cases', () => {
    it('should reject wrong password', async () => {
      const userData = TestDataBuilder.createUserData();
      await AuthHelper.signupUser(app, userData);

      const response = await request(getServer(app))
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it('should reject non-existent user', async () => {
      const response = await request(getServer(app))
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it('should reject inactive user', async () => {
      const { userData, userId } = await AuthHelper.signupAndLogin(app);

      // Deactivate user
      await userRepository.softDelete(userId);

      const response = await request(getServer(app))
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(403);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(UserErrorCode.USER_NOT_ACTIVE);
    });

    it('should reject invalid email format', async () => {
      const response = await request(getServer(app))
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
        })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const response = await request(getServer(app))
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
    });
  });
});
