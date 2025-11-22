# TNC Pro 개발 프롬프트 사용 가이드

## 📌 이 가이드의 목적

이 문서는 `TNC_Pro_Development_Prompt.md` 파일을 **Claude Code와 함께 효과적으로 사용하는 방법**을 안내합니다.

---

## 🎯 프롬프트의 구조 이해하기

개발 프롬프트는 다음과 같이 구성되어 있습니다:

### 1. 프로젝트 개요 (Overview)
- **목적**: 전체 프로젝트의 방향성 제시
- **내용**: AS-IS → TO-BE 전환, 핵심 가치
- **활용**: Claude Code가 전체 맥락을 이해하고 일관된 코드 작성

### 2. 기술 아키텍처 (Architecture)
- **목적**: 사용할 기술 스택과 데이터베이스 스키마 정의
- **내용**: React, Supabase, OpenAI, Stripe 등
- **활용**: Claude Code가 올바른 라이브러리와 패턴을 사용

### 3. 핵심 기능 요구사항 (Feature Requirements)
- **목적**: 각 기능의 사용자 플로우와 구현 세부사항 명시
- **내용**: Google OAuth, Slack 연동, 스크랩, 대시보드 등
- **활용**: Claude Code가 기능별로 정확한 코드 생성

### 4. 개발 우선순위 (Priorities)
- **목적**: 개발 순서와 체크리스트 제공
- **내용**: Phase 1 (MVP), Phase 2 (Pro), Phase 3 (개선)
- **활용**: 단계별로 프롬프트를 분할하여 사용

### 5. 구현 원칙 (Principles)
- **목적**: 보안, UX, 성능, 확장성 기준 제시
- **내용**: API Key 노출 금지, 에러 처리, 타입 안정성 등
- **활용**: Claude Code가 품질 높은 코드 작성

---

## 🚀 Claude Code 사용 방법

### Step 1: 프롬프트 파일 준비

1. **`TNC_Pro_Development_Prompt.md` 파일을 프로젝트 폴더에 복사**
   ```bash
   cp TNC_Pro_Development_Prompt.md ~/tnc-extension/docs/
   ```

2. **VSCode에서 프로젝트 열기**
   ```bash
   cd ~/tnc-extension
   code .
   ```

### Step 2: Claude Code 실행

1. **터미널에서 Claude Code 실행**
   ```bash
   claude-code
   ```

