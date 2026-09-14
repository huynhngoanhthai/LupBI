/**
 * Zustand i18n Store - Quản lý ngôn ngữ và bản dịch giao diện phía Frontend.
 * Đảm bảo 100% KHÔNG BỊ LỖI HYDRATION MISMATCH trong Next.js App Router (React 19).
 * Giá trị khởi tạo trên cả Server & Client Hydration Pass 1 luôn đồng nhất.
 * Tự động đồng bộ từ localStorage/cookie sau khi mount.
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
  isHydrated: boolean;
  setLanguage: (lang: SupportedLanguage) => void;
  initClientLanguage: () => void;
  t: (keyPath: string, fallback?: string) => string;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  // Khởi tạo lang luôn là DEFAULT_LANGUAGE ('vi') ở Pass 1 để khớp 100% HTML giữa Server & Client
  lang: DEFAULT_LANGUAGE,
  isHydrated: false,

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      document.cookie = `lupbi_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    }
    set({ lang, isHydrated: true });
  },

  initClientLanguage: () => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage;
      if (savedLang && (savedLang === 'vi' || savedLang === 'en' || savedLang === 'cn')) {
        set({ lang: savedLang, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    }
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
