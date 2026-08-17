import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  RotateCcw,
  Loader2,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { Language, NativeLanguage, ProficiencyLevel, PronunciationResult } from '../types';
import { LiveAudioPlayer } from '../utils/audioUtils';
import { getAccentCoachingTips } from '../data/languageAids';

interface PronunciationLabProps {
  currentLanguage: Language;
  nativeLanguage: NativeLanguage;
  currentLevel: ProficiencyLevel;
  selectedVoice: string;
  initialPhrase?: string;
  onAddXP: (amount: number) => void;
  onOpenVocabModal: (word: string, contextSentence?: string) => void;
}

const DEFAULT_PRACTICE_PHRASES: Record<string, string[]> = {
  es: [
    'Mucho gusto en conocerte.',
    '¿Podría traerme la cuenta, por favor?',
    'Estoy aprendiendo español paso a paso.',
    '¿Dónde está la estación de metro más cercana?',
  ],
  fr: [
    'Enchanté de faire votre connaissance.',
    "L'addition, s'il vous plaît.",
    'Je voudrais réserver une table pour deux.',
    'Pouvez-vous répéter plus lentement?',
  ],
  de: [
    'Freut mich, Sie kennenzulernen.',
    'Die Rechnung, bitte.',
    'Ich lerne jeden Tag Deutsch.',
    'Könnten Sie das bitte wiederholen?',
  ],
  it: [
    'Piacere di conoscerti.',
    'Il conto, per favore.',
    'Vorrei un caffè espresso.',
    'Dov’è la fermata dell’autobus?',
  ],
  ja: [
    'はじめまして、よろしくお願いします。',
    'お会計をお願いします。',
    'これはいくらですか？',
    '駅はどこにありますか？',
  ],
  ar: [
    'أهلاً وسهلاً، فرصة سعيدة جداً.',
    'هل يمكنك مساعدتي من فضلك؟',
    'أنا أتعلم اللغة العربية كل يوم.',
    'كم حساب هذه الوجبة اللذيذة؟',
  ],
  pt: [
    'Muito prazer em conhecê-lo.',
    'A conta, por favor.',
    'Eu estou aprendendo português.',
    'Onde fica o ponto de ônibus?',
  ],
  ru: [
    'Очень приятно познакомиться.',
    'Счёт, пожалуйста.',
    'Я учу русский язык каждый день.',
    'Где находится ближайшая станция метро?',
  ],
};

