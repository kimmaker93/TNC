# 🚀 Team News Clipper 로컬 실행 가이드

처음부터 끝까지 로컬 환경에서 실행하는 방법입니다.

## 📋 사전 준비

### 필수 소프트웨어
- **Node.js**: v18 이상 (권장: v20 LTS)
- **npm**: v9 이상
- **Git**: 최신 버전
- **Chrome 브라우저**: 최신 버전

### 설치 확인
```bash
node --version   # v18 이상
npm --version    # v9 이상
git --version
```

---

## 📥 Step 1: 저장소 클론

```bash
# 저장소 클론
git clone https://github.com/kimmaker93/TNC.git
# 또는 SSH 사용 시
git clone git@github.com:kimmaker93/TNC.git

# 프로젝트 디렉토리로 이동
cd TNC

# 개발 브랜치로 전환
git checkout claude/build-from-guides-01HkuTLss7Vq6arqA6idhkhi
```

---

## 📦 Step 2: 의존성 설치

```bash
npm install
```

**예상 소요 시간:** 1-3분

**설치되는 패키지:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- CRXJS Vite Plugin
- 기타 개발 도구들

---

## ⚙️ Step 3: 환경 변수 설정

### 3-1. .env 파일 생성

```bash
# .env.example을 복사하여 .env 생성
cp .env.example .env
```

### 3-2. .env 파일 내용

파일을 열어서 확인:
```bash
cat .env
```

**기본 내용:**
```env
# OpenAI API Key (실제 배포 시 필요)
OPENAI_API_KEY=sk-your-api-key-here

# API Base URL
VITE_API_BASE_URL=http://localhost:3000
```

### 3-3. 개발 모드에서는 수정 불필요!

**중요:** 현재는 Mock API가 자동으로 작동하므로 `.env` 파일을 수정하지 않아도 됩니다.

- `OPENAI_API_KEY`: 나중에 실제 배포할 때만 필요
- `VITE_API_BASE_URL`: Mock API가 자동 활성화되므로 무시됨

---

## 🛠️ Step 4: 개발 서버 실행

```bash
npm run dev
```

**실행되는 작업:**
1. 아이콘 파일 자동 생성 (`public/icons/*.png`)
2. Vite 개발 서버 시작 (포트: 5173)
3. Extension 빌드 (`dist/` 폴더)

**성공 메시지 예시:**
```
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help

CRXJS Vite Plugin
Chrome Extension builder
```

**주의:** 이 터미널 창은 계속 실행 상태로 유지하세요!

---

## 🔧 Step 5: Chrome Extension 로드

### 5-1. Chrome 확장 프로그램 관리 페이지 열기

다음 중 하나의 방법 사용:

**방법 1:** 주소창에 직접 입력
```
chrome://extensions/
```

**방법 2:** 메뉴에서 접근
- Chrome 우측 상단 ⋮ (점 3개) 클릭
- "확장 프로그램" → "확장 프로그램 관리" 클릭

### 5-2. 개발자 모드 활성화

페이지 우측 상단의 **"개발자 모드"** 토글을 켜기 (파란색)

### 5-3. Extension 로드

1. **"압축해제된 확장 프로그램을 로드합니다"** 버튼 클릭
2. 파일 탐색기에서 프로젝트의 **`dist`** 폴더 선택
3. "폴더 선택" 클릭

**올바른 경로:**
```
/your/path/to/TNC/dist
```

### 5-4. 설치 확인

Extension 목록에 **"Team News Clipper"**가 나타나야 합니다:

```
Team News Clipper
버전: 1.0.0
설명: AI-powered web content summarizer for Slack
```

---

## ✅ Step 6: 테스트

### 6-1. 기본 동작 테스트

1. **아무 웹페이지나 열기**
   - 예: https://www.naver.com
   - 예: https://news.ycombinator.com

2. **Extension 아이콘 클릭**
   - Chrome 우측 상단의 퍼즐 아이콘 (확장 프로그램)
   - Team News Clipper 아이콘 클릭

3. **Popup 확인**
   - 400x600 크기의 팝업이 열려야 함
   - "페이지 정보를 불러오는 중..." 표시

4. **콘텐츠 추출 확인**
   - 잠시 후 "페이지 요약 준비 완료" 화면
   - 현재 페이지 제목과 URL 표시
   - "오늘 남은 무료 횟수: 5/5회" 표시

### 6-2. Mock API 테스트

1. **"✨ 요약 시작" 버튼 클릭**

2. **로딩 화면 확인** (1.5초)
   - "AI 분석 중..." 표시
   - 스피너 애니메이션

3. **요약 결과 확인**
   - 3줄 요약 표시
   - 키워드 5개 표시
   - 인사이트 표시
   - 내용 수정 가능

4. **콘솔 확인 (중요!)**
   - Popup 우클릭 → "검사" 클릭
   - Console 탭에서 다음 메시지 확인:
   ```
   [TNC] Using MOCK API (backend server not configured)
   ```

### 6-3. Slack 전송 테스트 (Mock)

1. **"🚀 Slack으로 전송" 버튼 클릭**

2. **콘솔 확인**
   ```
   [TNC] Using MOCK Slack send (backend server not configured)
   [TNC] Would send to Slack: { title: "...", url: "...", summary: ... }
   ```

3. **성공 메시지**
   - "✅ Slack으로 전송 완료!" 알림
   - Popup 자동 닫힘

---

## 🔍 문제 해결

### 문제 1: "npm run dev" 실행 시 포트 오류

**오류:**
```
Error: Port 5173 is already in use
```

**해결 방법:**

