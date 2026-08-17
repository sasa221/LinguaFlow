import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Globe,
  Languages,
  Zap,
  Volume2,
  Gauge,
  Target,
  BrainCircuit,
  RotateCcw,
  Check,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Cloud,
  Trash2,
} from 'lucide-react';
import {
  Language,
  NativeLanguage,
  ProficiencyLevel,
  AuthUser,
  AuthState,
} from '../types';
import { LANGUAGES, NATIVE_LANGUAGES } from '../data/languages';

interface LearningPreferencesModalProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
  nativeLanguage: NativeLanguage;
  onSelectNativeLanguage: (lang: NativeLanguage) => void;
  currentLevel: ProficiencyLevel;
  onSelectLevel: (lvl: ProficiencyLevel) => void;
  selectedVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  onSelectVoice: (voice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon') => void;
  playbackSpeed: number;
  onSelectSpeed: (speed: number) => void;
  dailyGoalMinutes: number;
  onSelectDailyGoal: (minutes: number) => void;
  authUser: AuthUser | null;
  authState: AuthState;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
  onOpenPlacement?: () => void;
  onClearTutorMemory?: () => void;
  onClearWeaknesses?: () => void;
  onClearVocabulary?: () => void;
  onResetUserData?: () => void;
  onClose: () => void;
}

