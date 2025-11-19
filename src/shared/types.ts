/**
 * 웹 페이지 콘텐츠 데이터 구조
 */
export interface PageContent {
  url: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedDate?: string;
  wordCount: number;
  timestamp: number;
}

/**
 * 요약 설정
 */
export interface SummaryConfig {
  mode: 'summary' | 'keywords';
  language: 'ko' | 'en';
  maxLength: number;
}

/**
 * Slack 연동 설정
 */
export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

/**
 * 사용자 설정
 */
export interface UserSettings {
  slackConfig: SlackConfig;
  summaryConfig: SummaryConfig;
  dailyLimit: number;
  usageCount: number;
  lastResetDate: string;
}

/**
 * 요약 요청 데이터
 */
export interface SummaryRequest {
  content: string;
  title: string;
  url: string;
  mode: 'summary' | 'keywords';
  maxTokens?: number;
}

/**
 * 요약 응답 데이터
 */
export interface SummaryResponse {
  success: boolean;
  data?: {
    summary: string | string[];
    keywords?: string[];
    insight?: string;
    processingTime: number;
  };
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
  error?: string;
}

/**
 * Slack 전송 요청
 */
export interface SlackSendRequest {
  webhookUrl: string;
  title: string;
  url: string;
  summary: string | string[];
  keywords?: string[];
  insight?: string;
  comment?: string;
}

/**
 * Slack 전송 응답
 */
export interface SlackSendResponse {
  success: boolean;
  messageId?: string;
  timestamp?: string;
  error?: string;
}

/**
 * 사용량 체크 응답
 */
export interface UsageResponse {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetsAt: string;
}

/**
 * Extension 상태
 */
export type ExtensionState = 'idle' | 'ready' | 'loading' | 'complete' | 'error';

/**
 * 메시지 타입 (background와 content script 간 통신)
 */
export enum MessageType {
  EXTRACT_CONTENT = 'EXTRACT_CONTENT',
  CONTENT_EXTRACTED = 'CONTENT_EXTRACTED',
  SUMMARIZE = 'SUMMARIZE',
  SUMMARY_COMPLETE = 'SUMMARY_COMPLETE',
  SEND_TO_SLACK = 'SEND_TO_SLACK',
  SLACK_SENT = 'SLACK_SENT',
  ERROR = 'ERROR',
}

/**
 * Extension 간 메시지
 */
export interface ExtensionMessage<T = any> {
  type: MessageType;
  payload?: T;
  error?: string;
}
