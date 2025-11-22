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
 * Persona 타입
 */
export type Persona = 'general' | 'marketing' | 'dev' | 'biz';

/**
 * 요약 설정
 */
export interface SummaryConfig {
  mode: 'summary' | 'keywords';
  language: 'ko' | 'en';
  maxLength: number;
  summaryMode: 'bullets' | 'paragraph';
  persona?: Persona; // 추가: 요약 페르소나
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
  autoSend: boolean; // 요약 후 자동 전송 여부
}

/**
 * 요약 요청 데이터
 */
export interface SummaryRequest {
  content: string;
  title: string;
  url: string;
  mode: 'summary' | 'keywords';
  persona?: Persona; // 추가: 페르소나 선택
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
export type ExtensionState = 'idle' | 'ready' | 'loading' | 'complete' | 'error' | 'unsupported';

/**
 * 메시지 타입 (background와 content script 간 통신)
 */
export enum MessageType {
  EXTRACT_CONTENT = 'EXTRACT_CONTENT',
  CONTENT_EXTRACTED = 'CONTENT_EXTRACTED',
  UNSUPPORTED_PAGE = 'UNSUPPORTED_PAGE',
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

/**
 * Popup View 타입 (라우팅용)
 */
export type PopupView = 'main' | 'settings' | 'auth';

/**
 * 사용자 정보
 */
export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  subscriptionTier: 'free' | 'pro';
  createdAt: string;
  lastLoginAt: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  jwt: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Google OAuth 응답
 */
export interface GoogleAuthResponse {
  token: string;
  email: string;
}

/**
 * Backend 로그인 응답
 */
export interface LoginResponse {
  success: boolean;
  jwt?: string;
  user?: User;
  error?: string;
}

/**
 * Auth 관련 메시지 타입
 */
export enum AuthMessageType {
  LOGIN = 'AUTH_LOGIN',
  LOGOUT = 'AUTH_LOGOUT',
  CHECK_AUTH = 'AUTH_CHECK',
  GET_TOKEN = 'AUTH_GET_TOKEN',
}

/**
 * Auth 메시지
 */
export interface AuthMessage<T = any> {
  type: AuthMessageType;
  payload?: T;
  error?: string;
}

/**
 * Scrap (저장된 요약 데이터)
 */
export interface Scrap {
  id: string;
  user_id: string;
  integration_id: string | null;
  url: string;
  title: string | null;
  summary: string | null;
  keywords: string[] | null;
  persona: Persona;
  insight: string | null;
  user_comment: string | null;
  word_count: number | null;
  created_at: string;
}

/**
 * Scrap 생성 요청
 */
export interface CreateScrapRequest {
  url: string;
  title: string;
  content: string;
  persona: Persona;
  word_count: number;
}

/**
 * Scrap 생성 응답
 */
export interface CreateScrapResponse {
  success: boolean;
  scrap?: Scrap;
  error?: string;
}

/**
 * Integration (Slack workspace)
 */
export interface Integration {
  id: string;
  user_id: string;
  integration_type: 'slack' | 'discord' | 'teams';
  webhook_url: string;
  workspace_name: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Scrap → Slack 전송 요청
 */
export interface SendScrapToSlackRequest {
  scrap_id: string;
  integration_id: string;
  user_comment?: string;
}

/**
 * Scrap → Slack 전송 응답
 */
export interface SendScrapToSlackResponse {
  success: boolean;
  error?: string;
}
