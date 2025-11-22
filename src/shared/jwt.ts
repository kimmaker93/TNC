/**
 * JWT 유틸리티 함수
 *
 * 주의: 이 파일은 Backend (Vercel Serverless Functions)에서만 사용됩니다.
 * Frontend에서는 절대 JWT_SECRET를 노출하면 안 됩니다.
 */

import jwt from 'jsonwebtoken';
import type { User } from './types';

// JWT Secret (환경 변수에서 가져오기)
// 프로덕션 환경에서는 반드시 안전한 랜덤 문자열로 설정해야 합니다
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// JWT 만료 시간 (7일)
const JWT_EXPIRES_IN = '7d';

/**
 * JWT Payload 인터페이스
 */
export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: 'free' | 'pro';
}

/**
 * JWT 생성
 *
 * @param user - 사용자 정보
 * @returns JWT 토큰
 */
export function generateJWT(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscriptionTier,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'tnc-extension',
    subject: user.id,
  });
}

/**
 * JWT 검증
 *
 * @param token - JWT 토큰
 * @returns 검증된 Payload 또는 null
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'tnc-extension',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('[JWT] Verification failed:', error);
    return null;
  }
}

/**
 * JWT에서 사용자 ID 추출
 *
 * @param token - JWT 토큰
 * @returns 사용자 ID 또는 null
 */
export function getUserIdFromJWT(token: string): string | null {
  const payload = verifyJWT(token);
  return payload?.userId || null;
}

/**
 * JWT 만료 여부 확인
 *
 * @param token - JWT 토큰
 * @returns 만료 여부 (true: 만료됨, false: 유효함)
 */
export function isJWTExpired(token: string): boolean {
  try {
    jwt.verify(token, JWT_SECRET);
    return false;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return true;
    }
    return true; // 다른 에러도 만료로 처리
  }
}
