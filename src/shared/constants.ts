/**
 * API 엔드포인트
 */
export const API_ENDPOINTS = {
  SUMMARIZE: '/api/summarize',
  SEND_SLACK: '/api/send-slack',
  USAGE: '/api/usage',
} as const;

/**
 * 기본 API URL (환경에 따라 변경)
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://your-serverless-api.vercel.app';

/**
 * 로컬 스토리지 키
 */
export const STORAGE_KEYS = {
  USER_SETTINGS: 'tnc_user_settings',
  USAGE_COUNT: 'tnc_usage_count',
  LAST_RESET_DATE: 'tnc_last_reset_date',
} as const;

/**
 * 기본 설정값
 */
export const DEFAULT_SETTINGS = {
  dailyLimit: 5,
  summaryConfig: {
    mode: 'summary' as const,
    language: 'ko' as const,
    maxLength: 150,
  },
  slackConfig: {
    webhookUrl: '',
    username: 'Team News Clipper',
    iconEmoji: ':newspaper:',
  },
} as const;

/**
 * 문자 수 제한
 */
export const CHARACTER_LIMITS = {
  INSIGHT: 150,
  COMMENT: 300,
  CONTENT_MAX: 5000,
} as const;

/**
 * OpenAI 설정
 */
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
} as const;

/**
 * 타임아웃 설정 (ms)
 */
export const TIMEOUTS = {
  API_REQUEST: 30000,
  DOM_PARSING: 5000,
} as const;