2. **또는 VSCode 내 터미널에서 실행**
   - VSCode 터미널 열기 (`Ctrl+``)
   - `claude-code` 입력

### Step 3: 프롬프트 전달 방법

#### 방법 A: 전체 프롬프트 한 번에 전달 (권장하지 않음)
```
Claude, TNC_Pro_Development_Prompt.md 파일을 읽고 전체 프로젝트를 개발해줘.
```

**문제점**:
- 한 번에 너무 많은 작업을 요청하면 Claude가 일부를 놓칠 수 있음
- 에러 발생 시 어디서 문제가 생겼는지 파악 어려움

#### 방법 B: 단계별로 분할 전달 (강력 권장 ✅)
```
Claude, TNC_Pro_Development_Prompt.md 파일을 읽어줘.
이제 Phase 1 MVP 중 "Google OAuth 인증 시스템"만 먼저 구현해줘.
```

**장점**:
- 각 기능을 집중적으로 개발
- 에러 발생 시 빠른 디버깅
- 진행 상황 확인 용이

---

## 📋 단계별 사용 시나리오

### 시나리오 1: MVP 개발 (Phase 1)

#### 1-1. Google OAuth 인증 시스템 구현

**프롬프트 예시**:
```
Claude, TNC_Pro_Development_Prompt.md 파일을 먼저 읽어줘.

[파일 읽기 완료 후]

좋아. 이제 Phase 1의 첫 번째 항목인 "Google OAuth 인증 시스템"을 구현해줘.
구체적으로 다음 작업을 해줘:

1. Chrome Extension Manifest V3에서 oauth2 설정 추가
2. src/pages/AuthPage.tsx 컴포넌트 생성 (UI는 Tailwind 사용)
3. src/background/auth.ts에서 Chrome Identity API 연동
4. Zustand Store에 사용자 상태 저장

참고: 프롬프트 문서의 "Feature 1: Google OAuth 인증 시스템" 섹션을 참고해.
```

**Claude의 예상 응답**:
- Manifest 파일 수정
- AuthPage 컴포넌트 생성
- Background Script 작성
- Zustand Store 설정

**확인 사항**:
- [ ] Manifest에 `oauth2`, `permissions: ["identity"]` 추가됨
- [ ] AuthPage UI가 미니멀하게 디자인됨
- [ ] "Google로 시작하기" 버튼 클릭 시 OAuth 진행
- [ ] 로딩 상태와 에러 처리 구현됨

---

#### 1-2. Backend API 설정

**프롬프트 예시**:
```
Claude, 이제 Backend API를 설정해줘.

1. Supabase 데이터베이스 스키마를 생성해줘 (users, user_integrations, scrap_logs 테이블)
2. Vercel Serverless Functions로 /api/auth/login 엔드포인트 구현
3. JWT 발급 로직 작성
4. Row-Level Security (RLS) Policy 추가

프롬프트 문서의 "기술 아키텍처 → 데이터베이스 스키마" 섹션을 참고해.
```

**Claude의 예상 응답**:
- SQL 스키마 파일 생성
- `/api/auth/login.ts` 파일 생성 (Vercel Serverless Function)
- JWT 생성/검증 유틸리티 함수
- Supabase RLS Policy SQL

**확인 사항**:
- [ ] Supabase에서 테이블이 정상 생성됨
- [ ] POST /api/auth/login 호출 시 JWT 반환됨
- [ ] RLS Policy로 사용자별 데이터 격리됨

---

#### 1-3. Slack 연동 관리

**프롬프트 예시**:
```
Claude, 이제 Slack 연동 기능을 구현해줘.

1. src/pages/SettingsPage.tsx 컴포넌트 생성
2. Slack Webhook URL 입력 폼 추가 (가이드 포함)
3. Backend API: GET/POST/DELETE /api/integrations 구현
4. Webhook URL 검증 로직 (테스트 메시지 전송)

프롬프트 문서의 "Feature 2: Slack 연동 관리" 섹션을 참고해.
```

**확인 사항**:
- [ ] Settings 페이지에서 Webhook URL 입력 가능
- [ ] 입력 후 "테스트 메시지" 자동 전송
- [ ] Slack에 "TNC 연동 성공!" 메시지 도착
- [ ] 여러 워크스페이스 추가/삭제 가능

---

#### 1-4. 스크랩 기능 구현

**프롬프트 예시**:
```
Claude, 이제 핵심 기능인 스크랩 기능을 구현해줘.

1. src/pages/SummaryPage.tsx 컴포넌트 생성 (페르소나 선택, 코멘트 입력)
2. Backend API: POST /api/scraps 구현 (OpenAI API 연동)
3. Slack Webhook 전송 로직
4. src/pages/HistoryPage.tsx 컴포넌트 생성 (목록 조회, 검색)

프롬프트 문서의 "Feature 3: 스크랩 히스토리 및 동기화" 섹션을 참고해.
```

**확인 사항**:
- [ ] 웹 페이지에서 확장 프로그램 클릭 시 Summary 페이지 표시
- [ ] AI 요약 생성 (3줄 요약, 키워드, 인사이트)
- [ ] "Slack에 공유" 클릭 시 메시지 전송
- [ ] History 페이지에서 과거 스크랩 조회 가능
- [ ] 검색 및 필터 기능 동작

---

### 시나리오 2: Pro 기능 개발 (Phase 2)

#### 2-1. ROI 대시보드 구현

**프롬프트 예시**:
```
Claude, MVP가 완성되었어. 이제 Phase 2의 ROI 대시보드를 구현해줘.

1. src/pages/StatsPage.tsx 컴포넌트 생성
2. Free/Pro 사용자 분기 처리 (Pro 전용 기능은 흐릿하게 표시)
3. Backend API: GET /api/stats 구현 (총 스크랩 수, 절약 시간, 월별 트렌드)
4. Recharts 라이브러리로 차트 추가

프롬프트 문서의 "Feature 4: ROI 대시보드" 섹션을 참고해.
```

---

#### 2-2. 주간 뉴스레터 구현

**프롬프트 예시**:
```
Claude, 이제 주간 뉴스레터 기능을 구현해줘.

1. Vercel Cron Job 설정 (매주 월요일 09:00)
2. 지난 주 스크랩 수집 로직
3. OpenAI API로 메타 요약 생성
4. Slack 메시지 포맷팅 (하이라이트 3개 포함)
5. weekly_newsletters 테이블에 이력 저장

프롬프트 문서의 "Feature 5: 주간 뉴스레터" 섹션을 참고해.
```

---

#### 2-3. Stripe 결제 시스템 구현

**프롬프트 예시**:
```
Claude, 이제 Stripe 결제 시스템을 구현해줘.

1. Stripe Checkout Session 생성 API 구현
2. Backend API: POST /api/stripe/create-checkout-session
3. Stripe Webhook 수신 로직 (결제 성공 시 subscription_tier 업데이트)
4. Settings에 "Pro로 업그레이드" 버튼 추가
5. Free 플랜 5회/월 제한 로직

프롬프트 문서의 "Feature 6: Pro 플랜 및 결제" 섹션을 참고해.
```

---

## 💡 효과적인 커뮤니케이션 팁

### 1. 명확한 요청
❌ 나쁜 예:
```
Claude, 스크랩 기능 만들어줘.
```

✅ 좋은 예:
```
Claude, SummaryPage 컴포넌트를 만들어줘. 
다음 요소를 포함해야 해:
- 페르소나 선택 라디오 버튼 (일반, 마케팅, 개발, 비즈니스)
- AI 요약 결과 표시 영역 (3줄 요약, 키워드, 인사이트)
- 사용자 코멘트 입력 텍스트박스
- "Slack에 공유" 버튼 (로딩 상태 포함)

프롬프트 문서의 "Feature 3: 스크랩 히스토리 및 동기화" 섹션을 참고해.
```

### 2. 참조 지정
항상 프롬프트 문서의 **특정 섹션**을 명시하세요:
```
프롬프트 문서의 "Feature 1: Google OAuth 인증 시스템" 섹션을 참고해.
```

### 3. 단계적 확인
각 기능 완성 후 다음 단계로 넘어가기 전에 **동작 확인**:
```
Claude, AuthPage가 잘 작동하는지 확인했어. 이제 Backend API를 만들어줘.
```

### 4. 에러 발생 시
에러 메시지를 **그대로 복사-붙여넣기**:
```
Claude, 다음 에러가 발생했어. 해결해줘:
```
Error: Cannot find module '@supabase/supabase-js'
```

해결 방법:
npm install @supabase/supabase-js
```
```

### 5. 코드 수정 요청
**구체적인 위치와 내용** 명시:
```
Claude, src/pages/AuthPage.tsx의 27번째 줄에서 로딩 스피너가 표시되지 않아. 
버튼 클릭 시 즉시 스피너를 표시하도록 수정해줘.
```

---

## 🔧 트러블슈팅

### Q1: Claude가 너무 많은 코드를 한 번에 작성해서 에러가 많아요
**A**: 프롬프트를 더 작은 단위로 분할하세요.

❌ 나쁜 예:
```
Claude, MVP 전체를 구현해줘.
```

✅ 좋은 예:
```
Claude, 먼저 AuthPage 컴포넌트만 만들어줘. 완료되면 다음 단계로 넘어갈게.
```

---

### Q2: Claude가 프롬프트 문서의 내용을 따르지 않아요
**A**: 참조 섹션을 명확히 지정하세요.

❌ 나쁜 예:
```
Claude, 로그인 기능 만들어줘.
```

✅ 좋은 예:
```
Claude, "Feature 1: Google OAuth 인증 시스템" 섹션의 "구현 세부사항"을 정확히 따라서 구현해줘.
특히 Manifest V3 설정과 Chrome Identity API 연동을 포함해야 해.
```

---

### Q3: 기존 코드를 수정해야 하는데 Claude가 새로 만들어요
**A**: "수정(modify)" 명령어를 사용하세요.

❌ 나쁜 예:
```
Claude, AuthPage에 에러 메시지 추가해줘.
```

✅ 좋은 예:
```
Claude, 기존 src/pages/AuthPage.tsx 파일을 수정해줘.
로그인 실패 시 "로그인에 실패했습니다. 다시 시도해주세요." 메시지를 표시하는 코드를 추가해줘.
```

---

### Q4: Claude가 환경 변수를 하드코딩해요
**A**: 환경 변수 사용을 명시적으로 요청하세요.

❌ 나쁜 예:
```
Claude, Supabase 연동해줘.
```

✅ 좋은 예:
```
Claude, Supabase를 연동해줘. 
주의: API Key는 절대 하드코딩하지 말고, .env 파일에서 환경 변수로 불러와야 해.
예: process.env.VITE_SUPABASE_URL
```

---

## 📊 진행 상황 추적

### 체크리스트 활용

프롬프트 문서에 포함된 체크리스트를 복사하여 별도 파일로 관리하세요:

**progress.md**
```markdown
# TNC Pro 개발 진행 상황

## Phase 1: MVP
- [x] Google OAuth 인증 시스템
  - [x] Manifest 설정
  - [x] AuthPage UI
  - [x] Background Script
  - [x] Zustand Store
- [x] Backend API 설정
  - [x] Supabase 스키마 생성
  - [x] /api/auth/login 구현
  - [x] JWT 발급
  - [x] RLS Policy
- [ ] Slack 연동 관리
  - [ ] SettingsPage UI
  - [ ] GET/POST/DELETE /api/integrations
  - [ ] Webhook URL 검증
- [ ] 스크랩 기능
  - [ ] SummaryPage UI
  - [ ] POST /api/scraps (OpenAI 연동)
  - [ ] HistoryPage UI

...
```

### Git Commit 메시지

각 기능 완성 시 커밋:
```bash
git commit -m "feat: Implement Google OAuth authentication system"
git commit -m "feat: Add Slack integration management"
git commit -m "feat: Implement scrap functionality with AI summary"
```

---

## 🎯 최종 확인

### MVP 완료 체크리스트
모든 항목을 확인한 후 Phase 2로 넘어가세요:

- [ ] **Google 로그인 테스트**
  - Chrome Extension 설치 → AuthPage 표시
  - "Google로 시작하기" 클릭 → OAuth 진행
  - 로그인 성공 → Settings 페이지 이동

- [ ] **Slack 연동 테스트**
  - Webhook URL 입력
  - 테스트 메시지 자동 전송
  - Slack에서 메시지 확인

- [ ] **스크랩 기능 테스트**
  - 웹 페이지 → 확장 프로그램 클릭
  - AI 요약 생성 (3초 이내)
  - "Slack에 공유" → Slack 메시지 확인
  - History 페이지에서 스크랩 조회

- [ ] **멀티 디바이스 동기화 테스트**
  - 다른 PC에서 로그인
  - 기존 스크랩 히스토리가 보이는지 확인

---

## 📚 추가 리소스

### Claude Code 사용법
- 공식 문서: https://docs.anthropic.com/claude-code
- GitHub: https://github.com/anthropics/claude-code

### 기술 스택 문서
- Chrome Extension Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- React + TypeScript: https://react.dev/learn/typescript
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs

---

## 🚀 다음 단계

1. **Phase 1 MVP 완료** → 내부 테스트 (2-3명)
2. **피드백 수집** → 개선사항 리스트 작성
3. **Phase 2 Pro 기능 개발** → 결제 시스템 추가
4. **베타 테스트** → 10-20명 규모
5. **Chrome Web Store 배포** → 공식 출시

---

**이 가이드를 활용하여 TNC Pro를 성공적으로 개발하세요!** 🎉

문의사항이 있으면 언제든지 Claude에게 질문하세요:
```
Claude, [구체적인 질문]
```
