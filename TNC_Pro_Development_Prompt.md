# TNC Pro 개발 프롬프트 (Claude Code 전달용)

## 📌 프로젝트 개요

**프로젝트명**: Team News Clipper (TNC) Pro  
**목적**: Chrome Extension의 익명 사용 모델을 Google OAuth 기반 개인화 시스템으로 전환  
**핵심 가치**: 멀티 디바이스 동기화, 데이터 영속성, 개인화된 인사이트 제공

---

## 🎯 현재 상태 (AS-IS) 및 목표 (TO-BE)

### AS-IS: 익명 사용 모델의 한계
현재 TNC는 다음과 같이 동작합니다:
- Slack Webhook URL만으로 팀 식별
- 로컬 Chrome Storage에만 데이터 저장 (확장 프로그램 재설치 시 손실)
- 단일 디바이스에서만 사용 가능
- 사용자별 히스토리, 통계, 결제 관리 불가능

### TO-BE: 개인화된 멀티 디바이스 시스템
다음과 같은 시스템으로 전환해야 합니다:
- **Google OAuth 기반 사용자 인증**: 클릭 2번으로 로그인 완료
- **클라우드 데이터 저장**: Supabase를 통한 영구 데이터 저장
- **멀티 디바이스 동기화**: 어디서든 동일한 히스토리 접근
- **개인화 기능**: ROI 대시보드, 주간 뉴스레터, 사용 통계
- **Pro 플랜**: Stripe 기반 결제 시스템

---

## 🏗️ 기술 아키텍처

### Frontend (Chrome Extension)
- **React 18 + TypeScript**: UI 컴포넌트 개발
- **Vite**: 번들링 및 빌드 도구
- **Tailwind CSS**: 스타일링
- **Zustand**: 전역 상태 관리
- **Chrome Identity API**: Google OAuth 인증
- **Chrome Storage API**: 로컬 데이터 캐싱

### Backend (Serverless)
- **Supabase**: PostgreSQL 데이터베이스 + Row-Level Security
- **Vercel Serverless Functions**: API 엔드포인트
- **OpenAI API**: AI 요약 생성
- **Stripe**: 결제 및 구독 관리

### 데이터베이스 스키마

#### 1. users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_picture TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free' | 'pro'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
```

#### 2. user_integrations 테이블
```sql
CREATE TABLE user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- 'slack' | 'discord' | 'teams'
  webhook_url TEXT NOT NULL,
  workspace_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. scrap_logs 테이블
```sql
CREATE TABLE scrap_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES user_integrations(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  keywords TEXT[],
  persona TEXT DEFAULT 'general', -- 'general' | 'marketing' | 'dev' | 'biz'
  insight TEXT,
  user_comment TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. usage_logs 테이블
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'summarize' | 'share'
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. weekly_newsletters 테이블
```sql
CREATE TABLE weekly_newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES user_integrations(id) ON DELETE SET NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  scraps_included INTEGER DEFAULT 0,
  meta_summary TEXT,
  sent_at TIMESTAMPTZ,
  slack_message_ts TEXT
);
```

---

## 🎨 핵심 기능 요구사항

### Feature 1: Google OAuth 인증 시스템

#### 사용자 플로우
1. **미인증 사용자가 확장 프로그램 열기** → AuthPage 표시
2. **"Google로 시작하기" 버튼 클릭** → Chrome Identity API를 통한 OAuth 진행
3. **Google 권한 승인** → Access Token 획득
4. **Backend에 Token 전송** → 사용자 정보 저장 및 JWT 발급
5. **Chrome Storage에 사용자 정보 저장** → 이후 자동 로그인
6. **최초 로그인 시** → Settings 페이지로 자동 이동 (Slack 연동 안내)
7. **재방문 시** → Summary 페이지로 이동 (바로 사용 가능)

#### 구현 세부사항
- **Chrome Extension Manifest V3 설정**:
  ```json
  {
    "oauth2": {
      "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      "scopes": ["profile", "email"]
    },
    "permissions": ["identity", "storage"]
  }
  ```

- **AuthPage 컴포넌트**:
  - 미니멀한 디자인 (Google 로그인 버튼만 강조)
  - 로딩 상태 표시 ("로그인 중..." → "사용자 정보 확인 중..." → "완료!")
  - 에러 처리 (네트워크 오류, 권한 거부 등)
  - 개인정보 처리방침 링크 하단 표시

- **Backend API Endpoint**:
  ```
  POST /api/auth/login
  Request Body: { "googleToken": "..." }
  Response: { "jwt": "...", "user": { id, email, name, ... } }
  ```

- **JWT 기반 인증**:
  - 모든 API 요청에 `Authorization: Bearer <JWT>` 헤더 포함
  - JWT 만료 시 자동 갱신 (Refresh Token 패턴)

#### UX 고려사항
- **로딩 피드백**: 버튼 클릭 후 즉시 스피너 표시
- **에러 메시지**: 사용자 친화적 문구 사용 (예: "로그인에 실패했습니다. 다시 시도해주세요")
- **자동 로그인**: Chrome Sync를 통해 다른 기기에서도 자동 로그인

---

### Feature 2: Slack 연동 관리

#### 사용자 플로우
1. **Settings 페이지에서 "Slack 워크스페이스 추가" 클릭**
2. **Webhook URL 입력 폼 표시** (가이드 포함)
3. **테스트 메시지 자동 전송** → Slack에 "TNC 연동 성공!" 메시지 도착
4. **연동 성공 시** → 워크스페이스 카드에 추가
5. **여러 워크스페이스 관리 가능** (활성화/비활성화, 삭제)

#### 구현 세부사항
- **SettingsPage 컴포넌트**:
  - 연동된 워크스페이스 목록 표시 (카드 형태)
  - 각 카드에 "활성화/비활성화" 토글, "삭제" 버튼
  - Webhook URL 추가 폼 (입력 검증 포함)

- **Backend API Endpoints**:
  ```
  GET /api/integrations → 사용자의 모든 연동 조회
  POST /api/integrations → 새 연동 추가 (테스트 메시지 전송)
  PATCH /api/integrations/:id → 활성화 상태 변경
  DELETE /api/integrations/:id → 연동 삭제
  ```

- **Webhook 검증 로직**:
  - URL 형식 검사: `https://hooks.slack.com/services/...`
  - 테스트 메시지 전송 후 응답 확인 (200 OK)
  - 실패 시 사용자에게 에러 메시지 표시

