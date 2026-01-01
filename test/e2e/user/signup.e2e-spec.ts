import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService, ConfigModule } from '@nestjs/config';
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
import { UserErrorCode } from '../../../src/domain/user/exception/code';

describe('POST /v1/users (Signup)', () => {
  let app: INestApplication;
  let userRepository: UserRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TestDatabaseModule,
        AuthModule,
        UserModule,
        GlobalModule,
      ],
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

    // Apply global filters, interceptors, and pipes
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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await userRepository.clear();
  });

  describe('Success Cases', () => {
    it('should create user with valid data', async () => {
      const userData = TestDataBuilder.createUserData();

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        isActivate: true,
        createdAt: expect.any(String),
      });

      // Password should not be in response
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should hash password before storing in database', async () => {
      const userData = TestDataBuilder.createUserData({ password: 'PlainTextPassword123!' });

      const { userId } = await AuthHelper.signupUser(app, userData);

      const user = await userRepository.findById(userId);

      expect(user).toBeDefined();
      expect(user!.passwordHash).toBeDefined();
      expect(user!.passwordHash).not.toBe('PlainTextPassword123!');
      expect(user!.passwordHash!.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should set isActivate to true by default', async () => {
      const userData = TestDataBuilder.createUserData();

      const { userId } = await AuthHelper.signupUser(app, userData);

      const user = await userRepository.findById(userId);

      expect(user).toBeDefined();
      expect(user!.isActivate).toBe(true);
    });
  });

  describe('Failure Cases - Validation', () => {
    it('should reject duplicate email', async () => {
      const userData = TestDataBuilder.createUserData();

      // First signup succeeds
      await AuthHelper.signupUser(app, userData);

      // Second signup with same email fails
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(UserErrorCode.EMAIL_ALREADY_EXISTS);
    });

    it('should reject password mismatch', async () => {
      const userData = TestDataBuilder.createUserWithMismatchedPassword();

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe(UserErrorCode.PASSWORD_MISMATCH);
    });

    it('should reject invalid email format', async () => {
      const userData = TestDataBuilder.createUserWithInvalidEmail();

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject short password (less than 8 characters)', async () => {
      const userData = TestDataBuilder.createUserWithShortPassword();

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject long name (more than 20 characters)', async () => {
      const userData = TestDataBuilder.createUserWithLongName();

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject empty name', async () => {
      const userData = TestDataBuilder.createUserData({ name: '' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject empty email', async () => {
      const userData = TestDataBuilder.createUserData({ email: '' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/users')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
