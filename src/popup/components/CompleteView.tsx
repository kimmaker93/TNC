import { useState, useEffect } from 'react';
import { usePopupStore } from '../store';
import { sendScrapToSlack, getActiveIntegrations } from '../api';
import { CHARACTER_LIMITS } from '@shared/constants';
import { SettingsButton } from './SettingsButton';
import { HistoryButton } from './HistoryButton';
import type { Integration } from '@shared/types';

export function CompleteView() {
  const {
    pageContent,
    summaryData,
    scrapId,
    updateSummary,
    updateInsight,
    updateComment,
    setState,
    setError,
    setCurrentView,
    auth,
  } = usePopupStore();

  const [isSending, setIsSending] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);

  // Load integrations on mount
  useEffect(() => {
    const loadIntegrations = async () => {
      if (!auth.jwt) return;

      try {
        setIsLoadingIntegrations(false);
        const activeIntegrations = await getActiveIntegrations(auth.jwt);
        setIntegrations(activeIntegrations);

        // Auto-select first integration
        if (activeIntegrations.length > 0) {
          setSelectedIntegrationId(activeIntegrations[0].id);
        }
      } catch (error) {
        console.error('[CompleteView] Load integrations error:', error);
      } finally {
        setIsLoadingIntegrations(false);
      }
    };

    loadIntegrations();
  }, [auth.jwt]);

  if (!pageContent || !summaryData) {
    return null;
  }

  const handleSendToSlack = async () => {
    // Integration 선택 체크
    if (!selectedIntegrationId) {
      setError('Slack 워크스페이스를 선택해주세요.');
      setState('error');
      return;
    }

    // Scrap ID 체크
    if (!scrapId) {
      setError('요약 데이터를 찾을 수 없습니다.');
      setState('error');
      return;
    }

    try {
      setIsSending(true);

      const response = await sendScrapToSlack({
        scrap_id: scrapId,
        integration_id: selectedIntegrationId,
        user_comment: summaryData.comment,
      }, auth.jwt || '');

      if (!response.success) {
        throw new Error(response.error || 'Slack 전송에 실패했습니다.');
      }

      // 성공 메시지
      alert('✅ Slack으로 전송 완료!');
      window.close();
    } catch (error) {
      console.error('[TNC] Send to Slack error:', error);
      setError(error instanceof Error ? error.message : 'Slack 전송에 실패했습니다.');
      setState('error');
    } finally {
      setIsSending(false);
    }
  };

  const summaryArray = Array.isArray(summaryData.summary)
    ? summaryData.summary
    : [summaryData.summary];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold">✨ 요약 완료!</h1>
          <div className="flex items-center gap-1">
            <HistoryButton />
            <SettingsButton />
          </div>
        </div>
        <p className="text-sm opacity-90">내용을 확인하고 수정할 수 있습니다</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Page Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
            {pageContent.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{pageContent.url}</p>
        </div>

        {/* Integration Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🚀 Slack 워크스페이스 선택
          </label>
          {isLoadingIntegrations ? (
            <div className="text-center py-4 text-gray-500">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <p className="text-xs mt-2">로딩 중...</p>
            </div>
          ) : integrations.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                연동된 Slack 워크스페이스가 없습니다.
              </p>
              <button
                onClick={() => setCurrentView('settings')}
                className="text-sm text-blue-600 hover:underline"
              >
                설정에서 연동하기 →
              </button>
            </div>
          ) : (
            <select
              value={selectedIntegrationId || ''}
              onChange={(e) => setSelectedIntegrationId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {integrations.map((integration) => (
                <option key={integration.id} value={integration.id}>
                  {integration.workspace_name || 'Slack Workspace'}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 요약 (3줄)
          </label>
          <textarea
            value={summaryArray.join('\n')}
            onChange={(e) => updateSummary(e.target.value.split('\n'))}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="요약 내용을 수정할 수 있습니다..."
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🏷️ 키워드
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white">
            {summaryData.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Insight */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💡 인사이트{' '}
            <span className="text-xs font-normal text-gray-500">
              ({summaryData.insight.length}/{CHARACTER_LIMITS.INSIGHT})
            </span>
          </label>
          <textarea
            value={summaryData.insight}
            onChange={(e) => {
              if (e.target.value.length <= CHARACTER_LIMITS.INSIGHT) {
                updateInsight(e.target.value);
              }
            }}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="AI가 도출한 시사점을 수정하거나 추가할 수 있습니다..."
            maxLength={CHARACTER_LIMITS.INSIGHT}
          />
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💬 내 코멘트{' '}
            <span className="text-xs font-normal text-gray-500">
              ({summaryData.comment.length}/{CHARACTER_LIMITS.COMMENT})
            </span>
          </label>
          <textarea
            value={summaryData.comment}
            onChange={(e) => {
              if (e.target.value.length <= CHARACTER_LIMITS.COMMENT) {
                updateComment(e.target.value);
              }
            }}
            className="w-full h-24 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="팀에게 남기고 싶은 한마디를 작성하세요..."
            maxLength={CHARACTER_LIMITS.COMMENT}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white space-y-2">
        <button
          onClick={handleSendToSlack}
          disabled={isSending}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isSending ? '전송 중...' : '🚀 Slack으로 전송'}
        </button>
        <button
          onClick={() => setState('ready')}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          다시 요약하기
        </button>
      </div>
    </div>
  );
}