#### UX 고려사항
- **가이드 제공**: Slack Webhook URL 생성 방법 (스크린샷 포함)
- **삭제 확인**: "정말 삭제하시겠습니까?" 다이얼로그
- **즉각적 피드백**: 연동 성공 시 "✅ 연동 완료!" Toast 메시지

---

### Feature 3: 스크랩 히스토리 및 동기화

#### 사용자 플로우
1. **웹 페이지에서 확장 프로그램 아이콘 클릭** → 콘텐츠 자동 추출
2. **AI 요약 생성** (페르소나 선택 가능)
3. **사용자 코멘트 추가 (선택)**
4. **"Slack에 공유" 클릭** → Backend에 스크랩 저장 + Slack 전송
5. **History 페이지에서 조회** → 모든 기기에서 동일한 히스토리 표시

#### 구현 세부사항
- **SummaryPage 컴포넌트**:
  - 페르소나 선택 라디오 버튼 (일반, 마케팅, 개발, 비즈니스)
  - AI 요약 결과 표시 (3줄 요약, 키워드, 인사이트)
  - 사용자 코멘트 입력 텍스트박스
  - "Slack에 공유" 버튼 (로딩 상태 표시)

- **HistoryPage 컴포넌트**:
  - 스크랩 카드 리스트 (제목, 요약, 날짜 표시)
  - 검색 기능 (제목, 키워드 검색)
  - 필터 기능 (페르소나별, 날짜별)
  - 무한 스크롤 또는 페이지네이션

- **Backend API Endpoints**:
  ```
  POST /api/scraps → 새 스크랩 저장 (AI 요약 + Slack 전송)
  GET /api/scraps → 스크랩 목록 조회 (Pagination, Search, Filter)
  DELETE /api/scraps/:id → 스크랩 삭제
  ```

#### UX 고려사항
- **오프라인 대응**: 네트워크 오류 시 로컬에 임시 저장 후 재연결 시 동기화
- **절약 시간 표시**: "14분 절약하셨어요!" (단어 수 기반 계산)
- **빠른 재사용**: History에서 과거 스크랩 클릭 → 다시 Slack 공유 가능

---

### Feature 4: ROI 대시보드

#### 사용자 플로우
1. **Stats 페이지 열기**
2. **Free 사용자**: 제한된 통계만 표시 (총 스크랩 수, 절약 시간)
3. **Pro 사용자**: 고급 통계 표시 (월별 트렌드, 페르소나별 분포, 키워드 클라우드)

#### 구현 세부사항
- **StatsPage 컴포넌트**:
  - Free/Pro 분기 처리 (구독 상태 확인)
  - 통계 카드 (총 스크랩 수, 절약 시간, 평균 스크랩/주)
  - 차트 (Recharts 라이브러리 사용)

