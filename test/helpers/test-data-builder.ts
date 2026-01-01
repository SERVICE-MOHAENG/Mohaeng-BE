import { SignupRequest } from '../../src/domain/user/presentation/dto/request/SignupRequest';

/**
 * TestDataBuilder
 * @description 테스트용 데이터 생성 유틸리티
 */
export class TestDataBuilder {
  /**
   * 고유한 이메일을 가진 사용자 데이터 생성
   */
  static createUserData(override?: Partial<SignupRequest>): SignupRequest {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);

    return {
      name: override?.name ?? 'Test User',
      email: override?.email ?? `test${timestamp}${random}@example.com`,
      password: override?.password ?? 'Password123!',
      passwordConfirm: override?.passwordConfirm ?? (override?.password ?? 'Password123!'),
    };
  }

  /**
   * 특정 이메일로 사용자 데이터 생성
   */
  static createUserWithEmail(email: string): SignupRequest {
    return this.createUserData({ email });
  }

  /**
   * 비밀번호 불일치 사용자 데이터 생성
   */
  static createUserWithMismatchedPassword(): SignupRequest {
    return this.createUserData({
      password: 'Password123!',
      passwordConfirm: 'DifferentPassword456!',
    });
  }

  /**
   * 유효하지 않은 이메일 형식 데이터 생성
   */
  static createUserWithInvalidEmail(): SignupRequest {
    return this.createUserData({ email: 'not-an-email' });
  }

  /**
   * 짧은 비밀번호 데이터 생성
   */
  static createUserWithShortPassword(): SignupRequest {
    return this.createUserData({
      password: 'short',
      passwordConfirm: 'short',
    });
  }

  /**
   * 긴 이름 데이터 생성 (> 20자)
   */
  static createUserWithLongName(): SignupRequest {
    return this.createUserData({
      name: 'This is a very long name that exceeds twenty characters',
    });
  }
}
