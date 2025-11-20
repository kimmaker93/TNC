/**
 * 다국어 번역 정의
 */

export type Language = 'ko' | 'en';

export interface Translations {
  // 공통
  appName: string;
  settings: string;
  save: string;
  cancel: string;
  back: string;

  // 상태 메시지
  loading: string;
  analyzing: string;
  complete: string;
  error: string;

  // 메인 화면
  analyzeButton: string;
  sendToSlack: string;
  copyToClipboard: string;
  copied: string;

  // 사용량
  usage: string;
  usageRemaining: string;
  usageResetsAt: string;
  dailyLimitReached: string;

  // 요약
  summary: string;
  keywords: string;
  insight: string;
  comment: string;
  addComment: string;

  // UnsupportedPage
  unsupportedPageTitle: string;
  unsupportedPageDescription: string;
  supportedSites: string;
  supportedSitesList: {
    news: string;
    blogs: string;
    medium: string;
    github: string;
    docs: string;
  };

  // 설정 페이지
  settingsTitle: string;
  webhookLabel: string;
  webhookPlaceholder: string;
  webhookHelp: string;
  webhookInvalid: string;
  testWebhook: string;
  testWebhookSuccess: string;
  testWebhookFailed: string;

  languageLabel: string;
  languageKorean: string;
  languageEnglish: string;

  summaryModeLabel: string;
  summaryModeBullets: string;
  summaryModeParagraph: string;

  autoSendLabel: string;
  autoSendDescription: string;

  settingsSaved: string;
  settingsSaveFailed: string;

  // 에러 메시지
  errorExtractContent: string;
  errorSummarize: string;
  errorSendSlack: string;
  errorNoWebhook: string;
  errorInvalidPage: string;
}

export const translations: Record<Language, Translations> = {
  ko: {
    // 공통
    appName: 'Team News Clipper',
    settings: '설정',
    save: '저장',
    cancel: '취소',
    back: '뒤로',

    // 상태 메시지
    loading: '로딩 중...',
    analyzing: '페이지 분석 중...',
    complete: '완료',
    error: '오류',

    // 메인 화면
    analyzeButton: '페이지 분석',
    sendToSlack: 'Slack으로 전송',
    copyToClipboard: '클립보드에 복사',
    copied: '복사되었습니다',

    // 사용량
    usage: '사용량',
    usageRemaining: '남은 횟수',
    usageResetsAt: '다음 리셋',
    dailyLimitReached: '일일 사용 한도에 도달했습니다',

    // 요약
    summary: '요약',
    keywords: '키워드',
    insight: '인사이트',
    comment: '코멘트',
    addComment: '코멘트 추가',

    // UnsupportedPage
    unsupportedPageTitle: '클립을 생성할 수 없는 페이지입니다',
    unsupportedPageDescription: '뉴스 기사, 블로그 포스트, 기술 문서 등 텍스트 콘텐츠가 있는 페이지에서 사용 가능합니다',
    supportedSites: '지원되는 페이지',
    supportedSitesList: {
      news: '뉴스 사이트',
      blogs: '블로그',
      medium: 'Medium, Notion',
      github: 'GitHub README',
      docs: '기술 문서',
    },

    // 설정 페이지
    settingsTitle: '설정',
    webhookLabel: 'Slack Webhook URL',
    webhookPlaceholder: 'https://hooks.slack.com/services/...',
    webhookHelp: 'Slack 워크스페이스의 Incoming Webhook URL을 입력하세요',
    webhookInvalid: '올바른 Slack Webhook URL 형식이 아닙니다',
    testWebhook: '연결 테스트',
    testWebhookSuccess: 'Webhook 연결이 확인되었습니다',
    testWebhookFailed: 'Webhook 연결에 실패했습니다',

    languageLabel: '언어',
    languageKorean: '한국어',
    languageEnglish: 'English',

    summaryModeLabel: '요약 형식',
    summaryModeBullets: '글머리 기호',
    summaryModeParagraph: '문단 형식',

    autoSendLabel: '자동 전송',
    autoSendDescription: '요약 완료 후 자동으로 Slack에 전송',

    settingsSaved: '설정이 저장되었습니다',
    settingsSaveFailed: '설정 저장에 실패했습니다',

    // 에러 메시지
    errorExtractContent: '콘텐츠 추출에 실패했습니다',
    errorSummarize: '요약 생성에 실패했습니다',
    errorSendSlack: 'Slack 전송에 실패했습니다',
    errorNoWebhook: 'Slack Webhook URL이 설정되지 않았습니다',
    errorInvalidPage: '이 페이지는 지원되지 않습니다',
  },

  en: {
    // 공통
    appName: 'Team News Clipper',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',

    // 상태 메시지
    loading: 'Loading...',
    analyzing: 'Analyzing page...',
    complete: 'Complete',
    error: 'Error',

    // 메인 화면
    analyzeButton: 'Analyze Page',
    sendToSlack: 'Send to Slack',
    copyToClipboard: 'Copy to Clipboard',
    copied: 'Copied',

    // 사용량
    usage: 'Usage',
    usageRemaining: 'Remaining',
    usageResetsAt: 'Resets at',
    dailyLimitReached: 'Daily limit reached',

    // 요약
    summary: 'Summary',
    keywords: 'Keywords',
    insight: 'Insight',
    comment: 'Comment',
    addComment: 'Add Comment',

    // UnsupportedPage
    unsupportedPageTitle: 'Cannot create clip from this page',
    unsupportedPageDescription: 'This extension works on pages with text content such as news articles, blog posts, and documentation',
    supportedSites: 'Supported Pages',
    supportedSitesList: {
      news: 'News sites',
      blogs: 'Blogs',
      medium: 'Medium, Notion',
      github: 'GitHub README',
      docs: 'Documentation',
    },

    // 설정 페이지
    settingsTitle: 'Settings',
    webhookLabel: 'Slack Webhook URL',
    webhookPlaceholder: 'https://hooks.slack.com/services/...',
    webhookHelp: 'Enter your Slack workspace Incoming Webhook URL',
    webhookInvalid: 'Invalid Slack Webhook URL format',
    testWebhook: 'Test Connection',
    testWebhookSuccess: 'Webhook connection verified',
    testWebhookFailed: 'Webhook connection failed',

    languageLabel: 'Language',
    languageKorean: '한국어',
    languageEnglish: 'English',

    summaryModeLabel: 'Summary Format',
    summaryModeBullets: 'Bullet Points',
    summaryModeParagraph: 'Paragraph',

    autoSendLabel: 'Auto Send',
    autoSendDescription: 'Automatically send to Slack after summary',

    settingsSaved: 'Settings saved',
    settingsSaveFailed: 'Failed to save settings',

    // 에러 메시지
    errorExtractContent: 'Failed to extract content',
    errorSummarize: 'Failed to generate summary',
    errorSendSlack: 'Failed to send to Slack',
    errorNoWebhook: 'Slack Webhook URL is not configured',
    errorInvalidPage: 'This page is not supported',
  },
};
