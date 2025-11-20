import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  value: 'ko' | 'en';
  onChange: (value: 'ko' | 'en') => void;
}

/**
 * 언어 선택 컴포넌트
 */
export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const t = useTranslation();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {t.languageLabel}
      </label>

      <div className="flex gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="language"
            value="ko"
            checked={value === 'ko'}
            onChange={(e) => onChange(e.target.value as 'ko' | 'en')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">{t.languageKorean}</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="language"
            value="en"
            checked={value === 'en'}
            onChange={(e) => onChange(e.target.value as 'ko' | 'en')}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">{t.languageEnglish}</span>
        </label>
      </div>
    </div>
  );
}
