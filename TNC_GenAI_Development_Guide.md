# TNC MVP 개발을 위한 GenAI 활용 가이드

## 🚀 빠른 시작을 위한 AI 프롬프트 템플릿

### 1. Chrome Extension 기본 구조 생성

```markdown
Create a Chrome Extension with Manifest V3 that:
1. Has a popup UI built with React and TypeScript
2. Includes a content script for DOM parsing
3. Uses chrome.storage.sync for settings
4. Implements a background service worker
5. Includes proper TypeScript types for Chrome APIs

Project structure:
- src/
  - popup/ (React app)
  - content/ (Content script)
  - background/ (Service worker)
  - shared/ (Shared utilities)
- manifest.json
- webpack.config.js
```

### 2. DOM 파싱 모듈 구현

```markdown
Create a TypeScript content script that:
1. Extracts the main article content from any webpage
2. Uses Readability.js as the primary parser
3. Handles SPA websites with MutationObserver
4. Removes ads, navigation, and footer content
5. Returns structured data with title, content, and metadata

Requirements:
- Handle edge cases (paywalls, infinite scroll)
- Limit content to 5000 characters
- Preserve important formatting (lists, headings)
```

### 3. Serverless API 구현

```markdown
Create a Next.js API route that:
1. Receives webpage content
2. Calls OpenAI API for summarization
3. Implements proper error handling
4. Uses environment variables for API keys
5. Includes rate limiting with Upstash Redis

Input: { content: string, mode: 'summary' | 'keywords' }
Output: { summary: string | string[], keywords: string[] }

Security requirements:
- Validate input with Zod
- Implement CORS for extension only
- Add request signing
```

### 4. Slack 전송 모듈

```markdown
Create a TypeScript function that:
1. Formats summary data for Slack
2. Sends to Slack webhook URL
3. Uses Block Kit for rich formatting
4. Includes error handling and retry logic
5. Returns success/failure status

Slack message format:
- Title with link
- Summary in quote blocks
- Keywords as tags
- Timestamp and source
```

---

## 🛠️ 개발 순서 및 AI 활용 전략

### Phase 1: 프로젝트 초기화 (Day 1)

#### AI로 생성할 것들:
1. **프로젝트 구조**
```bash
# AI에게 요청
"Create a complete project setup for Chrome Extension with:
- Vite + React + TypeScript
- CRXJS plugin configuration
- Tailwind CSS
- ESLint + Prettier
- GitHub Actions CI/CD"
```

2. **개발 환경 설정 파일들**
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `.eslintrc`
- `.prettierrc`

### Phase 2: Extension 개발 (Day 2-3)

#### Content Script (DOM 파싱)
```javascript
// AI 프롬프트 예시
"Implement a robust content parser that:
1. First tries document.querySelector for common article selectors
2. Falls back to Readability.js
3. Cleans HTML and extracts plain text
4. Handles these specific sites: Medium, Notion, GitHub
5. Returns null for non-article pages (homepage, search results)"
```

#### Popup UI
```javascript
// AI 프롬프트 예시
"Create a React component for Chrome Extension popup:
- 320x480px fixed size
- 3 states: idle, loading, complete
- Material Design 3 styling
- Animated transitions
- Copy to clipboard button
- Character count display"
```

### Phase 3: Backend API (Day 4)

#### Serverless Functions
```javascript
// AI 프롬프트 예시
"Create Vercel serverless functions:

/api/summarize.ts:
- Validate request body
- Check rate limits (5/day per user)
- Call OpenAI with streaming
- Return formatted response
- Log usage metrics

/api/webhook.ts:
- Format Slack message
- Send to webhook
- Handle errors gracefully"
```

### Phase 4: 통합 및 테스트 (Day 5)

#### 테스트 코드 생성
```javascript
// AI 프롬프트 예시
"Generate comprehensive tests:
1. Unit tests for DOM parser
2. Integration tests for API
3. E2E tests for extension flow
4. Mock OpenAI responses
5. Test error scenarios"
```

---

## 📝 실제 코드 생성 예시

### 1. Manifest.json (완성본)

```json
{
  "manifest_version": 3,
  "name": "Team News Clipper",
  "version": "1.0.0",
  "description": "AI-powered web content summarizer for Slack",
  "permissions": [
    "activeTab",
    "storage",
    "scripting"
  ],
  "host_permissions": [
    "https://api.teamnewsclipper.com/*"
  ],
  "background": {
    "service_worker": "src/background/index.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content/index.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/index.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
```

### 2. 핵심 타입 정의

