# TNC Pro 개발 시작 가이드 (Quick Start)

## 📦 전달 받은 문서

1. **TNC_Pro_Development_Prompt.md** (개발 프롬프트)
   - Claude Code에 전달할 개발 지침서
   - 기술 아키텍처, 기능 요구사항, 구현 원칙 포함
   - 총 6개 핵심 기능 + 3단계 개발 계획

2. **TNC_Pro_Prompt_Usage_Guide.md** (사용 가이드)
   - 프롬프트를 효과적으로 사용하는 방법
   - 단계별 시나리오와 예시 포함
   - 트러블슈팅 및 팁

---

## 🚀 3분 안에 시작하기

### 1단계: 문서 배치
```bash
# 프로젝트 폴더에 문서 복사
mkdir -p ~/tnc-extension/docs
cp TNC_Pro_Development_Prompt.md ~/tnc-extension/docs/
cp TNC_Pro_Prompt_Usage_Guide.md ~/tnc-extension/docs/
```

### 2단계: Claude Code 실행
```bash
cd ~/tnc-extension
claude-code
```

### 3단계: 첫 번째 프롬프트 입력
```
Claude, TNC_Pro_Development_Prompt.md 파일을 읽고, Phase 1의 첫 번째 항목인 "Google OAuth 인증 시스템"을 구현해줘.

구체적으로:
1. Chrome Extension Manifest V3에서 oauth2 설정 추가
2. src/pages/AuthPage.tsx 컴포넌트 생성
3. src/background/auth.ts에서 Chrome Identity API 연동
4. Zustand Store에 사용자 상태 저장

프롬프트 문서의 "Feature 1: Google OAuth 인증 시스템" 섹션을 참고해.
```

---

## 📋 개발 순서 (권장)

### Phase 1: MVP (2주)
1. ✅ **Week 1**
   - Day 1-2: Google OAuth 인증
   - Day 3-4: Backend API (Supabase)
   - Day 5-6: Slack 연동
   - Day 7: 테스트 및 버그 수정

2. ✅ **Week 2**
   - Day 8-9: 스크랩 기능 (AI 요약)
   - Day 10-11: 히스토리 페이지
   - Day 12-13: 멀티 디바이스 동기화
   - Day 14: 통합 테스트

### Phase 2: Pro 기능 (2주)
3. ✅ **Week 3**
   - Day 15-16: ROI 대시보드
   - Day 17-18: 주간 뉴스레터
   - Day 19-20: Stripe 결제
   - Day 21: 테스트

4. ✅ **Week 4**
   - Day 22-24: 버그 수정 및 UX 개선
   - Day 25-28: 배포 준비 (Chrome Web Store)

---

## 💡 핵심 포인트

### DO ✅
- **단계별로 진행**: 한 번에 하나의 기능만 요청
- **문서 참조 명시**: "프롬프트 문서의 [섹션명]을 참고해"
- **동작 확인 후 다음 단계**: 각 기능 완성 후 테스트
- **에러는 즉시 공유**: 에러 메시지를 Claude에게 복사-붙여넣기

### DON'T ❌
- **전체 프로젝트를 한 번에 요청하지 마세요**: 에러 추적 어려움
- **모호한 요청 금지**: "그거 만들어줘" 대신 구체적으로 명시
- **API Key 하드코딩 금지**: 반드시 환경 변수 사용
- **테스트 없이 다음 단계 진행 금지**: 버그가 누적됨

---

## 🎯 MVP 완료 기준

다음 플로우가 **End-to-End로 동작하면 MVP 완료**:

```
1. Google 로그인 ✅
   ↓
2. Slack 워크스페이스 연동 ✅
   ↓
3. 웹 페이지 스크랩 ✅
   ↓
4. AI 요약 생성 (3초 이내) ✅
   ↓
5. Slack에 메시지 전송 ✅
   ↓
6. History에서 조회 가능 ✅
   ↓
7. 다른 PC에서 로그인 → 동일한 히스토리 확인 ✅
```

---

## 🔧 환경 설정 (개발 시작 전)

### 필수 계정 생성
1. **Google Cloud Console**
   - OAuth 2.0 Client ID 생성
   - URL: https://console.cloud.google.com

2. **Supabase**
   - 프로젝트 생성 (무료)
   - URL: https://supabase.com

3. **OpenAI**
   - API Key 발급 ($5 충전 권장)
   - URL: https://platform.openai.com

4. **Stripe** (Phase 2에서 필요)
   - 계정 생성 (테스트 모드 사용)
   - URL: https://stripe.com

### 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:
```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (Phase 2)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 📞 문의 및 지원

### 개발 중 막히면?
1. **먼저 사용 가이드 확인**: `TNC_Pro_Prompt_Usage_Guide.md` 참조
2. **Claude에게 질문**: 에러 메시지를 복사-붙여넣기
3. **공식 문서 참조**:
   - Chrome Extensions: https://developer.chrome.com/docs/extensions/
   - Supabase Docs: https://supabase.com/docs
   - React Docs: https://react.dev

### 일반적인 문제 해결
- **"Module not found" 에러**: `npm install [패키지명]`
- **"Permission denied" 에러**: Manifest에 권한 추가 확인
- **"CORS error" 에러**: Backend에서 CORS 헤더 설정 확인

---

## ✅ 최종 체크리스트

### 개발 시작 전
- [ ] 문서 2개를 프로젝트 폴더에 복사함
- [ ] Google Cloud, Supabase, OpenAI 계정 생성함
- [ ] `.env.local` 파일 작성함
- [ ] Claude Code 설치 및 실행 확인함

### MVP 개발 중
- [ ] Google OAuth 로그인 동작 확인함
- [ ] Slack 연동 및 테스트 메시지 전송 성공함
- [ ] AI 요약 생성 (3초 이내) 동작함
- [ ] Slack 메시지 전송 성공함
- [ ] History 조회 및 검색 동작함
- [ ] 멀티 디바이스 동기화 확인함

### Pro 기능 개발 중
- [ ] ROI 대시보드 통계 표시됨
- [ ] 주간 뉴스레터 자동 발송 설정함
- [ ] Stripe 결제 플로우 동작함
- [ ] Free 플랜 5회 제한 적용됨

---

## 🎉 성공적인 개발을 위한 마지막 조언

1. **천천히, 확실하게**: 급하게 진행하지 말고 각 단계를 확실히 검증
2. **문서를 신뢰하세요**: 프롬프트 문서는 수십 번의 테스트를 거쳐 작성됨
3. **Claude와 대화하세요**: 막히면 즉시 질문하고 피드백 받기
4. **Git 커밋 자주**: 기능 완성마다 커밋하여 롤백 가능하도록

**준비되셨나요? 이제 시작하세요!** 🚀

```bash
claude-code
```
