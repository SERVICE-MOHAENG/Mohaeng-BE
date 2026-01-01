import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as request from 'supertest';
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
import { RefreshTokenRepository } from '../../../src/domain/auth/persistence/RefreshTokenRepository';
import { AuthErrorCode } from '../../../src/domain/auth/exception/code';
import { UserErrorCode } from '../../../src/domain/user/exception/code';
import { RefreshTokenStatus } from '../../../src/domain/auth/entity/RefreshTokenStatus.enum';

describe('POST /v1/auth/login', () => {
  let app: INestApplication;
  let userRepository: UserRepository;
  let refreshTokenRepository: RefreshTokenRepository;
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
    refreshTokenRepository = moduleFixture.get<RefreshTokenRepository>(RefreshTokenRepository);
    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await refreshTokenRepository.clear();
    await userRepository.clear();
  });

  describe('Success Cases', () => {
    it('should return tokens with valid credentials', async () => {
      const userData = TestDataBuilder.createUserData();
      await AuthHelper.signupUser(app, userData);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('should include correct JWT payload in access token', async () => {
      const { tokens, userId } = await AuthHelper.signupAndLogin(app);

      const decoded = jwtService.decode(tokens.accessToken) as any;

      expect(decoded).toHaveProperty('userId', userId);
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('sub', userId);
      expect(decoded).toHaveProperty('iat');
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should store hashed refresh token in database', async () => {
      const { tokens, userId } = await AuthHelper.signupAndLogin(app);

      const tokenHash = createHash('sha256')
        .update(tokens.refreshToken)
        .digest('hex');

      const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);

      expect(storedToken).toBeDefined();
      expect(storedToken!.status).toBe(RefreshTokenStatus.ACTIVE);
      expect(storedToken!.user.id).toBe(userId);
    });

    it('should allow multiple logins from same user', async () => {
      const userData = TestDataBuilder.createUserData();
      await AuthHelper.signupUser(app, userData);

      // First login
      const tokens1 = await AuthHelper.loginUser(app, userData.email, userData.password);

      // Second login
      const tokens2 = await AuthHelper.loginUser(app, userData.email, userData.password);

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

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it('should reject inactive user', async () => {
      const { userData, userId } = await AuthHelper.signupAndLogin(app);

      // Deactivate user
      await userRepository.softDelete(userId);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(UserErrorCode.USER_NOT_ACTIVE);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