```typescript
// src/shared/types.ts
export interface PageContent {
  url: string;
  title: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedDate?: string;
  wordCount: number;
}

export interface SummaryConfig {
  mode: 'summary' | 'keywords' | 'both';
  language: 'ko' | 'en';
  maxLength: number;
  tone: 'formal' | 'casual';
}

export interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

export interface UserSettings {
  slackConfig: SlackConfig;
  summaryConfig: SummaryConfig;
  dailyLimit: number;
  usageCount: number;
  lastResetDate: string;
}
```

### 3. OpenAI 프롬프트 템플릿

```typescript
// src/server/prompts.ts
export const SUMMARY_PROMPTS = {
  summary: {
    ko: `당신은 전문적인 콘텐츠 요약 전문가입니다.
다음 웹 페이지 내용을 한국어로 3줄 이내로 요약해주세요.

요약 규칙:
1. 핵심 정보와 인사이트 중심
2. 불필요한 수식어 제거
3. 비즈니스 가치가 있는 내용 우선
4. 각 줄은 완전한 문장으로 작성

원문:
{content}

3줄 요약:`,
    
    en: `You are a professional content summarizer.
Summarize the following webpage content in 3 lines or less.

Rules:
1. Focus on key insights
2. Remove unnecessary details
3. Prioritize business value
4. Each line should be a complete sentence

Content:
{content}

3-line summary:`
  },
  
  keywords: {
    ko: `다음 텍스트에서 핵심 키워드 5개를 추출하세요.
JSON 배열 형식으로만 응답하세요.

텍스트: {content}

키워드 (JSON):`,
    
    en: `Extract 5 key keywords from the following text.
Respond only with a JSON array.

Text: {content}

Keywords (JSON):`
  }
};
```

### 4. Slack 메시지 포맷터

```typescript
// src/server/slack-formatter.ts
export class SlackMessageFormatter {
  static formatSummary(data: {
    title: string;
    url: string;
    summary: string;
    keywords: string[];
  }): SlackMessage {
    return {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📰 " + data.title,
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Summary:*\n${data.summary}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `🏷️ ${data.keywords.map(k => `\`${k}\``).join(' ')}`
            }
          ]
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: {
                type: "plain_text",
                text: "View Original"
              },
              url: data.url,
              style: "primary"
            }
          ]
        }
      ]
    };
  }
}
```

---

## 🎯 AI 도구별 최적 활용법

### GitHub Copilot
- **최적**: 함수 자동 완성, 반복 코드 패턴
- **활용**: 타입 정의 후 구현부 자동 생성
- **예시**: React 컴포넌트 props 정의 → 컴포넌트 자동 생성

### ChatGPT/Claude
- **최적**: 전체 모듈 설계, 복잡한 로직 구현
- **활용**: 아키텍처 설계, 에러 처리 전략
- **예시**: "Implement rate limiting with Redis"

### Cursor
- **최적**: 실시간 코드 수정, 리팩토링
- **활용**: 기존 코드 개선, 버그 수정
- **예시**: 선택 영역 최적화 요청

---

## ⚠️ AI 사용 시 주의사항

### 반드시 수동 검토가 필요한 부분

1. **보안 관련 코드**
```typescript
// ❌ AI가 생성한 코드 그대로 사용 금지
// ✅ 반드시 검토 후 수정
- API Key 처리
- 사용자 인증
- CORS 설정
- Input validation
```

2. **비용 관련 로직**
```typescript
// OpenAI API 호출 전 반드시 체크
- Token 계산 로직
- Rate limiting
- 사용량 추적
```

3. **에러 처리**
```typescript
// 모든 edge case 검토
- Network failures
- API timeout
- Invalid responses
- Extension permissions
```

---

## 📊 MVP 개발 체크리스트

### Week 1
- [ ] Chrome Extension 보일러플레이트 (AI 생성)
- [ ] Content Script DOM 파서 구현
- [ ] Popup UI 기본 구조
- [ ] Chrome Storage 연동

### Week 2  
- [ ] Serverless 백엔드 구축
- [ ] OpenAI API 연동
- [ ] Slack Webhook 전송
- [ ] Rate limiting 구현

### Week 3
- [ ] UI/UX 개선
- [ ] 에러 처리 강화
- [ ] 테스트 코드 작성 (AI 생성)
- [ ] 배포 준비

### 출시 전 체크
- [ ] Chrome Web Store 제출
- [ ] 모니터링 설정
- [ ] 사용자 가이드 작성
- [ ] 피드백 채널 구축

---

## 🔗 유용한 리소스

### AI 프롬프트 템플릿
- [Awesome ChatGPT Prompts](https://github.com/f/awesome-chatgpt-prompts)
- [OpenAI Cookbook](https://cookbook.openai.com/)

### Chrome Extension 개발
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)

### Serverless 템플릿
- [Vercel Examples](https://github.com/vercel/examples)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

---

**작성일**: 2025년 11월 18일  
**대상**: Engineering Team  
**목적**: GenAI를 활용한 빠른 MVP 개발