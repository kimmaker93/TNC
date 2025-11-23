import { useEffect } from 'react';
import { usePopupStore } from './store';
import { IdleView } from './components/IdleView';
import { ReadyView } from './components/ReadyView';
import { LoadingView } from './components/LoadingView';
import { CompleteView } from './components/CompleteView';
import { ErrorView } from './components/ErrorView';
import { UnsupportedPage } from './components/UnsupportedPage';
import { Settings } from './pages/Settings';
import { AuthPage } from './pages/AuthPage';
import { HistoryPage } from './pages/HistoryPage';
import { MessageType, type ExtensionMessage, type PageContent } from '@shared/types';

export default function App() {
  const {
    currentView,
    state,
    setState,
    setPageContent,
    setError,
    loadSettings,
    loadUsage,
    auth,
    checkAuth,
  } = usePopupStore();

  // 1. 인증 상태 확인 (컴포넌트 마운트 시 한번만)
  useEffect(() => {
    checkAuth();
  }, []);

  // 2. 인증 완료 후 설정 및 콘텐츠 로드
  useEffect(() => {
    if (auth.isAuthenticated && !auth.isLoading) {
      loadSettings();
      loadUsage();
      extractPageContent();
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  /**
   * 페이지 콘텐츠 추출
   */
  const extractPageContent = async () => {
    try {
      setState('loading');
      setError(null);

      // 현재 활성 탭 가져오기
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab.id) {
        throw new Error('활성 탭을 찾을 수 없습니다.');
      }

      // Content script에 메시지 전송
      const response: ExtensionMessage<PageContent> = await chrome.tabs.sendMessage(tab.id, {
        type: MessageType.EXTRACT_CONTENT,
      });

      if (response.type === MessageType.ERROR) {
        throw new Error(response.error || '콘텐츠 추출에 실패했습니다.');
      }

      if (response.type === MessageType.UNSUPPORTED_PAGE) {
        setState('unsupported');
      } else if (response.type === MessageType.CONTENT_EXTRACTED && response.payload) {
        setPageContent(response.payload);
        setState('ready');
      }
    } catch (error) {
      console.error('[TNC] Extract content error:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      setState('error');
    }
  };

  // 인증 로딩 중
  if (auth.isLoading) {
    return (
      <div className="w-[400px] h-[600px] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 미인증 사용자 → AuthPage 표시
  if (!auth.isAuthenticated) {
    return <AuthPage />;
  }

  // 인증된 사용자 → 기존 플로우
  // 설정 페이지 렌더링
  if (currentView === 'settings') {
    return (
      <div className="w-[400px] h-[600px] bg-white">
        <Settings />
      </div>
    );
  }

  // 히스토리 페이지 렌더링
  if (currentView === 'history') {
    return (
      <div className="w-[400px] h-[600px] bg-white">
        <HistoryPage />
      </div>
    );
  }

  // 메인 페이지 렌더링
  return (
    <div className="w-[400px] h-[600px] bg-gray-50">
      {state === 'idle' && <IdleView />}
      {state === 'ready' && <ReadyView />}
      {state === 'loading' && <LoadingView />}
      {state === 'complete' && <CompleteView />}
      {state === 'error' && <ErrorView />}
      {state === 'unsupported' && <UnsupportedPage />}
    </div>
  );
}
