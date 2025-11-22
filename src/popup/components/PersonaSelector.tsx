import type { Persona } from '@shared/types';

interface PersonaSelectorProps {
  value: Persona;
  onChange: (persona: Persona) => void;
}

const PERSONAS: { value: Persona; label: string; description: string; icon: string }[] = [
  {
    value: 'general',
    label: '일반',
    description: '균형잡힌 일반적인 요약',
    icon: '📄',
  },
  {
    value: 'marketing',
    label: '마케팅',
    description: '마케팅 관점의 요약',
    icon: '📢',
  },
  {
    value: 'dev',
    label: '개발',
    description: '기술적 관점의 요약',
    icon: '💻',
  },
  {
    value: 'biz',
    label: '비즈니스',
    description: '비즈니스 관점의 요약',
    icon: '💼',
  },
];

export function PersonaSelector({ value, onChange }: PersonaSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        📊 요약 스타일 선택
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PERSONAS.map((persona) => (
          <button
            key={persona.value}
            onClick={() => onChange(persona.value)}
            className={`p-3 border-2 rounded-lg transition-all text-left ${
              value === persona.value
                ? 'border-blue-600 bg-blue-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{persona.icon}</span>
              <span
                className={`text-sm font-semibold ${
                  value === persona.value ? 'text-blue-700' : 'text-gray-800'
                }`}
              >
                {persona.label}
              </span>
            </div>
            <p className="text-xs text-gray-600">{persona.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
