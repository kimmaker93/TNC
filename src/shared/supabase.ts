/**
 * Supabase 클라이언트 설정
 */

import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 Key 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and Anon Key must be provided in environment variables.\n' +
    'Please check your .env.local file.'
  );
}

/**
 * Supabase 클라이언트 인스턴스
 *
 * Chrome Extension에서 사용 가능하도록 설정
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Chrome Extension에서는 localStorage 대신 custom storage 사용
    storage: {
      getItem: async (key: string) => {
        const result = await chrome.storage.local.get(key);
        return result[key] || null;
      },
      setItem: async (key: string, value: string) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key: string) => {
        await chrome.storage.local.remove(key);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Chrome Extension에서는 URL 감지 비활성화
  },
});

/**
 * Supabase Database 타입 정의
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          google_id: string;
          email: string;
          name: string | null;
          profile_picture: string | null;
          subscription_tier: 'free' | 'pro';
          created_at: string;
          last_login_at: string | null;
        };
        Insert: {
          id?: string;
          google_id: string;
          email: string;
          name?: string | null;
          profile_picture?: string | null;
          subscription_tier?: 'free' | 'pro';
          created_at?: string;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          google_id?: string;
          email?: string;
          name?: string | null;
          profile_picture?: string | null;
          subscription_tier?: 'free' | 'pro';
          created_at?: string;
          last_login_at?: string | null;
        };
      };
      user_integrations: {
        Row: {
          id: string;
          user_id: string;
          integration_type: 'slack' | 'discord' | 'teams';
          webhook_url: string;
          workspace_name: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_type: 'slack' | 'discord' | 'teams';
          webhook_url: string;
          workspace_name?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_type?: 'slack' | 'discord' | 'teams';
          webhook_url?: string;
          workspace_name?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      scrap_logs: {
        Row: {
          id: string;
          user_id: string;
          integration_id: string | null;
          url: string;
          title: string | null;
          summary: string | null;
          keywords: string[] | null;
          persona: 'general' | 'marketing' | 'dev' | 'biz';
          insight: string | null;
          user_comment: string | null;
          word_count: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          integration_id?: string | null;
          url: string;
          title?: string | null;
          summary?: string | null;
          keywords?: string[] | null;
          persona?: 'general' | 'marketing' | 'dev' | 'biz';
          insight?: string | null;
          user_comment?: string | null;
          word_count?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          integration_id?: string | null;
          url?: string;
          title?: string | null;
          summary?: string | null;
          keywords?: string[] | null;
          persona?: 'general' | 'marketing' | 'dev' | 'biz';
          insight?: string | null;
          user_comment?: string | null;
          word_count?: number | null;
          created_at?: string;
        };
      };
    };
  };
}
