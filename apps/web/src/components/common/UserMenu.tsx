'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useI18nStore } from '@/stores/i18n.store';
import { SupportedLanguage, UserRole } from '@lupbi/shared-types';
import { LogOut, ChevronDown, User as UserIcon, Shield, Mail, Globe } from 'lucide-react';

const languages: { code: SupportedLanguage; label: string; shortLabel: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', shortLabel: 'VI', flag: '🇻🇳' },
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
  { code: 'cn', label: '中文', shortLabel: 'CN', flag: '🇨🇳' },
];

export default function UserMenu() {
  const { user, logout } = useAuthStore();
  const { lang, setLanguage, t } = useI18nStore();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto close menu khi click ra ngoài (Click Outside)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    } else {
      router.replace('/login');
    }
  };

  // Đổi ngôn ngữ + reload lại trang để đảm bảo cập nhật đồng bộ toàn bộ FE và BE (x-lang header)
  const handleLanguageChange = (selectedLang: SupportedLanguage) => {
    if (selectedLang === lang) return;
    setLanguage(selectedLang);
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  // Tạo Avatar initials từ tên (ví dụ: "LupBI Admin" -> "LA")
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Trigger Button: User Avatar + Name + Role ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 group cursor-pointer"
      >
        {/* Avatar Circle với Status Indicator */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20">
          {getInitials(user?.fullName)}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
        </div>

        {/* User Name & Role */}
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors leading-tight">
            {user?.fullName ?? user?.email ?? 'User'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {user?.role ?? UserRole.VIEWER}
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* ── Floating Dropdown Popover Menu ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          {/* User Details Header */}
          <div className="p-3 bg-slate-800/40 rounded-xl mb-1 border border-slate-800/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md">
                {getInitials(user?.fullName)}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-sm text-white truncate">
                  {user?.fullName ?? 'User'}
                </div>
                <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Role Badge */}
            {user?.role && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-purple-400" /> {t('rbac.role_label', 'Vai trò')}:
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    user.role === UserRole.ADMIN
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : user.role === UserRole.CREATOR
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800 my-1.5" />

          {/* 🌐 Language Selector inside Avatar Popover Menu */}
          <div className="px-2 py-1.5">
            <div className="text-[11px] text-slate-400 font-semibold mb-2 flex items-center gap-1.5 px-1">
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('language.select_label', 'Ngôn ngữ')}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
              {languages.map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleLanguageChange(item.code)}
                  className={`py-1.5 text-xs rounded-lg font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    lang === item.code
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{item.flag}</span>
                  <span>{item.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-800 my-1.5" />

          {/* User Profile Action */}
          <div className="px-3 py-2 text-xs text-slate-400 flex items-center gap-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-default">
            <UserIcon className="w-4 h-4 text-blue-400" />
            <span>Tài khoản cá nhân</span>
          </div>

          <div className="h-px bg-slate-800 my-1.5" />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('dashboard.logout', 'Đăng xuất')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
