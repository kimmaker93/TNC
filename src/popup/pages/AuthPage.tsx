/**
 * Google OAuth 인증 페이지
 *
 * Feature 1: Google OAuth 인증 시스템
 * - 미니멀한 디자인 (Google 로그인 버튼만 강조)
 * - 로딩 상태 표시 ("로그인 중..." → "사용자 정보 확인 중..." → "완료!")
 * - 에러 처리 (네트워크 오류, 권한 거부 등)
 * - 개인정보 처리방침 링크 하단 표시
 */

import { useState } from 'react';
import { usePopupStore } from '../store';
import type { AuthMessageType } from '@shared/types';

type LoadingStep = 'idle' | 'authenticating' | 'fetching_user' | 'complete';

export function AuthPage() {
  const { setUser, setAuthError, auth } = usePopupStore();
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');

  /**
   * Google 로그인 처리
   */
  const handleGoogleLogin = async () => {
    try {
      setLoadingStep('authenticating');
      setAuthError(null);

      console.log('[TNC AuthPage] Starting Google login...');

      // Background script에 로그인 요청
      const response = await chrome.runtime.sendMessage({
        type: 'AUTH_LOGIN' as AuthMessageType,
      });

      if (!response.success) {
        throw new Error(response.error || '로그인에 실패했습니다.');
      }

      setLoadingStep('fetching_user');

      // 사용자 정보 저장
      if (response.user && response.jwt) {
        setUser(response.user, response.jwt);
        setLoadingStep('complete');

        // 완료 후 잠시 대기 후 메인 화면으로 이동
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('[TNC AuthPage] Login error:', error);
      setAuthError(error instanceof Error ? error.message : '로그인에 실패했습니다. 다시 시도해주세요.');
      setLoadingStep('idle');
    }
  };

  /**
   * 로딩 메시지 반환
   */
  const getLoadingMessage = (): string => {
    switch (loadingStep) {
      case 'authenticating':
        return '로그인 중...';
      case 'fetching_user':
        return '사용자 정보 확인 중...';
      case 'complete':
        return '완료!';
      default:
        return '';
    }
  };

  const isLoading = loadingStep !== 'idle';

  return (
    <div className="w-[400px] h-[600px] bg-white flex flex-col items-center justify-center p-8">
      {/* 로고 영역 */}
      <div className="mb-8 text-center">
        <div className="text-4xl mb-4">📰</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team News Clipper</h1>
        <p className="text-sm text-gray-600">
          AI 기반 웹 콘텐츠 요약 및 공유 도구
        </p>
      </div>

      {/* 로그인 카드 */}
      <div className="w-full max-w-sm bg-gray-50 rounded-lg p-6 shadow-sm">
        {/* 에러 메시지 */}
        {auth.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{auth.error}</p>
          </div>
        )}

        {/* Google 로그인 버튼 */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className={`
            w-full flex items-center justify-center gap-3 px-6 py-3
            bg-white border-2 border-gray-300 rounded-lg
            font-medium text-gray-700
            transition-all duration-200
            ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 hover:border-blue-400 hover:shadow-md'
            }
          `}
        >
          {isLoading ? (
            <>
              {/* 로딩 스피너 */}
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-blue-600">{getLoadingMessage()}</span>
            </>
          ) : (
            <>
              {/* Google 아이콘 */}
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google로 시작하기</span>
            </>
          )}
        </button>

        {/* 안내 메시지 */}
        {!isLoading && !auth.error && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Google 계정으로 로그인하면 모든 기기에서
            <br />
            스크랩 히스토리를 동기화할 수 있습니다.
          </p>
        )}

        {/* 로딩 상태 프로그레스 */}
        {isLoading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`bg-blue-600 h-1.5 rounded-full transition-all duration-500 ${
                  loadingStep === 'authenticating'
                    ? 'w-1/3'
                    : loadingStep === 'fetching_user'
                    ? 'w-2/3'
                    : 'w-full'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* 개인정보 처리방침 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          로그인하면{' '}
          <a
            href="https://your-domain.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            개인정보 처리방침
          </a>
          에 동의하는 것으로 간주됩니다.
        </p>
      </div>

      {/* 하단 기능 설명 */}
      <div className="mt-auto pt-8 w-full">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-1">🤖</div>
            <p className="text-xs text-gray-600">AI 요약</p>
          </div>
          <div>
            <div className="text-2xl mb-1">💬</div>
            <p className="text-xs text-gray-600">Slack 공유</p>
          </div>
          <div>
            <div className="text-2xl mb-1">☁️</div>
            <p className="text-xs text-gray-600">클라우드 동기화</p>
          </div>
        </div>
      </div>
    </div>
  );
}
