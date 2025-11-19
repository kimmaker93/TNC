# Team News Clipper (TNC) 기술 개발 전략서

## 📋 문서 정보
- **문서 버전**: v1.0
- **작성일**: 2025년 11월 18일
- **작성자**: CTO
- **대상**: Engineering Team & Stakeholders

---

## 1. Executive Summary

### 1.1 프로젝트 개요
Team News Clipper(TNC)는 웹 브라우저에서 수집한 정보를 AI로 요약하여 Slack으로 즉시 공유하는 Chrome Extension 기반 B2B 생산성 도구입니다.

### 1.2 핵심 기술 전략
- **MVP 우선 접근**: Webhook 기반 단순 구조로 빠른 시장 검증
- **비용 최적화**: Serverless 아키텍처 채택으로 초기 인프라 비용 최소화
- **확장성 확보**: 향후 OAuth 2.0 및 타 플랫폼 지원을 위한 모듈화 설계

---

## 2. 시스템 아키텍처 설계

### 2.1 전체 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                         사용자 브라우저                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            Chrome Extension (Frontend)              │    │
│  │  ├─ Content Script (DOM Parser)                    │    │
│  │  ├─ Popup UI (React)                              │    │
│  │  └─ Background Service Worker                      │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Infrastructure                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         Serverless Functions (Vercel/AWS Lambda)     │    │
│  │  ├─ /api/summarize    → OpenAI API 호출            │    │
│  │  ├─ /api/send-slack   → Webhook 전송               │    │
│  │  └─ /api/health       → 상태 체크                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
    ┌──────────────┐            ┌──────────────┐
    │  OpenAI API  │            │ Slack Webhook │
    └──────────────┘            └──────────────┘
```

### 2.2 기술 스택 결정

#### Frontend (Chrome Extension)
- **Core**: Manifest V3 (Chrome Extension 최신 표준)
- **UI Framework**: React 18 + TypeScript
- **State Management**: Zustand (경량화)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite + CRXJS Plugin
- **Testing**: Vitest + React Testing Library

#### Backend (Serverless)
- **Runtime**: Node.js 20 LTS
- **Framework**: Next.js 14 (API Routes) 또는 Express.js
- **Deployment**: Vercel (우선) / AWS Lambda (대안)
- **Language**: TypeScript
- **Validation**: Zod
- **Rate Limiting**: Upstash Redis

#### AI & Integration
- **LLM**: OpenAI GPT-4o-mini
- **SDK**: OpenAI Node.js SDK v4
- **Messaging**: Slack Webhook API

### 2.3 데이터 흐름 설계

```typescript
// 데이터 흐름 인터페이스 정의
interface WebPageData {
  url: string;
  title: string;
  content: string;
  timestamp: number;
}

interface SummaryRequest {
  pageData: WebPageData;
  mode: 'summary' | 'keywords';
  language: 'ko' | 'en';
}

interface SummaryResponse {
  summary: string | string[];
  tags?: string[];
  processingTime: number;
}

interface SlackPayload {
  text: string;
  attachments?: Array<{
    color: string;
    fields: Array<{
      title: string;
      value: string;
      short: boolean;
    }>;
  }>;
}
```

---

## 3. API 명세서 (초안)

### 3.1 요약 생성 API

**Endpoint**: `POST /api/summarize`

**Request**:
```json
{
  "content": "웹페이지 본문 텍스트",
  "title": "페이지 제목",
  "url": "https://example.com",
  "mode": "summary",
  "maxTokens": 150
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": "3줄 요약된 텍스트...",
    "keywords": ["키워드1", "키워드2"],
    "processingTime": 2.3
  },
  "usage": {
    "inputTokens": 1200,
    "outputTokens": 150,
    "cost": 0.0023
  }
}
```

### 3.2 Slack 전송 API

**Endpoint**: `POST /api/send-slack`

**Request**:
```json
{
  "webhookUrl": "https://hooks.slack.com/services/...",
  "summary": "요약 텍스트",
  "metadata": {
    "title": "페이지 제목",
    "url": "원본 URL",
    "tags": ["태그1", "태그2"]
  }
}
```

**Response**:
```json
{
  "success": true,
  "messageId": "msg_12345",
  "timestamp": "2025-11-18T10:00:00Z"
}
```

### 3.3 사용량 체크 API

**Endpoint**: `GET /api/usage`

**Headers**:
```
X-User-Id: <chrome-extension-user-id>
```

**Response**:
```json
{
  "dailyLimit": 5,
  "used": 3,
  "remaining": 2,
  "resetsAt": "2025-11-19T00:00:00Z"
}
```

---

## 4. 핵심 구현 전략

### 4.1 DOM 파싱 최적화

```javascript
// Content Script 구현 전략
class ContentParser {
  constructor() {
    this.selectors = {
      // 주요 사이트별 본문 선택자 매핑
      default: 'main, article, [role="main"], #content',
      // SPA 대응
      observer: new MutationObserver(this.handleDOMChange)
    };
  }