export const PronunciationLab: React.FC<PronunciationLabProps> = ({
  currentLanguage,
  nativeLanguage,
  currentLevel,
  selectedVoice,
  initialPhrase,
  onAddXP,
  onOpenVocabModal,
}) => {
  const [targetPhrase, setTargetPhrase] = useState(
    initialPhrase ||
      DEFAULT_PRACTICE_PHRASES[currentLanguage.id]?.[0] ||
      currentLanguage.greeting ||
      'Hello!'
  );
  const [customInput, setCustomInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [evalResult, setEvalResult] = useState<PronunciationResult | null>(null);
  const [practiceSpeed, setPracticeSpeed] = useState<number>(0.85);

  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);

  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer();
    return () => {
      audioPlayerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (initialPhrase) {
      setTargetPhrase(initialPhrase);
    }
  }, [initialPhrase]);

  const playNativeAudio = async (text: string, speed = practiceSpeed) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: currentLanguage.name,
          voice: selectedVoice,
          speed,
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        audioPlayerRef.current?.playChunk(data.audioBase64, 24000);
      }
    } catch (e) {
      console.error('Audio playback error:', e);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage.speechCode || 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setUserSpokenText('');
        setEvalResult(null);
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setUserSpokenText(spoken);
        analyzePronunciation(targetPhrase, spoken);
      };

      recognition.onerror = (e: any) => {
        console.error('Recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsRecording(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const analyzePronunciation = async (target: string, spoken: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/pronunciation/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSentence: target,
          userSpokenText: spoken,
          language: currentLanguage.name,
          nativeLanguage: nativeLanguage.name,
        }),
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const data: PronunciationResult = await res.json();
      setEvalResult(data);

      if (data.overallScore >= 80) {
        onAddXP(25);
      } else {
        onAddXP(10);
      }
    } catch (e) {
      console.error('Evaluation error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const accentRules = getAccentCoachingTips(currentLanguage.id, nativeLanguage.id);
  const sampleList = DEFAULT_PRACTICE_PHRASES[currentLanguage.id] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 text-slate-100 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Accent & Pronunciation Lab</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Phonetic Coach
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your voice against native speech models with syllable-by-syllable feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-full border border-white/10 text-xs">
          <span className="text-[10px] font-mono text-slate-400 pl-3">SPEED:</span>
          {[
            { val: 0.75, label: '0.75x' },
            { val: 0.85, label: '0.85x' },
            { val: 1.0, label: '1.0x' },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setPracticeSpeed(s.val)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                practiceSpeed === s.val ? 'bg-emerald-400 text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target Phrase Master Card */}
      <div className="rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#030712] to-[#030712] border-2 border-emerald-500/30 p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
            TARGET PHRASE TO MASTER
          </span>
          <button
            onClick={() => playNativeAudio(targetPhrase, practiceSpeed)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen Native Audio</span>
          </button>
        </div>

        <div className="text-center py-4 space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-relaxed">
            {targetPhrase}
          </h2>
          <p className="text-xs text-slate-400">
            Click the microphone below and speak this sentence clearly in {currentLanguage.name}.
          </p>
        </div>

        {/* Live Mic Recording Trigger */}
        <div className="flex flex-col items-center justify-center gap-3 pt-2">
          <button
            onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
            disabled={isAnalyzing}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-2xl cursor-pointer ${
              isRecording
                ? 'bg-red-500 animate-pulse shadow-red-500/50 scale-110'
                : 'bg-gradient-to-tr from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-black shadow-emerald-500/30 hover:scale-105'
            }`}
          >
            {isRecording ? <Mic className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-black" />}
          </button>

          <span className="text-xs font-mono font-bold text-slate-400">
            {isRecording
              ? 'Listening to your voice... Tap to finish'
              : isAnalyzing
              ? 'Analyzing acoustic pronunciation...'
              : 'Tap to Record & Score'}
          </span>
        </div>

        {/* Real-Time User Audio Output & Analysis Card */}
        {userSpokenText && (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">You Said:</div>
            <div className="text-sm font-bold text-white italic">"{userSpokenText}"</div>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-300 p-4">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Calculating phonetic match & rhythm score...</span>
          </div>
        )}

        {/* Detailed Evaluation Feedback */}
        {evalResult && (
          <div className="p-6 rounded-3xl bg-black/60 border border-emerald-500/40 space-y-5 animate-in fade-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  OVERALL PRONUNCIATION SCORE
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  {evalResult.overallScore}%
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>{evalResult.overallScore >= 85 ? 'Native Caliber' : evalResult.overallScore >= 70 ? 'Very Clear' : 'Needs Practice'}</span>
              </div>
            </div>

            {/* Word-by-Word Breakdown */}
            {evalResult.wordBreakdown && evalResult.wordBreakdown.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Word-by-Word Phonetic Breakdown:</div>
                <div className="flex flex-wrap gap-2">
                  {evalResult.wordBreakdown.map((item, idx) => {
                    const isGood = (item.accuracyScore || 80) >= 80;
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-2xl border flex flex-col items-center gap-0.5 ${
                          isGood
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        }`}
                      >
                        <span className="font-bold text-xs">{item.word}</span>
                        {item.phonetic && (
                          <span className="text-[10px] font-mono opacity-80">{item.phonetic}</span>
                        )}
                        <span className="text-[9px] font-mono font-bold">
                          {item.accuracyScore}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coaching Tips */}
            <div className="space-y-2 text-xs text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Coach Guidance:</span>
              </div>
              <p className="leading-relaxed">{evalResult.feedback}</p>
              {evalResult.fluencyTip && (
                <p className="text-emerald-300/90 font-medium">💡 {evalResult.fluencyTip}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preset Phrases Strip & Custom Phrase Input */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Practice Sentences ({currentLanguage.name})
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">1-TAP LOAD</span>
          </div>

          <div className="space-y-2">
            {sampleList.map((phrase, i) => (
              <button
                key={i}
                onClick={() => {
                  setTargetPhrase(phrase);
                  setEvalResult(null);
                  setUserSpokenText('');
                }}
                className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                  targetPhrase === phrase
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/5 text-slate-300'
                }`}
              >
                <span>{phrase}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="pt-2 flex gap-2">
            <input
              type="text"
              placeholder="Or enter any custom phrase to practice..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customInput.trim()) {
                  setTargetPhrase(customInput.trim());
                  setCustomInput('');
                  setEvalResult(null);
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => {
                if (customInput.trim()) {
                  setTargetPhrase(customInput.trim());
                  setCustomInput('');
                  setEvalResult(null);
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 text-black font-bold text-xs hover:bg-emerald-300 cursor-pointer"
            >
              Load
            </button>
          </div>
        </div>

        {/* Accent Coaching Rules */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 space-y-3 shadow-xl">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Accent Pitfalls ({nativeLanguage.name} ➔ {currentLanguage.name})
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            {accentRules.map((rule, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <div className="font-bold text-emerald-300">{rule.title}</div>
                <div className="text-[11px] text-slate-300 leading-relaxed">{rule.description}</div>
                <div className="text-[10px] text-slate-400 italic">Example: "{rule.example}"</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