**macOS/Linux:**
```bash
# 5173 포트 사용 중인 프로세스 종료
lsof -ti:5173 | xargs kill -9

# 다시 실행
npm run dev
```

**Windows:**
```cmd
# 5173 포트 사용 중인 프로세스 찾기
netstat -ano | findstr :5173

# 해당 PID로 프로세스 종료
taskkill /PID <PID번호> /F

# 다시 실행
npm run dev
```

---

### 문제 2: Extension 로드 실패

**오류:**
```
Manifest file is missing or unreadable
```

**원인:**
- `dist` 폴더가 아닌 다른 폴더 선택
- 개발 서버가 실행되지 않음

**해결 방법:**
1. `npm run dev`가 실행 중인지 확인
2. 프로젝트 폴더에 `dist/` 폴더가 생성되었는지 확인
3. `dist/` 폴더를 정확히 선택했는지 확인

---

### 문제 3: "Extension context invalidated" 오류

**오류 메시지:**
```
Uncaught Error: Extension context invalidated.
```

**원인:**
- 개발 중 정상적인 현상
- 코드 변경 시 Extension이 자동으로 reload됨

**해결 방법:**
1. **무시해도 됨** - 자동으로 페이지가 reload됩니다
2. 또는 수동으로 페이지 새로고침 (F5)
3. Extension 새로고침: `chrome://extensions/`에서 "새로고침" 버튼

---

### 문제 4: 콘텐츠 추출 실패

**오류:**
```
페이지 본문을 추출할 수 없습니다
```

**원인:**
- `chrome://`, `edge://` 같은 특수 페이지
- Extension 내부 페이지
- Content script 로드 실패

**해결 방법:**
1. **일반 웹페이지**에서 테스트 (예: news 사이트)
2. 페이지 완전히 로드된 후 Extension 클릭
3. 페이지 새로고침 후 재시도

---

### 문제 5: Mock API가 작동하지 않음

**증상:**
```
[TNC] Summarize API error: TypeError: Failed to fetch
```

**원인:**
- 환경 변수가 로드되지 않음
- 빌드 캐시 문제

**해결 방법:**

```bash
# 1. 개발 서버 중단 (Ctrl+C)

# 2. 캐시 삭제
rm -rf dist node_modules/.vite

# 3. .env 파일 확인
cat .env
# VITE_API_BASE_URL이 있어야 함

# 4. 개발 서버 재시작
npm run dev

# 5. Chrome에서 Extension 완전 재로드
# chrome://extensions/ -> 제거 -> 다시 로드
```

---

## 🎯 개발 모드 특징

### ✅ 현재 사용 가능한 기능

- ✅ 웹페이지 콘텐츠 추출
- ✅ Mock AI 요약 생성 (1.5초 지연)
- ✅ Mock Slack 전송 (1초 지연)
- ✅ 요약 결과 편집
- ✅ 사용량 관리 (일일 5회 제한)
- ✅ Hot Module Replacement

### ⚠️ 현재 사용 불가능한 기능

- ❌ 실제 OpenAI API 호출 (Mock 사용)
- ❌ 실제 Slack 전송 (Mock 사용)
- ❌ OAuth 인증 (Pro 기능 - 추후 구현)

---

## 🔄 코드 수정 시

### 자동 Reload

**파일 수정하면:**
1. Vite가 변경 감지
2. 자동으로 재빌드
3. Extension 자동 reload
4. 페이지 자동 refresh

### 수동 Reload가 필요한 경우

**manifest.json 수정 시:**
1. `chrome://extensions/` 접속
2. Team News Clipper의 "새로고침" 버튼 클릭

---

## 🌐 실제 API 사용하려면

### 1. Vercel에 백엔드 배포

```bash
# Vercel 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod

# 환경 변수 설정
vercel env add OPENAI_API_KEY production
```

### 2. .env 파일 수정

배포된 Vercel URL로 변경:

```env
VITE_API_BASE_URL=https://your-app-name.vercel.app
OPENAI_API_KEY=sk-your-real-api-key
```

### 3. 개발 서버 재시작

```bash
# Ctrl+C로 중단 후
npm run dev
```

### 4. Extension 재로드

`chrome://extensions/`에서 제거 후 다시 로드

---

## 📞 추가 도움말

### 상세 문서
- `README.md`: 프로젝트 개요
- `DEVELOPMENT.md`: 개발 가이드 및 문제 해결
- `SETUP.md`: 상세 설정 가이드

### 콘솔 디버깅

**Popup 콘솔:**
- Popup 우클릭 → "검사"

**Content Script 콘솔:**
- 웹페이지에서 F12
- Console 탭에서 `[TNC]` 필터

**Background Service Worker 콘솔:**
- `chrome://extensions/` 접속
- "서비스 워커" 링크 클릭

---

## ✅ 정상 작동 체크리스트

- [ ] `npm run dev` 실행 성공
- [ ] `http://localhost:5173` 접속 가능
- [ ] `dist/` 폴더 생성됨
- [ ] Chrome에 Extension 로드됨
- [ ] 웹페이지에서 Extension 아이콘 클릭 가능
- [ ] Popup이 열림
- [ ] "요약 시작" 버튼 클릭 시 결과 표시
- [ ] 콘솔에 `[TNC] Using MOCK API` 메시지 확인
- [ ] Slack 전송 시 성공 메시지 표시

모든 항목이 체크되면 정상입니다! 🎉

---

## 🚀 다음 단계

로컬 개발이 완료되었다면:

1. **코드 수정 및 기능 추가**
2. **실제 API 연동 테스트**
3. **프로덕션 빌드**: `npm run build`
4. **Chrome Web Store 배포**

자세한 내용은 `DEVELOPMENT.md`를 참고하세요!
