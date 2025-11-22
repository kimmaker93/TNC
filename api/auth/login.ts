/**
 * POST /api/auth/login
 *
 * Google OAuth Token을 받아 사용자 정보를 검증하고 JWT를 발급합니다.
 *
 * Request Body:
 * {
 *   "googleToken": "ya29.xxx..."
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "jwt": "eyJhbGci...",
 *   "user": {
 *     "id": "uuid",
 *     "email": "user@example.com",
 *     "name": "User Name",
 *     ...
 *   }
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { generateJWT } from '../../src/shared/jwt';
import type { User } from '../../src/shared/types';

// Supabase 클라이언트 (서버용)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!; // Service Role Key (RLS 우회)

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Google UserInfo 인터페이스
 */
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

/**
 * Google UserInfo API 호출
 */
async function fetchGoogleUserInfo(token: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  return (await response.json()) as GoogleUserInfo;
}

/**
 * 사용자 찾기 또는 생성
 */
async function findOrCreateUser(googleUserInfo: GoogleUserInfo): Promise<User> {
  // 1. 기존 사용자 찾기
  const { data: existingUser, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('google_id', googleUserInfo.id)
    .single();

  if (existingUser && !findError) {
    // 기존 사용자: last_login_at 업데이트
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        last_login_at: new Date().toISOString(),
        name: googleUserInfo.name, // 이름이 변경되었을 수 있으므로 업데이트
        profile_picture: googleUserInfo.picture,
      })
      .eq('id', existingUser.id)
      .select()
      .single();

    if (updateError) {
      throw new Error('Failed to update user');
    }

    return updatedUser as User;
  }

  // 2. 새 사용자 생성
  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      google_id: googleUserInfo.id,
      email: googleUserInfo.email,
      name: googleUserInfo.name,
      profile_picture: googleUserInfo.picture,
      subscription_tier: 'free',
      last_login_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    throw new Error('Failed to create user');
  }

  return newUser as User;
}

/**
 * Main handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONS 요청 처리 (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ success: false, error: 'Google token is required' });
    }

    // 1. Google UserInfo API 호출
    console.log('[API] Fetching Google user info...');
    const googleUserInfo = await fetchGoogleUserInfo(googleToken);

    // 2. 사용자 찾기 또는 생성
    console.log('[API] Finding or creating user...');
    const user = await findOrCreateUser(googleUserInfo);

    // 3. JWT 생성
    console.log('[API] Generating JWT...');
    const jwt = generateJWT(user);

    // 4. 성공 응답
    return res.status(200).json({
      success: true,
      jwt,
      user,
    });
  } catch (error) {
    console.error('[API] Login error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
