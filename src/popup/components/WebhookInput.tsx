import { useTranslation } from '../hooks/useTranslation';

interface WebhookInputProps {
  value: string;
  onChange: (value: string) => void;
  onTest: () => void;
  isValid: boolean;
  isTesting: boolean;
  testSuccess: boolean;
  testError: string | null;
}

/**
 * Webhook URL 입력 컴포넌트
 */
export function WebhookInput({
  value,
  onChange,
  onTest,
  isValid,
  isTesting,
  testSuccess,
  testError,
}: WebhookInputProps) {
  const t = useTranslation();

  return (
    <div className="space-y-2">
      <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
        {t.webhookLabel}
      </label>

      <div className="flex gap-2">
        <input
          id="webhook-url"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.webhookPlaceholder}
          className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            value && !isValid
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
        />

        <button
          onClick={onTest}
          disabled={!value || !isValid || isTesting}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isTesting ? '테스트 중...' : t.testWebhook}
        </button>
      </div>

      {/* 도움말 */}
      <p className="text-xs text-gray-500">{t.webhookHelp}</p>

      {/* 유효성 검사 오류 */}
      {value && !isValid && (
        <p className="text-sm text-red-600">{t.webhookInvalid}</p>
      )}

      {/* 테스트 성공 */}
      {testSuccess && (
        <p className="text-sm text-green-600">{t.testWebhookSuccess}</p>
      )}

      {/* 테스트 실패 */}
      {testError && (
        <p className="text-sm text-red-600">
          {t.testWebhookFailed}: {testError}
        </p>
      )}
    </div>
  );
}
