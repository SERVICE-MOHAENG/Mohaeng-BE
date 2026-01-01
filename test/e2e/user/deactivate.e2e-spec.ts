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
import { AuthHelper } from '../../helpers/auth-helper';
import { UserRepository } from '../../../src/domain/user/persistence/UserRepository';
import { RefreshTokenRepository } from '../../../src/domain/auth/persistence/RefreshTokenRepository';
import { UserErrorCode } from '../../../src/domain/user/exception/code';

describe('DELETE /v1/users/me (Deactivate)', () => {
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

  describe('Success Cases', () => {
    it('should deactivate user with valid token', async () => {
      const { tokens } = await AuthHelper.signupAndLogin(app);

      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', AuthHelper.createAuthHeader(tokens.accessToken))
        .expect(204);
    });

    it('should set isActivate to false (soft delete)', async () => {
      const { tokens, userId } = await AuthHelper.signupAndLogin(app);

      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', AuthHelper.createAuthHeader(tokens.accessToken))
        .expect(204);

      const user = await userRepository.findById(userId);

      expect(user).toBeDefined();
      expect(user!.isActivate).toBe(false);
    });

    it('should prevent login after deactivation', async () => {
      const { tokens, userData } = await AuthHelper.signupAndLogin(app);

      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', AuthHelper.createAuthHeader(tokens.accessToken))
        .expect(204);

      // Try to login
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(403);

      expect(response.body.errorCode).toBe(UserErrorCode.USER_NOT_ACTIVE);
    });
  });

  describe('Failure Cases', () => {
    it('should reject missing authorization token', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .expect(401);
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