- **Backend API Endpoint**:
  ```
  GET /api/stats → 사용자 통계 반환
  Response: {
    totalScraps: 42,
    timeSavedMinutes: 210,
    avgScrapsPerWeek: 10.5,
    personaDistribution: { general: 20, dev: 15, ... },
    monthlyTrend: [ { month: "2025-01", count: 12 }, ... ]
  }
  ```

#### UX 고려사항
- **Free 제한 명확화**: Pro 전용 기능은 흐릿하게 + "Pro로 업그레이드" 버튼
- **시각적 임팩트**: 큰 숫자로 "168분 절약" 강조
- **비교 제공**: "지난달 대비 30% 증가" 같은 인사이트

---

### Feature 5: 주간 뉴스레터 (Pro 전용)

#### 사용자 플로우
1. **매주 월요일 오전 9시** → Cron Job 실행
2. **Pro 사용자 대상**: 지난 주 스크랩 수집
3. **AI로 주간 요약 생성**: "이번 주 주요 트렌드: AI 규제, SaaS 성장"
4. **Slack에 자동 전송**: 하이라이트 3개 + 전체 히스토리 링크

#### 구현 세부사항
- **Cron Job 설정** (Vercel Cron 또는 Supabase Edge Functions):
  ```
  매주 월요일 09:00 (UTC+9) 실행
  ```

- **뉴스레터 생성 로직**:
  1. 지난 주 월~일 스크랩 조회 (user_id별)
  2. OpenAI API로 메타 요약 생성
  3. Slack 메시지 포맷팅
  4. `weekly_newsletters` 테이블에 이력 저장

- **Slack 메시지 포맷**:
  ```
  📧 이번 주 [이름]님의 스크랩 다이제스트
  
  총 12개의 콘텐츠를 스크랩하셨어요!
  주요 트렌드: AI 규제, SaaS 성장 전략
  
  [이번 주 하이라이트 3개]
  1. [제목] - [요약]
  2. [제목] - [요약]
  3. [제목] - [요약]
  
  💾 168분을 절약하셨습니다 (약 2.8시간)
  🎯 가장 많이 다룬 주제: AI (5회)
  
  [전체 히스토리 보기] (버튼)
  ```

#### UX 고려사항
- **Settings에서 설정**: 뉴스레터 받을 Slack 워크스페이스 선택
- **발송 이력 표시**: "지난 뉴스레터: 2025-01-20 발송됨"
- **중복 발송 방지**: 동일 주에 이미 발송된 경우 skip

---

### Feature 6: Pro 플랜 및 결제 (Stripe)

#### 사용자 플로우
1. **Free 한도 도달** (5회/월) → 업그레이드 안내 팝업
2. **"Pro로 업그레이드" 클릭** → Stripe Checkout 페이지 이동
3. **결제 완료** → Stripe Webhook으로 Backend 알림
4. **DB 업데이트**: `subscription_tier = 'pro'`
5. **즉시 Pro 기능 활성화** (무제한 스크랩, 뉴스레터)

#### 구현 세부사항
- **Stripe 설정**:
  - Product 생성: "TNC Pro" ($9.99/month)
  - Checkout Session 생성 API
  - Webhook 수신 (결제 성공 이벤트)

- **Backend API Endpoints**:
  ```
  POST /api/stripe/create-checkout-session → Checkout URL 반환
  POST /api/stripe/webhook → Stripe 이벤트 수신 및 DB 업데이트
  GET /api/subscription → 현재 구독 상태 조회
  POST /api/subscription/cancel → 구독 취소
  ```

- **Free 플랜 제한 로직**:
  ```typescript
  const canScrap = async (userId: string) => {
    const usageThisMonth = await db.usage_logs
      .where('user_id', userId)
      .where('created_at', '>=', startOfMonth)
      .count();
    
    const user = await db.users.findById(userId);
    if (user.subscription_tier === 'pro') return true;
    if (usageThisMonth >= 5) return false; // Free 한도 초과
    return true;
  };
  ```

#### UX 고려사항
- **가치 강조**: "지금까지 70분 절약하셨어요. Pro로 무제한 사용하세요!"
- **명확한 비교**: Free vs Pro 기능 표 제공
- **환불 정책**: "첫 30일 내 취소 시 전액 환불" 안내

---

## 🚀 개발 우선순위 및 단계

### Phase 1: MVP (Week 1-2) - 핵심 기능만 우선 구현
이 단계에서는 사용자가 로그인하고, Slack에 스크랩을 공유할 수 있는 최소 기능만 구현합니다.

