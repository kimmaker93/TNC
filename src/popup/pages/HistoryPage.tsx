import { useState, useEffect } from 'react';
import { usePopupStore } from '../store';
import { getScraps } from '../api';
import type { Scrap } from '@shared/types';

export function HistoryPage() {
  const { setCurrentView, auth } = usePopupStore();
  const [scraps, setScraps] = useState<Scrap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScrap, setSelectedScrap] = useState<Scrap | null>(null);

  useEffect(() => {
    const loadScraps = async () => {
      if (!auth.jwt) return;

      try {
        setIsLoading(true);
        const data = await getScraps(auth.jwt);
        setScraps(data);
      } catch (error) {
        console.error('[HistoryPage] Load scraps error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadScraps();
  }, [auth.jwt]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getPersonaLabel = (persona: string) => {
    const labels: Record<string, string> = {
      general: '일반',
      marketing: '마케팅',
      dev: '개발',
      biz: '비즈니스',
    };
    return labels[persona] || persona;
  };

  const getPersonaIcon = (persona: string) => {
    const icons: Record<string, string> = {
      general: '📄',
      marketing: '📢',
      dev: '💻',
      biz: '💼',
    };
    return icons[persona] || '📄';
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">📚 히스토리</h1>
        </div>
        <div className="text-sm opacity-90">{scraps.length}개의 스크랩</div>
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-sm text-gray-600">로딩 중...</p>
            </div>
          </div>
        ) : scraps.length === 0 ? (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 mb-2">아직 스크랩한 콘텐츠가 없습니다</p>
              <p className="text-sm text-gray-500">페이지를 방문하고 요약해보세요!</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {scraps.map((scrap) => (
              <div
                key={scrap.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedScrap(selectedScrap?.id === scrap.id ? null : scrap)}
              >
                {/* Scrap 카드 헤더 */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {scrap.title || 'Untitled'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate mt-1">{scrap.url}</p>
                  </div>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap">
                    {getPersonaIcon(scrap.persona)} {getPersonaLabel(scrap.persona)}
                  </span>
                </div>

                {/* 날짜 및 단어 수 */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                  <span>📅 {formatDate(scrap.created_at)}</span>
                  {scrap.word_count && <span>📝 {scrap.word_count.toLocaleString()}단어</span>}
                </div>

                {/* 키워드 미리보기 */}
                {scrap.keywords && scrap.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {scrap.keywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                    {scrap.keywords.length > 3 && (
                      <span className="px-2 py-0.5 text-gray-500 text-xs">
                        +{scrap.keywords.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 확장된 상세 정보 */}
                {selectedScrap?.id === scrap.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                    {/* 요약 */}
                    {scrap.summary && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">📝 요약</p>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                          {scrap.summary}
                        </div>
                      </div>
                    )}

                    {/* 인사이트 */}
                    {scrap.insight && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">💡 인사이트</p>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap bg-blue-50 p-3 rounded">
                          {scrap.insight}
                        </div>
                      </div>
                    )}

                    {/* 코멘트 */}
                    {scrap.user_comment && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">💬 내 코멘트</p>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap bg-yellow-50 p-3 rounded">
                          {scrap.user_comment}
                        </div>
                      </div>
                    )}

                    {/* URL 링크 */}
                    <div className="flex gap-2">
                      <a
                        href={scrap.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🔗 원문 보기
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
