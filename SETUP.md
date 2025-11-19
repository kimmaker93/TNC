# 🚀 Team News Clipper 설정 가이드

이 문서는 Team News Clipper를 처음 설정하는 방법을 단계별로 안내합니다.

## 📋 사전 준비

### 1. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 계정 생성 또는 로그인
3. API Keys 메뉴에서 새 API 키 생성
4. 생성된 키를 안전한 곳에 보관

### 2. Slack Webhook URL 생성

1. [Slack API](https://api.slack.com/apps) 접속
2. "Create New App" 클릭
3. "From scratch" 선택
4. App 이름 입력 (예: Team News Clipper)
5. Workspace 선택
6. 생성 후 "Incoming Webhooks" 메뉴 선택
7. "Activate Incoming Webhooks" 토글 활성화
8. "Add New Webhook to Workspace" 클릭
9. 메시지를 보낼 채널 선택
10. 생성된 Webhook URL 복사

## 🛠️ 개발 환경 설정

### 1. 프로젝트 클론 및 설치

```bash
# 저장소 클론
git clone <repository-url>
cd TNC

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env
```

`.env` 파일 편집:

```env
# OpenAI API 키 (필수)
OPENAI_API_KEY=sk-your-actual-api-key-here

# API Base URL (개발 환경)
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Chrome Extension 로컬 개발

```bash
# 개발 모드 실행
npm run dev
```

Chrome에서 Extension 로드:

1. `chrome://extensions/` 접속
2. 우측 상단 "개발자 모드" 토글 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트의 `dist` 폴더 선택

### 4. Serverless API 로컬 테스트 (선택)

Vercel CLI 사용:

```bash
# Vercel CLI 설치
npm install -g vercel

# 로컬 개발 서버 실행
vercel dev

# 환경 변수 설정
vercel env add OPENAI_API_KEY
```

## 🌐 프로덕션 배포

### 1. Vercel에 배포

```bash
# Vercel 로그인
vercel login

# 프로젝트 배포
vercel

# 환경 변수 설정 (프로덕션)
vercel env add OPENAI_API_KEY production
```

배포 완료 후 URL 확인 (예: `https://your-app.vercel.app`)

### 2. Extension에 프로덕션 API URL 설정

`.env` 파일 업데이트:

```env
VITE_API_BASE_URL=https://your-app.vercel.app
```

### 3. Extension 프로덕션 빌드

```bash
npm run build
```

### 4. Chrome Web Store 업로드

1. `dist` 폴더를 zip으로 압축
2. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
3. 새 항목 만들기
4. zip 파일 업로드
5. 스토어 등록 정보 입력:
   - 이름: Team News Clipper
   - 설명: AI 기반 웹 콘텐츠 요약 및 Slack 공유 도구
   - 카테고리: Productivity
   - 아이콘 업로드
   - 스크린샷 추가
6. 개인정보 보호 정책 링크 추가 (필수)
7. 검토 제출

## 👤 사용자 설정 가이드

Extension 설치 후 사용자가 해야 할 설정:

### 1. Slack Webhook URL 입력

1. Extension 아이콘 클릭
2. 설정(⚙️) 아이콘 클릭
3. "Slack Webhook URL" 입력란에 URL 붙여넣기
4. 저장

### 2. 요약 모드 선택

1. 설정 페이지에서 요약 모드 선택:
   - **3줄 요약**: 핵심 내용을 3개의 문장으로 요약
   - **키워드**: 핵심 키워드 5개 추출

## 🔒 보안 고려사항

### API 키 관리

- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env` 포함 확인
- 프로덕션 환경에서는 Vercel 환경 변수 사용

### Webhook URL

- 사용자의 Webhook URL은 Chrome Storage에 암호화되어 저장됩니다
- 서버에 저장되지 않으며, API 호출 시에만 전송됩니다

## 🐛 문제 해결

### Extension이 로드되지 않을 때

1. `npm run build` 재실행
2. Chrome Extension 페이지에서 "새로고침" 버튼 클릭
3. 브라우저 콘솔에서 에러 확인

### API 호출 실패

1. `.env` 파일의 `OPENAI_API_KEY` 확인
2. `VITE_API_BASE_URL` 정확한지 확인
3. Vercel 배포 상태 확인
4. 네트워크 탭에서 요청 상태 확인

### Slack 전송 실패

1. Webhook URL 형식 확인 (`https://hooks.slack.com/services/...`)
2. Slack App 권한 확인
3. Webhook이 활성화되어 있는지 확인

## 📞 지원

문제가 해결되지 않으면:

- GitHub Issues에 문제 보고
- 로그 및 에러 메시지 첨부
- 환경 정보 제공 (OS, Chrome 버전 등)