  async extractContent() {
    // 1. Readability.js 라이브러리 활용
    // 2. 커스텀 파싱 로직 (fallback)
    // 3. 텍스트 정제 및 노이즈 제거
    return {
      title: this.getTitle(),
      content: this.getMainContent(),
      metadata: this.getMetadata()
    };
  }

  // SPA 대응 - 동적 콘텐츠 로딩 감지
  observeSPA() {
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}
```

### 4.2 비용 방어 로직 구현

```typescript
// Extension Popup 컴포넌트
const SummaryPopup: React.FC = () => {
  const [state, setState] = useState<'ready' | 'loading' | 'complete'>('ready');
  
  // 2단계 실행 방식
  const handleIconClick = () => {
    // 1단계: DOM 파싱만 수행 (비용 없음)
    const pageData = await parseCurrentPage();
    setState('ready');
  };
  
  const handleStartClick = () => {
    // 2단계: 사용자 확인 후 AI API 호출
    setState('loading');
    const summary = await callSummaryAPI(pageData);
    setState('complete');
  };
  
  return (
    <div className="popup-container">
      {state === 'ready' && (
        <button onClick={handleStartClick}>
          요약 시작 (1일 {remaining}/5회)
        </button>
      )}
      {state === 'loading' && <LoadingSpinner />}
      {state === 'complete' && <SummaryResult />}
    </div>
  );
};
```

### 4.3 프롬프트 엔지니어링

```typescript
// 모드별 프롬프트 분기 처리
const generatePrompt = (content: string, mode: 'summary' | 'keywords') => {
  const prompts = {
    summary: `
      다음 텍스트를 3줄로 요약해주세요.
      - 핵심 정보 위주로 간결하게
      - 비즈니스 관점에서 중요한 내용 우선
      - 한국어로 작성
      
      텍스트: ${content}
    `,
    keywords: `
      다음 텍스트에서 핵심 키워드 5개를 추출해주세요.
      - JSON 배열 형식으로 반환
      - 중요도 순으로 정렬
      
      텍스트: ${content}
    `
  };
  
  return prompts[mode];
};
```

### 4.4 보안 고려사항

```typescript
// API Key 프록시 서버 구현
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Origin 검증
  const origin = req.headers.origin;
  if (!isValidExtensionOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // 2. Rate Limiting
  const userId = req.headers['x-user-id'];
  const { success, remaining } = await checkRateLimit(userId);
  
  if (!success) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // 3. OpenAI API 호출 (서버에서만 키 보관)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // 4. 응답 및 로깅
  const result = await openai.chat.completions.create({...});
  
  // 개인정보 보호: 콘텐츠 로깅 제외
  logger.info({ userId, timestamp: Date.now(), tokens: result.usage });
  
  return res.json(result);
}
```

---

## 5. 개발 로드맵 및 마일스톤

### Phase 1: Foundation (Week 1-2)
**목표**: 기본 인프라 및 개발 환경 구축

- [ ] Chrome Extension 보일러플레이트 설정
- [ ] Serverless 백엔드 환경 구축 (Vercel)
- [ ] OpenAI API 연동 테스트
- [ ] Slack Webhook 전송 테스트

### Phase 2: Core Features (Week 3-4)
**목표**: 핵심 기능 구현

- [ ] DOM 파싱 모듈 개발
- [ ] AI 요약 API 구현
- [ ] Extension Popup UI 개발
- [ ] 설정 저장 기능 (chrome.storage)

### Phase 3: Enhancement (Week 5)
**목표**: 사용성 개선 및 최적화

- [ ] SPA 사이트 대응
- [ ] 로딩 상태 및 에러 처리
- [ ] 사용량 제한 로직
- [ ] 글자 수 카운터 UI

### Phase 4: Testing & Launch (Week 6)
**목표**: QA 및 배포

- [ ] 단위 테스트 작성
- [ ] 통합 테스트
- [ ] Chrome Web Store 제출
- [ ] 모니터링 설정

---

## 6. 리스크 관리 및 대응 방안

### 6.1 기술적 리스크

| 리스크 | 영향도 | 대응 방안 |
|-------|--------|----------|
| OpenAI API 비용 초과 | 높음 | - 사용량 제한 강화<br>- 캐싱 전략 도입 |
| DOM 파싱 실패 | 중간 | - Readability.js 활용<br>- 수동 텍스트 입력 옵션 |
| Slack 전송 실패 | 낮음 | - 재시도 로직<br>- 클립보드 복사 대안 |
| SPA 콘텐츠 로딩 | 중간 | - MutationObserver 활용<br>- 타이밍 조절 |

### 6.2 확장성 고려사항

```typescript
// 메신저 플랫폼 추상화
interface MessengerAdapter {
  send(payload: MessagePayload): Promise<void>;
  authenticate?(): Promise<AuthToken>;
}

class SlackWebhookAdapter implements MessengerAdapter {
  async send(payload: MessagePayload) {
    // Webhook 전송 로직
  }
}

class SlackOAuthAdapter implements MessengerAdapter {
  async authenticate() {
    // OAuth 2.0 인증
  }
  
