import { useState, useEffect } from 'react';
import { usePopupStore } from '../store';
import { LanguageSelector } from '../components/LanguageSelector';

/**
 * Slack 연동 인터페이스
 */
interface SlackIntegration {
  id: string;
  webhook_url: string;
  workspace_name: string;
  is_active: boolean;
  created_at: string;
}

/**
 * 설정 페이지 (Slack 연동 관리 포함)
 */
export function Settings() {
  const { setCurrentView, auth, updateSettings } = usePopupStore();

  // Slack 연동 상태
  const [integrations, setIntegrations] = useState<SlackIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 새 연동 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // 삭제 확인 다이얼로그
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // API Base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  /**
   * 연동 목록 불러오기
   */
  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiBaseUrl}/api/integrations`, {
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load integrations');
      }

      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (err) {
      console.error('[Settings] Load integrations error:', err);
      setError('연동 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 새 연동 추가
   */
  const handleAddIntegration = async () => {
    if (!newWebhookUrl.trim()) {
      setAddError('Webhook URL을 입력해주세요.');
      return;
    }

    if (!newWebhookUrl.startsWith('https://hooks.slack.com/services/')) {
      setAddError('올바른 Slack Webhook URL 형식이 아닙니다.');
      return;
    }

    try {
      setIsAdding(true);
      setAddError(null);

      const response = await fetch(`${apiBaseUrl}/api/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify({
          webhook_url: newWebhookUrl,
          workspace_name: newWorkspaceName || 'Slack Workspace',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add integration');
      }

      // 성공: 목록 새로고침 및 폼 초기화
      await loadIntegrations();
      setNewWebhookUrl('');
      setNewWorkspaceName('');
      setShowAddForm(false);
    } catch (err) {
      console.error('[Settings] Add integration error:', err);
      setAddError(err instanceof Error ? err.message : '연동 추가에 실패했습니다.');
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * 활성화/비활성화 토글
   */
  const handleToggleActive = async (integrationId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.jwt}`,
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update integration');
      }

      // 성공: 목록 새로고침
      await loadIntegrations();
    } catch (err) {
      console.error('[Settings] Toggle active error:', err);
      setError('연동 상태 변경에 실패했습니다.');
    }
  };

  /**
   * 연동 삭제
   */
  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.jwt}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete integration');
      }

      // 성공: 목록 새로고침
      await loadIntegrations();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('[Settings] Delete integration error:', err);
      setError('연동 삭제에 실패했습니다.');
    }
  };

  // 초기 로드
  useEffect(() => {
    loadIntegrations();
  }, []);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setCurrentView('main')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">설정</h1>
        <div className="w-9" />
      </div>

      {/* 설정 내용 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Slack 연동 섹션 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Slack 워크스페이스</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + 추가
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 새 연동 추가 폼 */}
          {showAddForm && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  워크스페이스 이름
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="예: 마케팅팀 Slack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL *
                </label>
                <input
                  type="text"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Slack에서 Incoming Webhook을 생성하고 URL을 복사하세요
                </p>
              </div>

              {addError && (
                <p className="text-sm text-red-600">{addError}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleAddIntegration}
                  disabled={isAdding}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isAdding ? '추가 중...' : '연동 추가'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewWebhookUrl('');
                    setNewWorkspaceName('');
                    setAddError(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* 연동 목록 */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500 mt-2">로딩 중...</p>
            </div>
          ) : integrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm">연동된 워크스페이스가 없습니다</p>
              <p className="text-xs mt-1">상단의 "+ 추가" 버튼을 클릭하여 Slack을 연동하세요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{integration.workspace_name}</h3>
                      <p className="text-xs text-gray-500 mt-1 font-mono truncate">
                        {integration.webhook_url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {/* 활성화/비활성화 토글 */}
                      <button
                        onClick={() => handleToggleActive(integration.id, integration.is_active)}
                        className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                          integration.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {integration.is_active ? '활성화' : '비활성화'}
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => setDeleteConfirm(integration.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* 삭제 확인 다이얼로그 */}
                  {deleteConfirm === integration.id && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-800 mb-2">정말 삭제하시겠습니까?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteIntegration(integration.id)}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          삭제
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200" />

        {/* 언어 선택 */}
        <LanguageSelector
          value={usePopupStore((state) => state.settings.summaryConfig.language)}
          onChange={(lang) => {
            updateSettings({
              summaryConfig: {
                ...usePopupStore.getState().settings.summaryConfig,
                language: lang,
              },
            });
          }}
        />
      </div>
    </div>
  );
}
