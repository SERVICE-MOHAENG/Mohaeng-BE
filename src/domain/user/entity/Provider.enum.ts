/**
 * Provider Enum
 * @description
 * - 사용자 인증 제공자 구분
 * - LOCAL: 일반 회원가입
 * - KAKAO: 카카오 OAuth
 * - NAVER: 네이버 OAuth
 * - GOOGLE: 구글 OAuth
 */
export enum Provider {
  LOCAL = 'LOCAL',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  GOOGLE = 'GOOGLE',
}
