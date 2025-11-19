# 📰 Team News Clipper (TNC)

> AI 기반 웹 콘텐츠 요약 및 Slack 공유 Chrome Extension

Team News Clipper는 웹 브라우저에서 읽고 있는 콘텐츠를 AI로 요약하여 팀 Slack 채널로 즉시 공유할 수 있는 생산성 도구입니다.

## ✨ 주요 기능

- 🤖 **AI 요약**: OpenAI GPT-4o-mini를 활용한 정확한 콘텐츠 요약
- 📝 **듀얼 모드**: 3줄 요약 또는 키워드 추출 선택 가능
- 💬 **인사이트 & 코멘트**: AI 인사이트와 개인 코멘트 추가
- 🚀 **Slack 연동**: Webhook을 통한 간편한 Slack 전송
- 💰 **비용 방어**: 사용자 확인 후에만 API 호출
- 📊 **사용량 관리**: 일일 무료 사용 제한 (5회/일)

## 🛠️ 기술 스택

### Frontend (Chrome Extension)
- React 18 + TypeScript
- Zustand (상태 관리)
- Tailwind CSS
- Vite + CRXJS Plugin

### Backend (Serverless)
- Vercel Serverless Functions
- Node.js 20
- OpenAI API

## 📦 설치 및 실행

### 1. 저장소 클론

```bash
git clone https://github.com/your-org/team-news-clipper.git
cd team-news-clipper
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 필요한 값 입력:

```env
OPENAI_API_KEY=sk-your-openai-api-key
VITE_API_BASE_URL=http://localhost:3000
```

### 4. 개발 모드 실행

```bash
npm run dev
```

### 5. Chrome Extension 로드

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `dist` 폴더 선택

### 6. Serverless API 배포 (Vercel)

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add OPENAI_API_KEY
```

## 🚀 빌드 및 배포

### Production 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### Chrome Web Store 배포

1. `dist` 폴더를 zip으로 압축
2. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
3. 새 항목 생성 및 zip 파일 업로드
4. 스토어 등록 정보 입력 및 제출

## 📖 사용 방법

### 1. 초기 설정

Extension 설치 후 Slack Webhook URL 설정:

1. Extension 아이콘 클릭
2. 설정 페이지에서 Slack Webhook URL 입력
3. 요약 모드 선택 (3줄 요약 / 키워드)

### 2. 콘텐츠 요약 및 공유

1. 요약하고 싶은 웹페이지 열기
2. Extension 아이콘 클릭
3. "요약 시작" 버튼 클릭
4. AI 요약 결과 확인 및 수정
5. 인사이트/코멘트 추가 (선택)
6. "Slack으로 전송" 버튼 클릭

## 🔧 개발 가이드

### 프로젝트 구조

```
TNC/
├── src/
│   ├── popup/              # Popup UI (React)
│   │   ├── components/     # React 컴포넌트
│   │   ├── App.tsx         # 메인 앱
│   │   ├── store.ts        # Zustand 스토어
│   │   └── api.ts          # API 클라이언트
│   ├── content/            # Content Script
│   │   ├── parser.ts       # DOM 파서
│   │   └── index.ts        # 진입점
│   ├── background/         # Background Service Worker
│   │   └── index.ts
│   └── shared/             # 공유 유틸리티
│       ├── types.ts        # TypeScript 타입
│       ├── constants.ts    # 상수
│       └── utils.ts        # 유틸 함수
├── api/                    # Serverless API
│   ├── summarize.ts        # 요약 API
│   └── send-slack.ts       # Slack 전송 API
├── manifest.json           # Chrome Extension Manifest
├── package.json
└── vite.config.ts
```

### 주요 파일 설명

- **`src/popup/App.tsx`**: Popup UI 메인 컴포넌트, 상태별 View 렌더링
- **`src/content/parser.ts`**: 웹페이지 DOM 파싱 및 본문 추출
- **`src/background/index.ts`**: Background Service Worker, 메시지 라우팅
- **`api/summarize.ts`**: OpenAI API 호출 및 요약 생성
- **`api/send-slack.ts`**: Slack Webhook 전송

### API 엔드포인트

#### POST /api/summarize

페이지 콘텐츠를 AI로 요약합니다.

**Request:**
```json
{
  "content": "웹페이지 본문",
  "title": "페이지 제목",
  "url": "https://example.com",
  "mode": "summary"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": ["요약 1", "요약 2", "요약 3"],
    "keywords": ["키워드1", "키워드2"],
    "insight": "인사이트",
    "processingTime": 2.3
  }
}
```

#### POST /api/send-slack

요약 결과를 Slack으로 전송합니다.

**Request:**
```json
{
  "webhookUrl": "https://hooks.slack.com/services/...",
  "title": "페이지 제목",
  "url": "https://example.com",
  "summary": ["요약 1", "요약 2"],
  "keywords": ["키워드1", "키워드2"],
  "insight": "인사이트",
  "comment": "코멘트"
}
```

## 🧪 테스트

```bash
npm run test
```

## 📝 라이선스

MIT License

## 👥 팀

- **CPO**: 제품 기획
- **CTO**: 기술 전략 및 아키텍처
- **Engineering Team**: 개발 및 구현

## 🔗 관련 링크

- [Chrome Extension 개발 가이드](https://developer.chrome.com/docs/extensions/)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Vercel 배포 가이드](https://vercel.com/docs)

## 📞 지원

문제가 발생하거나 제안사항이 있으시면 [Issues](https://github.com/your-org/team-news-clipper/issues)에 등록해주세요.
