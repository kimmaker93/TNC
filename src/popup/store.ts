import { create } from 'zustand';
import type {
  ExtensionState,
  PageContent,
  UserSettings,
  SummaryResponse,
  PopupView,
} from '@shared/types';
import { getUserSettings, checkAndUpdateUsage, incrementUsage, saveUserSettings } from '@shared/utils';
import { DEFAULT_SETTINGS } from '@shared/constants';

interface PopupState {
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
  // 뷰 네비게이션
  currentView: 'main',
  setCurrentView: (view) => set({ currentView: view }),

  // 초기 상태
  state: 'idle',
  setState: (state) => set({ state }),

  pageContent: null,
  setPageContent: (content) => set({ pageContent: content }),

  summaryData: null,
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
