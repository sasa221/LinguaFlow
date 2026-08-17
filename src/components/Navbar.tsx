import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  BookOpen,
  Zap,
  ChevronDown,
  SlidersHorizontal,
  Home,
  Target,
  BarChart3,
  Bot,
  Flame,
  MoreHorizontal,
  X,
  Cloud,
  User,
  GraduationCap,
} from 'lucide-react';
import { Language, ProficiencyLevel, UserProgress, NavigationTab, AuthUser, AuthState } from '../types';
import { LANGUAGES } from '../data/languages';

interface NavbarProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  currentLevel: ProficiencyLevel;
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  progress: UserProgress;
  authUser?: AuthUser | null;
  authState?: AuthState;
  onOpenPreferences: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onSelectLanguage,
  currentLevel,
  activeTab,
  onSelectTab,
  progress,
  authUser,
  authState,
  onOpenPreferences,
}) => {
  const [showTargetLangMenu, setShowTargetLangMenu] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTargetLangMenu(false);
        setShowMobileMore(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems: { id: NavigationTab; label: string; icon: any; isLive?: boolean }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Course', icon: GraduationCap },
    { id: 'practice', label: 'Practice', icon: Mic, isLive: true },
    { id: 'vocab', label: 'Vocabulary', icon: BookOpen },
    { id: 'pronunciation', label: 'Pronunciation', icon: Target },
    { id: 'drills', label: 'Drills', icon: Zap },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  // Mobile bottom bar primary items
  const mobilePrimaryItems: { id: NavigationTab; label: string; icon: any; isLive?: boolean }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Course', icon: GraduationCap },
    { id: 'practice', label: 'Practice', icon: Mic, isLive: true },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'vocab', label: 'Vocab', icon: BookOpen },
  ];

  const isMoreActive = activeTab === 'pronunciation' || activeTab === 'drills' || activeTab === 'progress';
  const isAuthenticated = authUser && !authUser.isAnonymous;

  return (
    <>
      <header className="sticky top-0 z-40 h-16 sm:h-18 flex items-center border-b border-white/10 backdrop-blur-xl bg-[#030712]/90 text-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3">
          
          {/* App Logo & Title */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg sm:text-xl text-black">L</span>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm sm:text-base font-black tracking-tight text-white">
                  LinguaFlow
                </span>
                <span className="text-[9px] text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                Fluency Immersion
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (>= 1024px) */}
          <nav className="hidden lg:flex items-center p-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? item.id === 'practice'
                        ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                        : 'bg-white text-black shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.isLive && (
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                    </span>
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Target Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowTargetLangMenu(!showTargetLangMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
                title="Target Language"
              >
                <span className="text-base leading-none">{currentLanguage.flag}</span>
                <span className="font-semibold text-slate-100 hidden sm:inline text-xs">
                  {currentLanguage.name}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showTargetLangMenu && (
                <div className="absolute right-0 mt-2 w-60 max-h-96 overflow-y-auto bg-[#030712]/95 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                    Target Language
                  </div>
                  <div className="space-y-1 mt-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          onSelectLanguage(lang);
                          setShowTargetLangMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          currentLanguage.id === lang.id
                            ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{lang.flag}</span>
                          <div>
                            <div className="text-xs font-bold text-white">{lang.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {lang.nativeName}
                            </div>
                          </div>
                        </div>
                        {currentLanguage.id === lang.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CEFR Level Pill */}
            <button
              onClick={onOpenPreferences}
              className="flex items-center gap-1 bg-white/5 hover:bg-cyan-500/10 hover:border-cyan-500/30 px-2.5 py-1.5 rounded-full border border-white/10 text-xs font-bold text-cyan-300 transition-all cursor-pointer"
              title="Proficiency Level (Click to calibrate)"
            >
              <span className="font-mono text-xs">{currentLevel}</span>
            </button>

            {/* Quick Streak/XP Pill */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
              <span className="flex items-center gap-1 text-orange-400 font-bold">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                {progress.streakDays}d
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300 font-mono font-bold">
                {progress.xp} XP
              </span>
            </div>

            {/* User Account / Cloud Sync Pill */}
            <button
              onClick={onOpenPreferences}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                isAuthenticated
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
              title={isAuthenticated ? `Signed in as ${authUser?.email || 'Learner'}` : 'Guest Mode (Click to Sign In)'}
            >
              {isAuthenticated ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-semibold max-w-[100px] truncate">
                    {authUser?.displayName || 'Cloud Synced'}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px]">Guest</span>
                </>
              )}
            </button>

            {/* Preferences / Settings Gear Button */}
            <button
              onClick={onOpenPreferences}
              aria-label="Learning Preferences & Settings"
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Learning Preferences & Settings"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< 1024px) */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#030712]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                setShowMobileMore(false);
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.isLive && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400"></span>
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}

        {/* More Options Button */}
        <button
          onClick={() => setShowMobileMore(!showMobileMore)}
          aria-expanded={showMobileMore}
          aria-label="More learning views"
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            isMoreActive || showMobileMore
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {isMoreActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">More</span>
        </button>
      </nav>

      {/* Mobile More Menu Drawer */}
      {showMobileMore && (
        <div
          ref={moreMenuRef}
          role="dialog"
          aria-label="Additional Navigation Options"
          className="lg:hidden fixed bottom-16 left-3 right-3 z-50 p-4 bg-[#0b1320]/95 border border-white/15 backdrop-blur-2xl rounded-3xl shadow-2xl space-y-2 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Immersion Tools
            </span>
            <button
              onClick={() => setShowMobileMore(false)}
              className="p-1 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5 pt-1">
            <button
              onClick={() => {
                onSelectTab('pronunciation');
                setShowMobileMore(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pronunciation'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <div>
                <div>Pronunciation Lab</div>
                <div className="text-[10px] font-normal text-slate-400">Phonetics & accent scoring</div>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectTab('drills');
                setShowMobileMore(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'drills'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <div>Adaptive Drills</div>
                <div className="text-[10px] font-normal text-slate-400">Grammar & reflex remediation</div>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectTab('progress');
                setShowMobileMore(false);
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'progress'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <div>
                <div>Fluency Progress</div>
                <div className="text-[10px] font-normal text-slate-400">Analytics, XP & CEFR progression</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
