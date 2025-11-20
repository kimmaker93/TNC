import { usePopupStore } from '../store';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';
import { WebhookInput } from '../components/WebhookInput';
import { LanguageSelector } from '../components/LanguageSelector';

/**
 * 설정 페이지
 */
export function Settings() {
  const t = useTranslation();
  const setCurrentView = usePopupStore((state) => state.setCurrentView);
  const {
    webhookUrl,
    language,
    summaryMode,
    autoSend,
    isSaving,
    isTesting,
    saveSuccess,
    saveError,
    testSuccess,
    testError,
    updateWebhookUrl,
    updateLanguage,
    updateSummaryMode,
    updateAutoSend,
    saveSettings,
    testWebhook,
    validateWebhook,
  } = useSettings();

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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{t.settingsTitle}</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* 설정 폼 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Webhook URL */}
        <WebhookInput
          value={webhookUrl}
          onChange={updateWebhookUrl}
          onTest={testWebhook}
          isValid={validateWebhook(webhookUrl)}
          isTesting={isTesting}
          testSuccess={testSuccess}
          testError={testError}
        />

        {/* 구분선 */}
        <div className="border-t border-gray-200" />

        {/* 언어 선택 */}
        <LanguageSelector value={language} onChange={updateLanguage} />

        {/* 구분선 */}
        <div className="border-t border-gray-200" />

        {/* 요약 형식 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t.summaryModeLabel}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="summaryMode"
                value="bullets"
                checked={summaryMode === 'bullets'}
                onChange={(e) => updateSummaryMode(e.target.value as 'bullets' | 'paragraph')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{t.summaryModeBullets}</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="summaryMode"
                value="paragraph"
                checked={summaryMode === 'paragraph'}
                onChange={(e) => updateSummaryMode(e.target.value as 'bullets' | 'paragraph')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{t.summaryModeParagraph}</span>
            </label>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-200" />

        {/* 자동 전송 */}
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="text-sm font-medium text-gray-700">{t.autoSendLabel}</div>
              <div className="text-xs text-gray-500 mt-1">{t.autoSendDescription}</div>
            </div>
            <input
              type="checkbox"
              checked={autoSend}
              onChange={(e) => updateAutoSend(e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
            />
          </label>
        </div>
      </div>

      {/* 하단 저장 버튼 */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? '저장 중...' : t.save}
        </button>

        {/* 저장 성공 메시지 */}
        {saveSuccess && (
          <p className="text-sm text-green-600 text-center mt-2">{t.settingsSaved}</p>
        )}

        {/* 저장 실패 메시지 */}
        {saveError && (
          <p className="text-sm text-red-600 text-center mt-2">
            {t.settingsSaveFailed}: {saveError}
          </p>
        )}
      </div>
    </div>
  );
}