  async send(payload: MessagePayload) {
    // OAuth API 전송
  }
}

// 향후 Discord, Teams 등 추가 가능
class DiscordAdapter implements MessengerAdapter {
  // ...
}
```

---

## 7. 성능 목표 및 메트릭

### 7.1 성능 KPI
- **응답 시간**: 요약 생성 5초 이내 (P95)
- **성공률**: API 호출 성공률 99% 이상
- **비용 효율**: 사용자당 월 $0.5 이하

### 7.2 모니터링 메트릭
```javascript
// 클라이언트 메트릭 수집
const metrics = {
  domParsingTime: 0,
  apiResponseTime: 0,
  totalProcessingTime: 0,
  errorRate: 0,
  userActions: []
};

// 서버 메트릭 (Vercel Analytics)
- API 응답 시간
- 토큰 사용량
- 에러 발생률
- 일일 활성 사용자
```

---

## 8. 개발 가이드라인

### 8.1 코드 컨벤션
- **언어**: TypeScript (strict mode)
- **포맷팅**: Prettier + ESLint
- **커밋**: Conventional Commits
- **브랜치**: Git Flow

### 8.2 GenAI 활용 개발 가이드

```markdown
## AI 도구 활용 전략

### 권장 활용 영역
1. **보일러플레이트 생성**
   - Chrome Extension 기본 구조
   - React 컴포넌트 템플릿
   - API 엔드포인트 기본 코드

2. **유틸리티 함수**
   - DOM 파싱 헬퍼
   - 데이터 변환 함수
   - 에러 처리 로직

3. **테스트 코드 작성**
   - 단위 테스트
   - 통합 테스트 시나리오

### 주의 사항
- 보안 관련 코드는 반드시 수동 검토
- API Key 처리 로직은 직접 구현
- 핵심 비즈니스 로직은 팀 리뷰 필수
```

---

## 9. 결론 및 다음 단계

### 9.1 핵심 결정 사항
1. **Serverless 우선**: 초기 비용 최소화 및 자동 스케일링
2. **모듈화 설계**: 향후 확장성 확보
3. **2단계 실행**: 비용 방어 및 사용자 제어권 보장

### 9.2 즉시 실행 사항
1. Vercel 계정 생성 및 프로젝트 설정
2. Chrome Extension 개발자 등록
3. OpenAI API Key 발급
4. Slack 테스트 워크스페이스 생성

### 9.3 추가 검토 필요 사항
- 디자인 시스템 확정 (디자인팀 협의)
- 유료 플랜 기능 상세 정의
- GDPR 등 규제 준수 방안

---

## 📎 첨부 문서
- [Chrome Extension Manifest V3 가이드](https://developer.chrome.com/docs/extensions/mv3/)
- [Vercel Serverless Functions 문서](https://vercel.com/docs/functions)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)

---

**작성자**: CTO  
**검토 요청**: Engineering Team  
**승인 대상**: CPO, CEO  
**최종 수정일**: 2025년 11월 18일