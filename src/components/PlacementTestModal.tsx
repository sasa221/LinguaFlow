import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Sparkles, X, RotateCcw } from 'lucide-react';
import { Language, NativeLanguage, ProficiencyLevel } from '../types';

interface PlacementTestModalProps {
  currentLanguage: Language;
  nativeLanguage: NativeLanguage;
  currentLevel?: ProficiencyLevel;
  onApplyLevel: (level: ProficiencyLevel) => void;
  onClose: () => void;
}

export const PlacementTestModal: React.FC<PlacementTestModalProps> = ({
  currentLanguage,
  nativeLanguage,
  currentLevel = 'A2',
  onApplyLevel,
  onClose,
}) => {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [result, setResult] = useState<{
    recommendedLevel: ProficiencyLevel;
    levelTitle: string;
    confidence: number;
    summary: string;
    strengths: string[];
    growthAreas: string[];
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus management: save trigger and restore on close
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    textareaRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
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

  const testPrompts = [
    {
      title: 'Question 1: Greetings & Introduction',
      prompt: `Write 1-2 sentences in ${currentLanguage.name} introducing yourself (name, where you live, or what you enjoy).`,
      placeholder: `Type your response in ${currentLanguage.name}...`,
    },
    {
      title: 'Question 2: Routine or Travel Experience',
      prompt: `Describe your usual morning routine or how you would order a meal at a restaurant in ${currentLanguage.name}.`,
      placeholder: `Type your response in ${currentLanguage.name}...`,
    },
    {
      title: 'Question 3: Past Memory or Future Ambition',
      prompt: `Explain something interesting you did last week or a goal you want to achieve this year in ${currentLanguage.name}.`,
      placeholder: `Type your response in ${currentLanguage.name}...`,
    },
  ];

  const evaluateAnswers = async (updatedAnswers: Array<{ question: string; answer: string }>) => {
    setIsLoading(true);
    setErrorState(null);
    try {
      const res = await fetch('/api/placement/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLanguage.name,
          nativeLanguage: nativeLanguage.name,
          answers: updatedAnswers,
        }),
      });

      if (!res.ok) {
        throw new Error(`Diagnostic server returned ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.recommendedLevel) {
        throw new Error('Invalid evaluation response structure');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Placement evaluation error:', err);
      setErrorState(
        'AI evaluation could not be completed due to a temporary connection or model response issue. Your previous CEFR level remains unchanged.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (!currentInput.trim()) return;

    const updatedAnswers = [
      ...answers,
      { question: testPrompts[step].title, answer: currentInput.trim() },
    ];
    setAnswers(updatedAnswers);
    setCurrentInput('');

    if (step < testPrompts.length - 1) {
      setStep(step + 1);
    } else {
      await evaluateAnswers(updatedAnswers);
    }
  };

  const getQualitativeConfidence = (score: number) => {
    if (score >= 85) return 'Strong diagnostic signal';
    if (score >= 70) return 'Moderate diagnostic confidence';
    return 'Initial diagnostic estimate';
  };

  const levels: ProficiencyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="placement-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-[#0b1320] border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-slate-100 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h2 id="placement-modal-title" className="text-lg font-bold text-white">
                AI-Estimated CEFR Placement
              </h2>
              <p className="text-xs text-slate-400">
                Linguistic diagnostic for {currentLanguage.name} {currentLanguage.flag}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Placement Modal"
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-200">
              Analyzing grammatical patterns, syntax & communicative range...
            </p>
            <p className="text-xs text-slate-400 font-mono">
              Calibrating against CEFR framework (A1 - C1)
            </p>
          </div>
        ) : errorState ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Evaluation Incomplete
              </div>
              <p className="leading-relaxed text-slate-300">{errorState}</p>
              <div className="pt-1 text-[11px] text-amber-400/90 font-mono">
                Current Level Retained: <strong>{currentLevel}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300">
                You can retry the evaluation or manually choose your preferred starting level:
              </p>
              <div className="grid grid-cols-5 gap-2">
                {levels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      onApplyLevel(lvl);
                      onClose();
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      lvl === currentLevel
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => evaluateAnswers(answers)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Evaluation</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              >
                Keep {currentLevel} & Close
              </button>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border border-cyan-500/30 text-center space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                ESTIMATED CEFR LEVEL
              </span>
              <div className="text-4xl font-black text-white font-mono">
                {result.recommendedLevel}
              </div>
              <div className="text-sm font-bold text-cyan-300">{result.levelTitle}</div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-[10px] font-mono text-cyan-300 border border-cyan-500/20 mt-1">
                {getQualitativeConfidence(result.confidence)}
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto pt-2 leading-relaxed">
                {result.summary}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Strengths Observed
                </div>
                <ul className="text-slate-300 space-y-1">
                  {(result.strengths || []).map((s, i) => (
                    <li key={i} className="text-[11px]">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Focus Areas
                </div>
                <ul className="text-slate-300 space-y-1">
                  {(result.growthAreas || []).map((g, i) => (
                    <li key={i} className="text-[11px]">
                      • {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                onApplyLevel(result.recommendedLevel);
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all cursor-pointer"
            >
              Apply Level {result.recommendedLevel} to Practice Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Diagnostic Question {step + 1} of {testPrompts.length}
              </span>
              <div className="flex gap-1">
                {testPrompts.map((_, i) => (
                  <span
                    key={i}
                    className={`w-5 h-1.5 rounded-full ${
                      i === step ? 'bg-cyan-400' : i < step ? 'bg-cyan-600' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-white">{testPrompts[step].title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{testPrompts[step].prompt}</p>
            </div>

            <textarea
              ref={textareaRef}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={testPrompts[step].placeholder}
              rows={3}
              className="w-full p-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />

            <button
              onClick={handleNext}
              disabled={!currentInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>{step < testPrompts.length - 1 ? 'Next Question' : 'Evaluate CEFR Level'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