export const LearningPreferencesModal: React.FC<LearningPreferencesModalProps> = ({
  currentLanguage,
  onSelectLanguage,
  nativeLanguage,
  onSelectNativeLanguage,
  currentLevel,
  onSelectLevel,
  selectedVoice,
  onSelectVoice,
  playbackSpeed,
  onSelectSpeed,
  dailyGoalMinutes,
  onSelectDailyGoal,
  authUser,
  authState,
  onSignInWithGoogle,
  onSignOut,
  onOpenPlacement,
  onClearTutorMemory,
  onClearWeaknesses,
  onClearVocabulary,
  onResetUserData,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'general' | 'audio' | 'account' | 'privacy'>('general');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  // Draft state to allow cancel without applying unintended changes
  const [draftLanguage, setDraftLanguage] = useState<Language>(currentLanguage);
  const [draftNative, setDraftNative] = useState<NativeLanguage>(nativeLanguage);
  const [draftLevel, setDraftLevel] = useState<ProficiencyLevel>(currentLevel);
  const [draftVoice, setDraftVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'>(selectedVoice);
  const [draftSpeed, setDraftSpeed] = useState<number>(playbackSpeed);
  const [draftGoal, setDraftGoal] = useState<number>(dailyGoalMinutes);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Focus management: save trigger and restore on close
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [onClose]);

  const handleSaveAndApply = () => {
    onSelectLanguage(draftLanguage);
    onSelectNativeLanguage(draftNative);
    onSelectLevel(draftLevel);
    onSelectVoice(draftVoice);
    onSelectSpeed(draftSpeed);
    onSelectDailyGoal(draftGoal);
    onClose();
  };

  const levels: { code: ProficiencyLevel; label: string; desc: string }[] = [
    { code: 'A1', label: 'A1 - Beginner', desc: 'Essential greetings & core survival basics' },
    { code: 'A2', label: 'A2 - Elementary', desc: 'Everyday conversations, ordering & routines' },
    { code: 'B1', label: 'B1 - Intermediate', desc: 'Travel, workplace, feelings & opinions' },
    { code: 'B2', label: 'B2 - Upper-Intermediate', desc: 'Spontaneous dialogues & native topics' },
    { code: 'C1', label: 'C1 - Advanced', desc: 'Full immersion, subtle nuances & idioms' },
  ];

  const voices: { id: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'; label: string; tone: string }[] = [
    { id: 'Zephyr', label: 'Zephyr', tone: 'Warm & Natural' },
    { id: 'Kore', label: 'Kore', tone: 'Clear & Melodic' },
    { id: 'Puck', label: 'Puck', tone: 'Playful & Friendly' },
    { id: 'Fenrir', label: 'Fenrir', tone: 'Deep & Confident' },
    { id: 'Charon', label: 'Charon', tone: 'Calm & Measured' },
  ];

  const isAuthenticated = authUser && !authUser.isAnonymous;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="preferences-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="bg-[#0b1320] border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 id="preferences-title" className="text-lg sm:text-xl font-black text-white">
                Learning Preferences & Account
              </h2>
              <p className="text-xs text-slate-400">
                Personalize target languages, cloud synchronization, and AI mentor settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close preferences"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveSection('general')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSection === 'general'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Languages & Level
          </button>
          <button
            onClick={() => setActiveSection('audio')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSection === 'audio'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audio & Goals
          </button>
          <button
            onClick={() => setActiveSection('account')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSection === 'account'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Account & Sync
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSection === 'privacy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Data & Privacy
          </button>
        </div>

        {/* SECTION 1: GENERAL (Target Language, Native Language, Level) */}
        {activeSection === 'general' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Target Language */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Globe className="w-3.5 h-3.5" />
                <span>Target Immersion Language</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = draftLanguage.id === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => setDraftLanguage(lang)}
                      className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="text-xs font-bold">{lang.name}</div>
                        <div className="text-[10px] text-slate-400">{lang.nativeName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Native Explanation Language */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
                <Languages className="w-3.5 h-3.5" />
                <span>Explanation & Coaching Mother Tongue</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {NATIVE_LANGUAGES.map((lang) => {
                  const isSelected = draftNative.id === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => setDraftNative(lang)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/20 border-teal-400 text-white shadow-lg shadow-teal-500/10'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{lang.flag}</span>
                        <div>
                          <div className="text-xs font-bold">{lang.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {lang.nativeName} {lang.dialect ? `• ${lang.dialect}` : ''}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-teal-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CEFR Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                  <span>CEFR Level Target</span>
                </label>
                {onOpenPlacement && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPlacement();
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Run Diagnostic Placement</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {levels.map((lvl) => {
                  const isSelected = draftLevel === lvl.code;
                  return (
                    <button
                      key={lvl.code}
                      onClick={() => setDraftLevel(lvl.code)}
                      className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{lvl.label}</span>
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {lvl.code}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1">{lvl.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: AUDIO & GOALS */}
        {activeSection === 'audio' && (
          <div className="space-y-5 animate-in fade-in">
            {/* Voice Tone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
                <Volume2 className="w-3.5 h-3.5" />
                <span>AI Partner Voice Tone</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {voices.map((v) => {
                  const isSelected = draftVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setDraftVoice(v.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-400 text-white shadow-lg shadow-purple-500/10'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{v.label}</div>
                        <div className="text-[10px] text-slate-400">{v.tone}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Playback Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Speech Playback Speed Factor</span>
                </label>
                <span className="text-xs font-mono font-bold text-cyan-400">{draftSpeed}x</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.6, 0.8, 1.0, 1.2].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setDraftSpeed(spd)}
                    className={`py-3 rounded-2xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      draftSpeed === spd
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {spd}x
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">
                      {spd === 0.6 ? 'Slow' : spd === 0.8 ? 'Comfortable' : spd === 1.0 ? 'Natural' : 'Fast'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Practice Target */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Target className="w-3.5 h-3.5" />
                <span>Daily Practice Goal</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setDraftGoal(mins)}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      draftGoal === mins
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-sm font-black">{mins} mins</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {mins === 15 ? 'Standard' : mins === 30 ? 'Intensive' : 'Light'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ACCOUNT & SYNC */}
        {activeSection === 'account' && (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {isAuthenticated ? authUser?.displayName || 'Learner Account' : 'Guest Learner Mode'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {isAuthenticated ? authUser?.email : 'Device-local progress (not cloud-synced)'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border bg-cyan-500/10 border-cyan-500/30 text-cyan-300">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>{isAuthenticated ? 'Cloud Synchronized' : 'Local Only'}</span>
                </div>
              </div>

              {isAuthenticated ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Your vocabulary, streaks, and tutor memory sync securely via Firestore.</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-[11px] text-slate-400 font-mono">
                      UID: {authUser?.uid.slice(0, 12)}...
                    </div>
                    {onSignOut && (
                      <button
                        onClick={onSignOut}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sign in with Google to enable cross-device synchronization and secure cloud backups of your vocabulary cards, streak history, and personalized AI tutor context.
                  </p>
                  {onSignInWithGoogle && (
                    <button
                      onClick={onSignInWithGoogle}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black hover:bg-slate-200 font-extrabold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Sign in with Google to Sync</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 4: DATA & PRIVACY */}
        {activeSection === 'privacy' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-xs text-slate-400 leading-relaxed">
              LinguaFlow enforces data minimization. No raw microphone audio or large sound buffers are stored in browser storage. Use the granular controls below to clear specific learning records.
            </div>

            <div className="space-y-2.5">
              {/* Clear Tutor Memory */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Reset AI Tutor Pedagogical Memory</div>
                  <div className="text-[10px] text-slate-400">Clears coach notes, known strengths, and focus topics</div>
                </div>
                <button
                  onClick={() => {
                    if (onClearTutorMemory) onClearTutorMemory();
                    setConfirmAction('tutor_memory');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {confirmAction === 'tutor_memory' ? 'Cleared ✓' : 'Clear'}
                </button>
              </div>

              {/* Clear Weaknesses */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Reset Grammar & Weakness Gaps</div>
                  <div className="text-[10px] text-slate-400">Clears tracked linguistic mistakes and correction logs</div>
                </div>
                <button
                  onClick={() => {
                    if (onClearWeaknesses) onClearWeaknesses();
                    setConfirmAction('weaknesses');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  {confirmAction === 'weaknesses' ? 'Cleared ✓' : 'Clear'}
                </button>
              </div>

              {/* Clear Vocabulary */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Delete All Saved Flashcards</div>
                  <div className="text-[10px] text-slate-400">Deletes all saved words and SRS repetition scheduling</div>
                </div>
                <button
                  onClick={() => {
                    if (onClearVocabulary) onClearVocabulary();
                    setConfirmAction('vocabulary');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 text-xs font-semibold cursor-pointer"
                >
                  {confirmAction === 'vocabulary' ? 'Deleted ✓' : 'Delete All'}
                </button>
              </div>

              {/* Full Reset */}
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                  <Trash2 className="w-4 h-4" />
                  <span>Full Profile & Progress Reset</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Permanently wipe all stored XP, streaks, practice minutes, and return to fresh onboarding.
                </p>
                {showConfirmReset ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        if (onResetUserData) onResetUserData();
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-red-600/30"
                    >
                      Confirm Full Wipe
                    </button>
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowConfirmReset(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 font-bold text-xs cursor-pointer mt-1"
                  >
                    Reset Everything
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions (Cancel vs Save) */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAndApply}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            Save & Apply Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
