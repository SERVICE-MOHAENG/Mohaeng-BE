import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SignupRequest } from '../../src/domain/user/presentation/dto/request/SignupRequest';
import { TestDataBuilder } from './test-data-builder';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type UserData = {
  userData: SignupRequest;
  userId: string;
};

/**
 * AuthHelper
 * @description 인증 관련 테스트 헬퍼 함수
 */
export class AuthHelper {
  /**
   * 회원가입 요청
   */
  static async signupUser(
    app: INestApplication,
    userData: SignupRequest,
  ): Promise<{ userId: string; email: string }> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send(userData)
      .expect(201);

    return {
      userId: response.body.id,
      email: response.body.email,
    };
  }

  /**
   * 로그인 요청
   */
  static async loginUser(
    app: INestApplication,
    email: string,
    password: string,
  ): Promise<AuthTokens> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  /**
   * 회원가입 후 로그인 (편의 메서드)
   */
  static async signupAndLogin(
    app: INestApplication,
    userDataOverride?: Partial<SignupRequest>,
  ): Promise<{ tokens: AuthTokens; userData: SignupRequest; userId: string }> {
    const userData = TestDataBuilder.createUserData(userDataOverride);

    const { userId } = await this.signupUser(app, userData);
    const tokens = await this.loginUser(app, userData.email, userData.password);

    return { tokens, userData, userId };
  }

  /**
   * Bearer 인증 헤더 생성
   */
  static createAuthHeader(accessToken: string): string {
    return `Bearer ${accessToken}`;
  }

  /**
   * 토큰 갱신 요청
   */
  static async refreshTokens(
    app: INestApplication,
    refreshToken: string,
  ): Promise<AuthTokens> {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  /**
   * 내 정보 조회 요청
   */
  static async getMe(
    app: INestApplication,
    accessToken: string,
  ): Promise<{ id: string; email: string }> {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', this.createAuthHeader(accessToken))
      .expect(200);

    return response.body;
  }
}
