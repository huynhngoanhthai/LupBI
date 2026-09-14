/**
 * Zustand i18n Store - Quản lý ngôn ngữ và bản dịch giao diện phía Frontend.
 * Mặc định: Tiếng Việt ('vi'). Hỗ trợ chuyển đổi linh hoạt 'vi' | 'en' | 'cn'.
 */
import { create } from 'zustand';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@lupbi/shared-types';

import viDict from '../../../../i18n/web/vi.json';
import enDict from '../../../../i18n/web/en.json';
import cnDict from '../../../../i18n/web/cn.json';

const dictionaries: Record<SupportedLanguage, Record<string, any>> = {
  vi: viDict,
  en: enDict,
  cn: cnDict,
};

const LANG_STORAGE_KEY = 'lupbi_language';

interface I18nState {
  lang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyPath: string, fallback?: string) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  lang:
    typeof window !== 'undefined'
      ? ((localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage) || DEFAULT_LANGUAGE)
      : DEFAULT_LANGUAGE,

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    }
    set({ lang });
  },

  t: (keyPath, fallback) => {
    const { lang } = get();
    const dict = dictionaries[lang] || dictionaries.vi;

    const keys = keyPath.split('.');
    let current: any = dict;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return fallback || keyPath;
      }
    }

    return typeof current === 'string' ? current : fallback || keyPath;
  },
}));
