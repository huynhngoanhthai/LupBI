'use client';

import { useI18nStore } from '@/stores/i18n.store';
import { SupportedLanguage } from '@lupbi/shared-types';
import { Globe } from 'lucide-react';

const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'cn', label: '中文', flag: '🇨🇳' },
];

export default function LanguageSelector() {
  const { lang, setLanguage } = useI18nStore();

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
      <Globe className="w-4 h-4 text-slate-400 ml-1.5 mr-0.5" />
      {languages.map((item) => (
        <button
          key={item.code}
          onClick={() => setLanguage(item.code)}
          className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
            lang === item.code
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {item.flag} {item.label}
        </button>
      ))}
    </div>
  );
}
