import { create } from 'zustand';
import type {
  ExtensionState,
  PageContent,
  UserSettings,
  PopupView,
  User,
  AuthState,
} from '@shared/types';
import { getUserSettings, checkAndUpdateUsage, incrementUsage, saveUserSettings } from '@shared/utils';
import { DEFAULT_SETTINGS } from '@shared/constants';

interface PopupState {
  // 인증 상태
  auth: AuthState;
  setAuthLoading: (isLoading: boolean) => void;
  setAuthError: (error: string | null) => void;
  setUser: (user: User | null, jwt: string | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // 뷰 네비게이션
  currentView: PopupView;
  setCurrentView: (view: PopupView) => void;

  // 상태
  state: ExtensionState;
  setState: (state: ExtensionState) => void;

  // 페이지 데이터
  pageContent: PageContent | null;
  setPageContent: (content: PageContent | null) => void;

  // 요약 결과
  summaryData: {
    summary: string | string[];
    keywords: string[];
    insight: string;
    comment: string;
  } | null;
  scrapId: string | null; // 현재 Scrap ID (Slack 전송 시 사용)
  setSummaryData: (data: PopupState['summaryData']) => void;
  updateSummary: (summary: string | string[]) => void;
  updateInsight: (insight: string) => void;
  updateComment: (comment: string) => void;

  // 사용자 설정
  settings: UserSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // 사용량
  usage: {
    used: number;
    remaining: number;
  };
  loadUsage: () => Promise<void>;
  incrementUsage: () => Promise<void>;

  // 에러
  error: string | null;
  setError: (error: string | null) => void;
}

export const usePopupStore = create<PopupState>((set, get) => ({
  // 인증 상태
  auth: {
    isAuthenticated: false,
    user: null,
    jwt: null,
    isLoading: false,
    error: null,
  },
  setAuthLoading: (isLoading) => {
    const current = get().auth;
    set({ auth: { ...current, isLoading, error: null } });
  },
  setAuthError: (error) => {
    const current = get().auth;
    set({ auth: { ...current, error, isLoading: false } });
  },
  setUser: (user, jwt) => {
    set({
      auth: {
        isAuthenticated: !!user,
        user,
        jwt,
        isLoading: false,
        error: null,
      },
    });
    // Chrome Storage에 사용자 정보 저장
    if (user && jwt) {
      chrome.storage.local.set({
        user,
        jwt,
        lastLoginAt: new Date().toISOString(),
      });
    }
  },
  logout: async () => {
    // Chrome Storage에서 사용자 정보 삭제
    await chrome.storage.local.remove(['user', 'jwt', 'lastLoginAt']);
    set({
      auth: {
        isAuthenticated: false,
        user: null,
        jwt: null,
        isLoading: false,
        error: null,
      },
    });
  },
  checkAuth: async () => {
    try {
      get().setAuthLoading(true);

      // Chrome Storage에서 사용자 정보 확인
      const result = await chrome.storage.local.get(['user', 'jwt']);

      if (result.user && result.jwt) {
        // JWT 유효성 검증은 추후 Backend API 호출 시 확인
        get().setUser(result.user, result.jwt);
      } else {
        get().setUser(null, null);
      }
    } catch (error) {
      console.error('[TNC] Check auth error:', error);
      get().setAuthError('인증 상태 확인에 실패했습니다.');
    }
  },

  // 뷰 네비게이션
  currentView: 'main',
  setCurrentView: (view) => set({ currentView: view }),

  // 초기 상태
  state: 'idle',
  setState: (state) => set({ state }),

  pageContent: null,
  setPageContent: (content) => set({ pageContent: content }),

  summaryData: null,
  scrapId: null,
  setSummaryData: (data) => set({ summaryData: data }),
  updateSummary: (summary) => {
    const current = get().summaryData;
    if (current) {
      set({ summaryData: { ...current, summary } });
    }
  },
  updateInsight: (insight) => {
    const current = get().summaryData;
    if (current) {
      set({ summaryData: { ...current, insight } });
    }
  },
  updateComment: (comment) => {
    const current = get().summaryData;
    if (current) {
      set({ summaryData: { ...current, comment } });
    }
  },

  settings: {
    ...DEFAULT_SETTINGS,
    usageCount: 0,
    lastResetDate: new Date().toISOString(),
  },
  loadSettings: async () => {
    const settings = await getUserSettings();
    set({ settings });
  },
  updateSettings: async (newSettings) => {
    const current = get().settings;
    const updated = { ...current, ...newSettings };
    await saveUserSettings(updated);
    set({ settings: updated });
  },

  usage: {
    used: 0,
    remaining: 5,
  },
  loadUsage: async () => {
    const usageData = await checkAndUpdateUsage();
    set({
      usage: {
        used: usageData.used,
        remaining: usageData.remaining,
      },
    });
  },
  incrementUsage: async () => {
    await incrementUsage();
    await get().loadUsage();
  },

  error: null,
  setError: (error) => set({ error }),
}));