#### 체크리스트
- [ ] **Google OAuth 인증 시스템**
  - Chrome Identity API 연동
  - AuthPage UI 구현
  - Backend: POST /api/auth/login (JWT 발급)
  - Chrome Storage에 사용자 정보 저장

- [ ] **Slack 연동 관리**
  - SettingsPage UI 구현
  - Backend: GET/POST/DELETE /api/integrations
  - Webhook URL 검증 및 테스트 메시지 전송

- [ ] **기본 스크랩 기능**
  - SummaryPage UI 구현 (페르소나 선택, 코멘트 입력)
  - Backend: POST /api/scraps (OpenAI API 연동, Slack 전송)
  - HistoryPage UI 구현 (목록 조회, 검색)

- [ ] **Supabase 데이터베이스 설정**
  - Schema 생성 (users, user_integrations, scrap_logs)
  - Row-Level Security (RLS) 설정
  - API 엔드포인트 구현 (Vercel Serverless Functions)

**완료 기준**: 사용자가 Google 로그인 → Slack 연동 → 웹 페이지 스크랩 → Slack 공유 → 히스토리 조회가 가능해야 함

---

### Phase 2: Pro 기능 (Week 3-4)
MVP가 완성되면 유료 기능을 추가합니다.

#### 체크리스트
- [ ] **ROI 대시보드**
  - StatsPage UI 구현 (Free/Pro 분기)
  - Backend: GET /api/stats (통계 계산)
  - usage_logs 테이블에 사용량 기록

- [ ] **주간 뉴스레터**
  - Cron Job 설정 (Vercel Cron)
  - AI 메타 요약 생성 로직
  - Slack 뉴스레터 메시지 포맷
  - weekly_newsletters 테이블에 이력 저장

- [ ] **Stripe 결제 시스템**
  - Stripe 계정 생성 및 Product 설정
  - Backend: POST /api/stripe/create-checkout-session
  - Webhook 수신 및 DB 업데이트 (subscription_tier)
  - 구독 관리 UI (Settings)

- [ ] **Free 플랜 제한**
  - 월 5회 스크랩 제한 로직
  - 한도 도달 시 업그레이드 안내 팝업

**완료 기준**: Free 사용자가 5회 제한을 받고, Pro로 전환하면 무제한 사용 + 뉴스레터 수신 가능

---

### Phase 3: 개선 및 확장 (Week 5+)
사용자 피드백을 받아 추가 기능을 구현합니다.

#### 우선순위 높음
- [ ] 다크 모드 지원
- [ ] 스크랩 삭제 기능
- [ ] Discord/Teams 연동

#### 우선순위 중간
- [ ] AI 인사이트 품질 개선
- [ ] 공유 기능 (LinkedIn, Twitter)
- [ ] 팀 기능 (여러 명이 하나의 계정 공유)

---

## ✅ 구현 시 반드시 지켜야 할 원칙

### 1. 보안
- **절대 API Key를 Frontend에 노출하지 않기**: OpenAI, Stripe Key는 Backend에만 보관
- **JWT 검증**: 모든 API 요청에서 JWT 유효성 검증
- **Row-Level Security (RLS)**: Supabase에서 사용자별 데이터 접근 제한
- **HTTPS만 사용**: 모든 통신은 암호화

### 2. UX
- **로딩 상태 명확화**: 모든 비동기 작업에 스피너 또는 프로그레스 바 표시
- **에러 메시지 친절하게**: 기술 용어 대신 사용자 친화적 문구 사용
- **즉각적 피드백**: 버튼 클릭 후 0.1초 내에 시각적 변화
- **오류 복구 용이**: 삭제 전 확인 다이얼로그, Undo 기능

### 3. 성능
- **API 응답 속도**: 모든 엔드포인트 1초 이내 응답
- **캐싱**: Chrome Storage에 사용자 정보, 히스토리 캐싱
- **Pagination**: 히스토리 조회 시 한 번에 20개씩만 로드

### 4. 확장성
- **모듈화**: 각 기능을 독립적인 컴포넌트/모듈로 분리
- **타입 안정성**: 모든 함수와 컴포넌트에 TypeScript 타입 정의
- **플랫폼 중립성**: Slack 외 Discord, Teams 추가 시 쉽게 확장 가능하도록 설계

---

## 🎯 예상 질문 및 해결 방안

### Q1: Chrome Identity API가 작동하지 않으면?
**A**: Manifest에 `oauth2` 설정과 `permissions: ["identity"]`가 정확히 입력되었는지 확인. Google Cloud Console에서 Authorized JavaScript origins와 Redirect URIs 설정도 확인.

