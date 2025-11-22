-- TNC Pro Database Schema
-- 이 스키마는 Supabase SQL Editor에서 실행하세요

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. users 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  profile_picture TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 2. user_integrations 테이블
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('slack', 'discord', 'teams')),
  webhook_url TEXT NOT NULL,
  workspace_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. scrap_logs 테이블
CREATE TABLE IF NOT EXISTS scrap_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES user_integrations(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT,
  summary TEXT,
  keywords TEXT[],
  persona TEXT DEFAULT 'general' CHECK (persona IN ('general', 'marketing', 'dev', 'biz')),
  insight TEXT,
  user_comment TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. usage_logs 테이블
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('summarize', 'share')),
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. weekly_newsletters 테이블
CREATE TABLE IF NOT EXISTS weekly_newsletters (
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

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_scrap_logs_user_id ON scrap_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_scrap_logs_created_at ON scrap_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);

-- Row-Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_newsletters ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- users 테이블: 사용자는 자신의 정보만 조회/수정 가능
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- user_integrations 테이블: 사용자는 자신의 연동만 관리 가능
CREATE POLICY "Users can view own integrations" ON user_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON user_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON user_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON user_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- scrap_logs 테이블: 사용자는 자신의 스크랩만 조회/생성/삭제 가능
CREATE POLICY "Users can view own scraps" ON scrap_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scraps" ON scrap_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scraps" ON scrap_logs
  FOR DELETE USING (auth.uid() = user_id);

-- usage_logs 테이블: 사용자는 자신의 사용량만 조회 가능
CREATE POLICY "Users can view own usage" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- weekly_newsletters 테이블: 사용자는 자신의 뉴스레터만 조회 가능
CREATE POLICY "Users can view own newsletters" ON weekly_newsletters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own newsletters" ON weekly_newsletters
  FOR INSERT WITH CHECK (auth.uid() = user_id);
