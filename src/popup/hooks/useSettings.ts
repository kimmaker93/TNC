import { useState, useCallback } from 'react';
import { usePopupStore } from '../store';
import { isValidSlackWebhook } from '@shared/utils';
import type { UserSettings } from '@shared/types';

interface UseSettingsReturn {
  // 설정 값
  webhookUrl: string;
  language: 'ko' | 'en';
  summaryMode: 'bullets' | 'paragraph';
  autoSend: boolean;

  // 상태
  isSaving: boolean;
  isTesting: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  testSuccess: boolean;
  testError: string | null;

  // 액션
  updateWebhookUrl: (url: string) => void;
  updateLanguage: (lang: 'ko' | 'en') => void;
  updateSummaryMode: (mode: 'bullets' | 'paragraph') => void;
  updateAutoSend: (enabled: boolean) => void;
  saveSettings: () => Promise<void>;
  testWebhook: () => Promise<void>;
  validateWebhook: (url: string) => boolean;
}

/**
 * 설정 관리를 위한 커스텀 훅
 */
export function useSettings(): UseSettingsReturn {
  const { settings, updateSettings } = usePopupStore();

  // 로컬 상태
  const [webhookUrl, setWebhookUrl] = useState(settings.slackConfig.webhookUrl || '');
  const [language, setLanguage] = useState<'ko' | 'en'>(settings.summaryConfig.language);
  const [summaryMode, setSummaryMode] = useState<'bullets' | 'paragraph'>(
    settings.summaryConfig.summaryMode
  );
  const [autoSend, setAutoSend] = useState(settings.autoSend);

  // UI 상태
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  /**
   * Webhook URL 유효성 검사
   */
  const validateWebhook = useCallback((url: string): boolean => {
    if (!url) return true; // 빈 값은 허용 (선택사항)
    return isValidSlackWebhook(url);
  }, []);

  /**
   * 설정 저장
   */
  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Webhook URL 검증
      if (webhookUrl && !validateWebhook(webhookUrl)) {
        throw new Error('Invalid Slack Webhook URL format');
      }

      const newSettings: Partial<UserSettings> = {
        slackConfig: {
          ...settings.slackConfig,
          webhookUrl,
        },
        summaryConfig: {
          ...settings.summaryConfig,
          language,
          summaryMode,
        },
        autoSend,
      };

      await updateSettings(newSettings);
      setSaveSuccess(true);

      // 성공 메시지를 2초 후 숨김
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error('[TNC] Settings save error:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [webhookUrl, language, summaryMode, autoSend, settings, updateSettings, validateWebhook]);

  /**
   * Webhook 연결 테스트
   */
  const testWebhook = useCallback(async () => {
    if (!webhookUrl) {
      setTestError('Webhook URL is required');
      return;
    }

    if (!validateWebhook(webhookUrl)) {
      setTestError('Invalid Webhook URL format');
      return;
    }

    setIsTesting(true);
    setTestSuccess(false);
    setTestError(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: '🔧 Team News Clipper 연결 테스트\nWebhook이 정상적으로 작동하고 있습니다!',
        }),
      });

      if (!response.ok) {
        throw new Error('Webhook test failed');
      }

      setTestSuccess(true);

      // 성공 메시지를 3초 후 숨김
      setTimeout(() => setTestSuccess(false), 3000);
    } catch (error) {
      console.error('[TNC] Webhook test error:', error);
      setTestError(error instanceof Error ? error.message : 'Connection failed');
    } finally {
      setIsTesting(false);
    }
  }, [webhookUrl, validateWebhook]);

  return {
    // 설정 값
    webhookUrl,
    language,
    summaryMode,
    autoSend,

    // 상태
    isSaving,
    isTesting,
    saveSuccess,
    saveError,
    testSuccess,
    testError,

    // 액션
    updateWebhookUrl: setWebhookUrl,
    updateLanguage: setLanguage,
    updateSummaryMode: setSummaryMode,
    updateAutoSend: setAutoSend,
    saveSettings,
    testWebhook,
    validateWebhook,
  };
}
