/**
 * Chrome Identity API를 사용한 Google OAuth 인증
 */

import type { User, LoginResponse, AuthMessage } from '@shared/types';

/**
 * Google OAuth 로그인 처리
 */
export async function loginWithGoogle(): Promise<LoginResponse> {
  try {
    console.log('[TNC Auth] Starting Google OAuth login...');

    // Chrome Identity API를 사용하여 Google OAuth Token 획득
    const token = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (token) {
          resolve(token);
        } else {
          reject(new Error('토큰을 가져오지 못했습니다.'));
        }
      });
    });

    console.log('[TNC Auth] Google OAuth token acquired');

    // Backend API에 토큰 전송하여 JWT 발급
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleToken: token,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend API 호출에 실패했습니다.');
    }

    const data: LoginResponse = await response.json();

    if (!data.success || !data.user || !data.jwt) {
      throw new Error('사용자 정보를 가져올 수 없습니다.');
    }

    console.log('[TNC Auth] User authenticated:', data.user.email);

    return {
      success: true,
      user: data.user,
      jwt: data.jwt,
    };
  } catch (error) {
    console.error('[TNC Auth] Login error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
    };
  }
}

/**
 * Google UserInfo API 호출
 * Note: 현재는 Backend API에서 처리하므로 미사용
 */
// async function fetchGoogleUserInfo(token: string): Promise<{
//   id: string;
//   email: string;
//   name: string;
//   picture: string;
// }> {
//   const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error('사용자 정보를 가져오는데 실패했습니다.');
//   }

//   return await response.json();
// }

/**
 * 로그아웃 처리
 */
export async function logout(): Promise<void> {
  try {
    // Chrome Identity API를 사용하여 캐시된 토큰 삭제
    const token = await new Promise<string>((resolve) => {
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        resolve(token || '');
      });
    });

    if (token) {
      await new Promise<void>((resolve) => {
        chrome.identity.removeCachedAuthToken({ token }, () => {
          resolve();
        });
      });
    }

    // Chrome Storage에서 사용자 정보 삭제
    await chrome.storage.local.remove(['user', 'jwt', 'lastLoginAt']);

    console.log('[TNC Auth] Logout successful');
  } catch (error) {
    console.error('[TNC Auth] Logout error:', error);
    throw error;
  }
}

/**
 * 현재 인증 상태 확인
 */
export async function checkAuthStatus(): Promise<{
  isAuthenticated: boolean;
  user: User | null;
  jwt: string | null;
}> {
  try {
    const result = await chrome.storage.local.get(['user', 'jwt']);

    if (result.user && result.jwt) {
      return {
        isAuthenticated: true,
        user: result.user,
        jwt: result.jwt,
      };
    }

    return {
      isAuthenticated: false,
      user: null,
      jwt: null,
    };
  } catch (error) {
    console.error('[TNC Auth] Check auth status error:', error);
    return {
      isAuthenticated: false,
      user: null,
      jwt: null,
    };
  }
}

/**
 * Background script에서 Auth 메시지 리스너 등록
 */
export function setupAuthMessageListener() {
  chrome.runtime.onMessage.addListener((message: AuthMessage, _sender, sendResponse) => {
    // Auth 메시지가 아니면 무시
    if (!message.type || !message.type.startsWith('AUTH_')) {
      return false;
    }

    // 비동기 처리
    (async () => {
      try {
        switch (message.type) {
          case 'AUTH_LOGIN':
            const loginResult = await loginWithGoogle();

            // 로그인 성공 시 Chrome Storage에 저장
            if (loginResult.success && loginResult.user && loginResult.jwt) {
              await chrome.storage.local.set({
                user: loginResult.user,
                jwt: loginResult.jwt,
                lastLoginAt: new Date().toISOString(),
              });
              console.log('[TNC Auth] User data saved to storage');
            }

            sendResponse(loginResult);
            break;

          case 'AUTH_LOGOUT':
            await logout();
            sendResponse({ success: true });
            break;

          case 'AUTH_CHECK':
            const authStatus = await checkAuthStatus();
            sendResponse(authStatus);
            break;

          case 'AUTH_GET_TOKEN':
            const result = await chrome.storage.local.get(['jwt']);
            sendResponse({ jwt: result.jwt || null });
            break;

          default:
            sendResponse({ success: false, error: 'Unknown message type' });
        }
      } catch (error) {
        console.error('[TNC Auth] Message handler error:', error);
        sendResponse({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })();

    // 비동기 응답을 위해 true 반환
    return true;
  });

  console.log('[TNC Auth] Message listener registered');
}
