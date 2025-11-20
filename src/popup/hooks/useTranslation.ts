import { useMemo } from 'react';
import { translations, type Language, type Translations } from '../i18n/translations';
import { usePopupStore } from '../store';

/**
 * 다국어 지원을 위한 커스텀 훅
 */
export function useTranslation(): Translations {
  const settings = usePopupStore((state) => state.settings);
  const language = settings?.summaryConfig?.language || 'ko';

  const t = useMemo(() => {
    return translations[language as Language];
  }, [language]);

  return t;
}