### Q2: Supabase RLS를 어떻게 설정하나?
**A**: 각 테이블에 대해 다음과 같은 Policy 추가:
```sql
-- 사용자는 자신의 데이터만 조회/수정/삭제 가능
CREATE POLICY "Users can access own data"
ON scrap_logs
FOR ALL
USING (auth.uid() = user_id);
```

### Q3: Free 플랜 제한을 어떻게 체크하나?
**A**: 매 스크랩 요청 시 `usage_logs` 테이블에서 당월 사용량을 COUNT하여 5회 초과 시 거부. Pro 사용자는 체크 skip.

### Q4: Stripe Webhook이 수신되지 않으면?
**A**: Stripe Dashboard에서 Webhook Endpoint URL이 올바르게 설정되었는지 확인. `checkout.session.completed` 이벤트를 subscribe하도록 설정.

### Q5: 멀티 디바이스 동기화가 느리면?
**A**: 스크랩 생성/수정 시 즉시 Backend에 저장하고, 히스토리 조회 시 Backend에서 가져오기. Chrome Storage는 캐싱 용도로만 사용.

---

## 📝 최종 체크리스트

### 개발 시작 전 준비
- [ ] Google Cloud Console에서 OAuth 2.0 Client ID 생성
- [ ] Supabase 프로젝트 생성 및 Database URL 획득
- [ ] OpenAI API Key 발급
- [ ] Stripe 계정 생성 (Pro 기능 시)
- [ ] GitHub Repository 생성 및 `.env` 파일 설정

### MVP 완료 기준
- [ ] Google 계정으로 로그인 가능
- [ ] Slack 워크스페이스 연동 가능
- [ ] 웹 페이지 스크랩 → AI 요약 생성
- [ ] Slack에 메시지 자동 전송
- [ ] 스크랩 히스토리 조회 및 검색
- [ ] 멀티 디바이스 동기화 동작 (다른 PC에서 로그인 시 히스토리 보임)

### Pro 기능 완료 기준
- [ ] ROI 대시보드에서 통계 확인 가능
- [ ] 주간 뉴스레터 자동 발송 (매주 월요일 9시)
- [ ] Free → Pro 결제 플로우 동작
- [ ] Free 플랜 5회/월 제한 적용

### 배포 준비
- [ ] Chrome Web Store 개발자 계정 생성 ($5 등록비)
- [ ] 확장 프로그램 아이콘, 스크린샷 준비
- [ ] 개인정보 처리방침, 이용약관 작성
- [ ] Backend를 Vercel에 배포
- [ ] 환경 변수 (API Keys) 프로덕션 설정

---

## 🚀 개발 시작 가이드

### 1단계: 환경 설정
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
cd tnc-extension
npm install

# 환경 변수 설정 (.env.local)
VITE_GOOGLE_CLIENT_ID=...
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
STRIPE_SECRET_KEY=...
```

### 2단계: 데이터베이스 스키마 생성
Supabase Dashboard → SQL Editor에서 위의 CREATE TABLE 문 실행

### 3단계: MVP 개발 시작
1. AuthPage 구현 (Google OAuth)
2. Background Script에서 Chrome Identity API 연동
3. Backend API (/api/auth/login) 구현
4. SettingsPage 구현 (Slack 연동)
5. SummaryPage 구현 (스크랩 기능)
6. HistoryPage 구현 (히스토리 조회)

### 4단계: 테스트
- 로그인 → Slack 연동 → 스크랩 → Slack 확인 → 히스토리 조회
- 다른 PC에서 로그인 → 동일한 히스토리 보이는지 확인

---

## 📌 중요 참고사항

### 문서 읽는 순서
이 문서를 읽은 후 다음 순서로 개발을 진행하세요:
1. **Phase 1 MVP 개발** (2주)
2. **사용자 테스트** (피드백 수집)
3. **Phase 2 Pro 기능 개발** (2주)
4. **배포 및 마케팅**

### 코드 작성 시 주의사항
- **모든 함수에 TypeScript 타입 명시**
- **에러 처리 철저히** (try-catch, 에러 메시지 사용자에게 표시)
- **콘솔 로그 제거** (프로덕션 빌드 전)
- **주석 작성** (복잡한 로직에만 간단히)

### 참고 문서
- Chrome Extension Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Chrome Identity API: https://developer.chrome.com/docs/extensions/reference/identity/
- Supabase Auth: https://supabase.com/docs/guides/auth
- Stripe Checkout: https://stripe.com/docs/payments/checkout

---

**이 프롬프트는 Claude Code에 복사-붙여넣기하여 바로 개발을 시작할 수 있도록 작성되었습니다.**  
**각 단계를 순서대로 진행하며, 완료된 항목은 체크리스트에 표시하세요.** ✅
