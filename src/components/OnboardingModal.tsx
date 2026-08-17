import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Globe2,
  BrainCircuit,
  Volume2,
  Check,
  Zap,
} from 'lucide-react';
import { Language, NativeLanguage, ProficiencyLevel, LearnerProfile } from '../types';
import { LANGUAGES, NATIVE_LANGUAGES } from '../data/languages';

interface OnboardingModalProps {
  initialProfile: LearnerProfile;
  onComplete: (profile: LearnerProfile) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  onClose,
  canClose = false,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState(initialProfile.targetLanguageId || 'spanish');
  const [selectedNativeId, setSelectedNativeId] = useState(initialProfile.nativeLanguageId || 'arabic-eg');
  const [selectedLevel, setSelectedLevel] = useState<ProficiencyLevel>(initialProfile.level || 'A2');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'>(
    initialProfile.selectedVoice || 'Zephyr'
  );
  const [dailyGoal, setDailyGoal] = useState<number>(initialProfile.dailyGoalMinutes || 15);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canClose && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canClose, onClose]);

  const levels: { code: ProficiencyLevel; title: string; desc: string }[] = [
    { code: 'A1', title: 'A1 - Beginner', desc: 'Starting from scratch, essential greetings & basics' },
    { code: 'A2', title: 'A2 - Elementary', desc: 'Simple everyday phrases, ordering, travel basics' },
    { code: 'B1', title: 'B1 - Intermediate', desc: 'Conversational discussions, opinions, work' },
    { code: 'B2', title: 'B2 - Upper-Intermediate', desc: 'Spontaneous dialogues, complex native topics' },
    { code: 'C1', title: 'C1 - Advanced', desc: 'Full immersion, subtle nuances & idioms' },
  ];

  const voices: { id: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'; label: string; tone: string }[] = [
    { id: 'Zephyr', label: 'Zephyr', tone: 'Warm & Natural' },
    { id: 'Kore', label: 'Kore', tone: 'Clear & Melodic' },
    { id: 'Puck', label: 'Puck', tone: 'Playful & Friendly' },
    { id: 'Fenrir', label: 'Fenrir', tone: 'Deep & Confident' },
    { id: 'Charon', label: 'Charon', tone: 'Calm & Measured' },
  ];

  const handleSave = () => {
    const updated: LearnerProfile = {
      ...initialProfile,
      hasCompletedOnboarding: true,
      targetLanguageId: selectedTargetId,
      nativeLanguageId: selectedNativeId,
      level: selectedLevel,
      selectedVoice,
      dailyGoalMinutes: dailyGoal,
      updatedAt: Date.now(),
    };
    onComplete(updated);
  };

  const targetLang = LANGUAGES.find((l) => l.id === selectedTargetId) || LANGUAGES[0];
  const nativeLang = NATIVE_LANGUAGES.find((l) => l.id === selectedNativeId) || NATIVE_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b1320] border border-cyan-500/30 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 text-slate-100 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Configure Your Immersion Profile
              </h2>
              <p className="text-xs text-slate-400">
                Personalize target tongue, CEFR calibration, and explanation dialect
              </p>
            </div>
          </div>
          {canClose && onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {/* 1. Target Language */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <Globe2 className="w-3.5 h-3.5" />
            <span>1. What language do you want to master?</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedTargetId === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedTargetId(lang.id)}
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

        {/* 2. Native Language / Mother Tongue */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>2. Mother tongue / Native language for explanations & grammar tips</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {NATIVE_LANGUAGES.map((lang) => {
              const isSelected = selectedNativeId === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setSelectedNativeId(lang.id)}
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

        {/* 3. Starting CEFR Level */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span>3. Target CEFR Proficiency Level</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl.code;
              return (
                <button
                  key={lvl.code}
                  onClick={() => setSelectedLevel(lvl.code)}
                  className={`flex flex-col p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{lvl.title}</span>
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

        {/* 4. AI Partner Voice & Daily Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Partner Voice</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {voices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border ${
                    selectedVoice === v.id
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{v.label}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{v.tone}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
              Daily Practice Target
            </label>
            <div className="space-y-2">
              {[10, 15, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDailyGoal(mins)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    dailyGoal === mins
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{mins} minutes per day</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {mins === 15 ? 'Recommended' : `${mins * 60}s immersion`}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <span>Start Practice in {targetLang.name}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
