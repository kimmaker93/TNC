import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants';
import type { UserSettings, UsageResponse } from './types';

/**
 * 텍스트 글자 수 제한
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * 날짜가 오늘인지 확인
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * 다음 리셋 시간 계산 (자정)
 */
export function getNextResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Chrome Storage에서 사용자 설정 가져오기
 */
export async function getUserSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([STORAGE_KEYS.USER_SETTINGS], (result) => {
      const settings = result[STORAGE_KEYS.USER_SETTINGS];
      if (settings) {
        resolve(settings);
      } else {
        const defaultSettings: UserSettings = {
          ...DEFAULT_SETTINGS,
          usageCount: 0,
          lastResetDate: new Date().toISOString(),
        };
        resolve(defaultSettings);
      }
    });
  });
}

/**
 * Chrome Storage에 사용자 설정 저장
 */
export async function saveUserSettings(settings: UserSettings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [STORAGE_KEYS.USER_SETTINGS]: settings }, () => {
      resolve();
    });
  });
}

/**
 * 사용량 체크 및 업데이트
 */
export async function checkAndUpdateUsage(): Promise<UsageResponse> {
  const settings = await getUserSettings();

  // 날짜가 바뀌었으면 리셋
  if (!isToday(settings.lastResetDate)) {
    settings.usageCount = 0;
    settings.lastResetDate = new Date().toISOString();
    await saveUserSettings(settings);
  }

  const remaining = Math.max(0, settings.dailyLimit - settings.usageCount);

  return {
    dailyLimit: settings.dailyLimit,
    used: settings.usageCount,
    remaining,
    resetsAt: getNextResetTime(),
  };
}

/**
 * 사용량 증가
 */
export async function incrementUsage(): Promise<void> {
  const settings = await getUserSettings();
  settings.usageCount += 1;
  await saveUserSettings(settings);
}

/**
 * URL 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Slack Webhook URL 검증
 */
export function isValidSlackWebhook(url: string): boolean {
  return url.startsWith('https://hooks.slack.com/services/');
}

/**
 * 에러 메시지 포맷팅
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * 본문 텍스트 정제
 */
export function cleanContent(content: string): string {
  return content
    .replace(/\s+/g, ' ') // 여러 공백을 하나로
    .replace(/\n{3,}/g, '\n\n') // 여러 줄바꿈을 두 개로
    .trim();
}

/**
 * 단어 수 계산
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}
