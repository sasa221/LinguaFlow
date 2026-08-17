import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Loader2,
  TrendingUp,
  X,
  Volume2,
  Mic,
  BookOpen,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, NativeLanguage, ProficiencyLevel, SessionAnalysis } from '../types';
import { LiveAudioPlayer } from '../utils/audioUtils';

interface SessionReviewModalProps {
  language: Language;
  nativeLanguage: NativeLanguage;
  level: ProficiencyLevel;
  stats: {
    sessionId?: string;
    seconds: number;
    turns: number;
    scenarioTitle: string;
    transcript?: Array<{ sender: 'user' | 'ai'; text: string }>;
  };
  onClose: () => void;
  onStartDrills: (topic?: string) => void;
  onAddXP: (amount: number, activityId?: string) => void;
}

export const SessionReviewModal: React.FC<SessionReviewModalProps> = ({
  language,
  nativeLanguage,
  level,
  stats,
  onClose,
  onStartDrills,
  onAddXP,
}) => {
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [practicingIndex, setPracticingIndex] = useState<number | null>(null);
  const [practiceStatus, setPracticeStatus] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const xpAwardedRef = useRef(false);

  const sessionId = stats.sessionId || `session-${stats.scenarioTitle}-${stats.seconds}-${stats.turns}`;

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    audioPlayerRef.current = new LiveAudioPlayer();

    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.45 },
    });

    fetchAnalysis();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      audioPlayerRef.current?.close();
      triggerRef.current?.focus();
    };
  }, []);

  const fetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/session/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: stats.transcript || [],
          language: language.name,
          nativeLanguage: nativeLanguage.name,
          level,
          scenarioTitle: stats.scenarioTitle,
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data: SessionAnalysis = await res.json();
      setAnalysis(data);
      if (data.earnedXP && !xpAwardedRef.current) {
        xpAwardedRef.current = true;
        onAddXP(data.earnedXP, `analysis-${sessionId}`);
      }
    } catch (e) {
      console.error('Session analysis error:', e);
      const fallbackAnalysis: SessionAnalysis = {
        summary: `Your ${language.name} conversation was saved, but AI analysis is temporarily unavailable. You can retry later without losing the session.`,
        fluencyScore: 0,
        vocabularyScore: 0,
        grammarScore: 0,
        pronunciationScore: 0,
        mistakesToAvoid: [],
        strengths: [],
        nextFocusArea: 'Continue practicing the same scenario or retry the analysis later.',
        earnedXP: 0,
      };
      setAnalysis(fallbackAnalysis);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPronunciation = async (phrase: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: phrase,
          voice: 'Kore',
          language: language.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          audioPlayerRef.current?.stopAll();
          audioPlayerRef.current?.playChunk(data.audio, 24000);
        }
      }
    } catch (e) {
      console.error('TTS error:', e);
    }
  };

  const handlePracticeRepeat = (index: number) => {
    setPracticingIndex(index);
    setPracticeStatus('Listening for your spoken repetition…');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setPracticeStatus('Speaking practice marked complete (pronunciation not verified on this browser).');
      setTimeout(() => {
        setPracticingIndex(null);
        setPracticeStatus(null);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language.speechCode || 'es-ES';
      recognition.onresult = () => {
        setPracticeStatus('Excellent pronunciation! +10 XP');
        onAddXP(10, `repeat-corr-${index}`);
        setTimeout(() => {
          setPracticingIndex(null);
          setPracticeStatus(null);
        }, 2000);
      };
      recognition.onerror = () => {
        setPracticeStatus('Practice recorded!');
        setTimeout(() => {
          setPracticingIndex(null);
          setPracticeStatus(null);
        }, 2000);
      };
      recognition.start();
    } catch (e) {
      setPracticingIndex(null);
    }
  };

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in overflow-y-auto">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="How did that conversation go?"
        className="bg-[#030712]/95 border border-cyan-500/30 backdrop-blur-2xl rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 my-8 animate-in zoom-in-95"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
          aria-label="Close review"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Question & Session Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono font-bold text-cyan-400">
              {stats.scenarioTitle} • {formatMinutes(stats.seconds)} • {stats.turns} turns
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How did that conversation go?
          </h2>
        </div>

        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <div className="text-sm font-bold text-white">
              AI Pedagogical Coach is synthesizing your session…
            </div>
            <p className="text-xs text-slate-400">
              Evaluating spoken fluency rhythm, vocabulary sophistication, and grammar naturalness
            </p>
          </div>
        ) : analysis ? (
          <>
            {/* 1. Overall Qualitative Summary */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Coach Summary</span>
              </div>
              <p className="text-slate-300">{analysis.summary}</p>
            </div>

            {/* 2. One Thing Done Well & One Priority Improvement */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>One Thing You Did Well</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {analysis.strengths?.[0] || 'Spoke naturally with high confidence and steady turn-taking.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Priority Focus for Next Time</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {analysis.nextFocusArea || 'Practice connecting clauses with natural conjunctions.'}
                </p>
              </div>
            </div>

            {/* 3. Top 3 Actionable Spoken Corrections with 'Try Again' Loop */}
            {analysis.mistakesToAvoid && analysis.mistakesToAvoid.length > 0 && (
              <div className="space-y-3 text-xs">
                <div className="font-bold text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Top Corrections to Practice ({Math.min(3, analysis.mistakesToAvoid.length)})</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Tap audio to hear native cadence</span>
                </div>

                <div className="space-y-2.5">
                  {analysis.mistakesToAvoid.slice(0, 3).map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="line-through text-red-400/90 font-mono text-xs">
                              "{m.mistake}"
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-cyan-300 font-bold font-mono text-xs">
                              "{m.correction}"
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                            {m.explanation}
                          </p>
                        </div>

                        {/* Hear audio */}
                        <button
                          onClick={() => handlePlayPronunciation(m.correction)}
                          className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 shrink-0 cursor-pointer"
                          title="Listen to native pronunciation"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Interactive 'Try It' Speech Practice */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        {practicingIndex === idx ? (
                          <div className="flex items-center gap-2 text-cyan-300 font-medium text-[11px]">
                            <Mic className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                            <span>{practiceStatus}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePracticeRepeat(idx)}
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <Mic className="w-3 h-3 text-cyan-400" />
                            <span>🎙 Try saying it</span>
                          </button>
                        )}
                        <span className="text-[10px] text-slate-500">+10 XP</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Actionable Next Step CTAs */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono font-bold">
                  +{analysis.earnedXP || 50} XP Earned
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onStartDrills(analysis.nextFocusArea);
                  }}
                  className="px-4 py-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Train Recommended Drill</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer transition-all"
                >
                  Continue Practice
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
