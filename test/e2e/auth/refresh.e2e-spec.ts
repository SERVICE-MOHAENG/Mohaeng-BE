import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import type { App } from 'supertest';
import { createHash } from 'crypto';
import { TestDatabaseModule } from '../../config/test-database.module';
import { AuthModule } from '../../../src/domain/auth/AuthModule';
import { UserModule } from '../../../src/domain/user/UserModule';
import { GlobalModule } from '../../../src/global/GlobalModule';
import { GlobalExceptionFilter } from '../../../src/global/filters/GlobalExceptionFilter';
import { ResponseInterceptor } from '../../../src/global/interceptors/ResponseInterceptor';
import { AuthHelper } from '../../helpers/auth-helper';
import { UserRepository } from '../../../src/domain/user/persistence/UserRepository';
import { RefreshTokenRepository } from '../../../src/domain/auth/persistence/RefreshTokenRepository';
import { AuthErrorCode } from '../../../src/domain/auth/exception/code';
import { RefreshTokenStatus } from '../../../src/domain/auth/entity/RefreshTokenStatus.enum';

describe('POST /v1/auth/refresh', () => {
  const getServer = (app: INestApplication): App =>
    app.getHttpServer() as App;

  type AuthTokensBody = {
    accessToken: string;
    refreshToken: string;
  };

  type ErrorResponse = {
    success: boolean;
    errorCode?: string;
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
    it('should return new tokens with valid refresh token', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      const response = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: tokens.refreshToken })
        .expect(200);

      const body = response.body as AuthTokensBody;
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
      expect(body.accessToken).not.toBe(tokens.accessToken);
      expect(body.refreshToken).not.toBe(tokens.refreshToken);
    });

    it('should rotate old token status to ROTATED', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      const oldTokenHash = createHash('sha256')
        .update(tokens.refreshToken)
        .digest('hex');

      await AuthHelper.refreshTokens(app, tokens.refreshToken);

      const oldToken =
        await refreshTokenRepository.findByTokenHash(oldTokenHash);

      expect(oldToken).toBeDefined();
      expect(oldToken!.status).toBe(RefreshTokenStatus.ROTATED);
      expect(oldToken!.rotatedAt).toBeDefined();
    });

    it('should store new token with ACTIVE status', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      const newTokens = await AuthHelper.refreshTokens(
        app,
        tokens.refreshToken,
      );

      const newTokenHash = createHash('sha256')
        .update(newTokens.refreshToken)
        .digest('hex');

      const storedToken =
        await refreshTokenRepository.findByTokenHash(newTokenHash);

      expect(storedToken).toBeDefined();
      expect(storedToken!.status).toBe(RefreshTokenStatus.ACTIVE);
    });
  });

  describe('Failure Cases', () => {
    it('should reject missing refresh token', async () => {
      const response = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
    });

    it('should reject empty refresh token', async () => {
      const response = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: '' })
        .expect(400);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(AuthErrorCode.MISSING_REFRESH_TOKEN);
    });

    it('should reject invalid JWT format', async () => {
      const response = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-jwt-token' })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
    });

    it('should reject non-existent token', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      // Use a valid JWT but not stored in DB
      const fakeToken = tokens.refreshToken.slice(0, -10) + 'aaaaaaaaaa';

      const response = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: fakeToken })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.success).toBe(false);
      expect(body.errorCode).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);
    });
  });

  describe('Security - Token Reuse Detection', () => {
    it('should revoke all user tokens when rotated token is reused', async () => {
      const { tokens, userId } = await AuthHelper.signupAndLogin(app);

      // First refresh (tokens.refreshToken becomes ROTATED)
      const newTokens = await AuthHelper.refreshTokens(
        app,
        tokens.refreshToken,
      );

      // Attacker tries to reuse the rotated token
      const response = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: tokens.refreshToken })
        .expect(401);

      const body = response.body as ErrorResponse;
      expect(body.errorCode).toBe(AuthErrorCode.INVALID_REFRESH_TOKEN);

      // All tokens should be revoked (including newTokens)
      const allUserTokens = await refreshTokenRepository.findAll({
        where: { user: { id: userId } },
      });

      // Check that all tokens are either ROTATED or REVOKED (none are ACTIVE)
      const hasActiveToken = allUserTokens.some(
        (token) => token.status === RefreshTokenStatus.ACTIVE,
      );
      expect(hasActiveToken).toBe(false);

      // New token should not work anymore
      const retryResponse = await request(getServer(app))
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: newTokens.refreshToken })
        .expect(401);

      const retryBody = retryResponse.body as ErrorResponse;
      expect(retryBody.errorCode).toBe(
        AuthErrorCode.INVALID_REFRESH_TOKEN,
      );
    });

    it('should allow normal token rotation before reuse', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      // First rotation
      const tokens2 = await AuthHelper.refreshTokens(app, tokens.refreshToken);

      // Second rotation (should succeed)
      const tokens3 = await AuthHelper.refreshTokens(app, tokens2.refreshToken);

      expect(tokens3.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens3.refreshToken).not.toBe(tokens2.refreshToken);

      // New access token should work
      await AuthHelper.getMe(app, tokens3.accessToken);
    });
  });
});
