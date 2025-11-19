# 🛠️ Team News Clipper 개발 가이드

## 🚀 빠른 시작

### 1. 저장소 클론 및 의존성 설치

```bash
git clone <repository-url>
cd TNC
npm install
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 내용 (개발 모드에서는 Mock API 사용):

```env
# OpenAI API Key (실제 배포 시 필요)
OPENAI_API_KEY=sk-your-api-key-here

# API Base URL
# 개발: Mock API 자동 사용 (서버 없이 테스트 가능)
# 프로덕션: 배포된 Vercel URL로 변경
VITE_API_BASE_URL=http://localhost:3000
```

### 3. 개발 서버 실행

```bash
npm run dev
```

서버가 시작되면 `http://localhost:5173`에서 실행됩니다.

### 4. Chrome Extension 로드

1. Chrome 브라우저에서 `chrome://extensions/` 접속
2. 우측 상단 "개발자 모드" 토글 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트의 `dist` 폴더 선택

## 🔧 개발 모드 특징

### Mock API 자동 사용

백엔드 서버 없이도 Extension을 테스트할 수 있도록 Mock API가 자동으로 활성화됩니다.

- `.env` 파일이 없거나 `VITE_API_BASE_URL`이 설정되지 않은 경우
- API URL에 `your-serverless-api`가 포함된 경우

Mock API는 다음을 시뮬레이션합니다:
- AI 요약 생성 (1.5초 지연)
- Slack 전송 (1초 지연)
- 실제 응답 형식과 동일한 데이터 구조

### Hot Module Replacement (HMR)

코드 변경 시 자동으로 리로드됩니다:
- React 컴포넌트는 상태를 유지하며 즉시 업데이트
- 포트: 5173 (고정)

## ⚠️ 자주 발생하는 문제 및 해결

### 1. "Extension context invalidated" 에러

**원인:** 개발 중 Extension을 다시 로드하면 발생하는 정상적인 현상입니다.

**해결 방법:**
1. Chrome Extension 페이지(`chrome://extensions/`)에서 "새로고침" 버튼 클릭
2. 테스트 중인 페이지 새로고침
3. 또는 브라우저 콘솔에서 자동으로 페이지가 리로드됩니다

**자동 복구:** CRXJS가 이를 감지하고 자동으로 페이지를 리로드합니다.

### 2. WebSocket 연결 에러

```
Failed to construct 'WebSocket': The URL 'ws://localhost:undefined/?token=...' is invalid
```

**원인:** Vite HMR 설정 문제

**해결 방법:**
- `vite.config.ts`에서 포트가 명시적으로 설정되어 있는지 확인
- 이미 수정되어 있으므로 `npm run dev` 재시작

### 3. "Failed to fetch" API 에러

**원인:** 백엔드 서버가 실행되지 않음

**해결 방법:**
- **개발 모드:** Mock API가 자동으로 사용되므로 무시해도 됨
- **프로덕션 모드:** Vercel에 배포 후 `.env`에 실제 URL 설정

```env
VITE_API_BASE_URL=https://your-app.vercel.app
```

### 4. TypeScript 에러

```bash
# TypeScript 체크
npm run build

# 또는 watch 모드
npx tsc --watch --noEmit
```

### 5. Extension이 페이지 콘텐츠를 추출하지 못함

**원인:**
- SPA (Single Page Application) 로딩 지연
- 특수한 페이지 구조

**해결 방법:**
- 페이지가 완전히 로드된 후 Extension 아이콘 클릭
- 콘솔에서 `[TNC]` 로그 확인

## 📁 프로젝트 구조

```
TNC/
├── src/
│   ├── popup/              # Popup UI (React)
│   │   ├── components/     # UI 컴포넌트
│   │   ├── App.tsx         # 메인 앱
│   │   ├── store.ts        # Zustand 상태 관리
│   │   └── api.ts          # API 클라이언트 (Mock 포함)
│   ├── content/            # Content Script
│   │   ├── parser.ts       # DOM 파싱
│   │   └── index.ts        # 메시지 핸들러
│   ├── background/         # Background Service Worker
│   │   └── index.ts        # 메시지 라우팅
│   └── shared/             # 공유 모듈
│       ├── types.ts        # TypeScript 타입
│       ├── constants.ts    # 상수
│       └── utils.ts        # 유틸리티 함수
├── api/                    # Serverless Functions (Vercel)
│   ├── summarize.ts        # OpenAI 요약 API
│   └── send-slack.ts       # Slack 전송 API
├── public/
│   └── icons/              # Extension 아이콘
├── scripts/
│   └── create-icons.cjs    # 아이콘 생성 스크립트
├── manifest.json           # Chrome Extension Manifest
├── vite.config.ts          # Vite 설정
└── .env                    # 환경 변수 (생성 필요)
```

## 🔍 디버깅

### Chrome DevTools

#### Popup 디버깅
1. Extension 아이콘 클릭 후 팝업 표시
2. 팝업 우클릭 → "검사" 클릭
3. DevTools에서 React 컴포넌트 및 콘솔 확인

#### Content Script 디버깅
1. 웹페이지에서 F12 (DevTools 열기)
2. Console 탭에서 `[TNC]` 로그 확인
3. Sources 탭에서 content script 중단점 설정

#### Background Service Worker 디버깅
1. `chrome://extensions/` 접속
2. "서비스 워커" 링크 클릭
3. 별도 DevTools 창에서 디버깅

### 유용한 콘솔 명령어

```javascript
// 현재 페이지 콘텐츠 추출 테스트
ContentParser.extractContent().then(console.log)

// Storage 확인
chrome.storage.sync.get(null, console.log)

// Storage 초기화
chrome.storage.sync.clear()
```

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# watch 모드
npm run test -- --watch

# 커버리지
npm run test -- --coverage
```

## 📦 빌드

### 개발 빌드

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

### 프로덕션 빌드

1. `.env` 파일에 실제 API URL 설정
2. 아이콘 파일 교체 (`public/icons/`)
3. 빌드 실행

```bash
npm run build
```

4. `dist/` 폴더를 zip으로 압축
5. Chrome Web Store에 업로드

## 🚢 배포

### Serverless API (Vercel)

```bash
# Vercel 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod

# 환경 변수 설정
vercel env add OPENAI_API_KEY production
```

### Chrome Web Store

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
2. "새 항목" 클릭
3. `dist` 폴더를 zip으로 압축하여 업로드
4. 스토어 등록 정보 입력
5. 검토 제출

## 🔐 환경 변수

### 로컬 개발

`.env` 파일:

```env
OPENAI_API_KEY=sk-...
VITE_API_BASE_URL=http://localhost:3000
```

### Vercel 배포

Vercel Dashboard 또는 CLI로 설정:

```bash
vercel env add OPENAI_API_KEY
```

### Extension 빌드

`.env` 파일의 `VITE_API_BASE_URL`을 배포된 Vercel URL로 변경:

```env
VITE_API_BASE_URL=https://your-app.vercel.app
```

## 🎨 코드 스타일

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Git Hooks (권장)

```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:

```bash
npm run lint
npm run format
```

## 📚 추가 리소스

- [Chrome Extension 개발 가이드](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 마이그레이션](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin)
- [OpenAI API 문서](https://platform.openai.com/docs)
- [Slack Webhook API](https://api.slack.com/messaging/webhooks)

## 🤝 기여

1. 이슈 생성
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: Add amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📞 지원

문제가 발생하면:
1. 이 문서의 "자주 발생하는 문제" 섹션 확인
2. 콘솔 로그 확인 (`[TNC]` 접두사)
3. GitHub Issues에 문제 보고
