import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  BookmarkPlus,
  BookmarkCheck,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Language, NativeLanguage, SavedWord } from '../types';
import { LiveAudioPlayer } from '../utils/audioUtils';

interface WordInspectorModalProps {
  word: string;
  contextSentence?: string;
  currentLanguage: Language;
  nativeLanguage: NativeLanguage;
  selectedVoice: string;
  isSaved: boolean;
  onSaveWord: (word: SavedWord) => void;
  onClose: () => void;
}

interface WordExplanationData {
  word: string;
  translation: string;
  romanization?: string;
  partOfSpeech?: string;
  definition: string;
  exampleTarget: string;
  exampleTranslation: string;
  grammarTip?: string;
  culturalNote?: string;
}

export const WordInspectorModal: React.FC<WordInspectorModalProps> = ({
  word,
  contextSentence,
  currentLanguage,
  nativeLanguage,
  selectedVoice,
  isSaved,
  onSaveWord,
  onClose,
}) => {
  const [data, setData] = useState<WordExplanationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedStatus, setSavedStatus] = useState(isSaved);
  const audioPlayerRef = React.useRef<LiveAudioPlayer | null>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    audioPlayerRef.current = new LiveAudioPlayer();
    fetchWordDetails();
    
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
      audioPlayerRef.current?.close();
      triggerRef.current?.focus();
    };
  }, [word]);

  const fetchWordDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vocabulary/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word,
          context: contextSentence || '',
          language: currentLanguage.name,
          nativeLanguage: nativeLanguage.name,
        }),
      });

      if (!res.ok) throw new Error('Failed to explain word');
      const json: WordExplanationData = await res.json();
      setData(json);
    } catch (e) {
      console.error('Word explain error:', e);
      setData({
        word,
        translation: 'Definition unavailable offline',
        definition: 'Context definition could not be retrieved.',
        exampleTarget: contextSentence || word,
        exampleTranslation: 'Meaning in context',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: currentLanguage.name,
          voice: selectedVoice,
          speed: 0.85,
        }),
      });
      const resData = await res.json();
      if (resData.audioBase64) {
        audioPlayerRef.current?.playChunk(resData.audioBase64, 24000);
      }
    } catch (e) {
      console.error('TTS error:', e);
    }
  };

  const handleSave = () => {
    if (!data) return;

    const newSaved: SavedWord = {
      id: 'vocab-' + Date.now(),
      word: data.word,
      translation: data.translation,
      language: currentLanguage.id,
      contextSentence: contextSentence || data.exampleTarget,
      romanization: data.romanization,
      definition: data.definition,
      dateAdded: Date.now(),
      masteryLevel: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      nextReviewDate: Date.now() + 86400000,
    };

    onSaveWord(newSaved);
    setSavedStatus(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Vocabulary Inspector for ${word}`}
        className="bg-[#030712]/95 border border-cyan-500/30 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4 animate-in zoom-in-95"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoading ? (
          <div className="py-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
            <div className="text-xs text-slate-300 font-mono">
              Analyzing word "{word}" in context...
            </div>
          </div>
        ) : data ? (
          <>
            {/* Header / Word & Audio */}
            <div className="flex items-start justify-between pr-8">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">{data.word}</h2>
                  <button
                    onClick={() => playTTS(data.word)}
                    className="p-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
                    title="Pronounce Word"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                {data.romanization && (
                  <div className="text-xs font-mono text-cyan-300/80 mt-0.5">
                    /{data.romanization}/
                  </div>
                )}
                {data.partOfSpeech && (
                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-white/5 px-2 py-0.5 rounded mt-1 inline-block">
                    {data.partOfSpeech}
                  </span>
                )}
              </div>
            </div>

            {/* Translation & Definition */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="text-base font-bold text-cyan-400">{data.translation}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{data.definition}</p>
            </div>

            {/* Example in Context */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Context Example:
              </span>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-white font-medium">
                  <span>"{data.exampleTarget}"</span>
                  <button
                    onClick={() => playTTS(data.exampleTarget)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">{data.exampleTranslation}</div>
              </div>
            </div>

            {/* Grammar / Culture Tip */}
            {data.grammarTip && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">{data.grammarTip}</div>
              </div>
            )}

            {/* Save to SRS Button */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                disabled={savedStatus}
                className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  savedStatus
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 cursor-default'
                    : 'bg-white hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                }`}
              >
                {savedStatus ? (
                  <>
                    <BookmarkCheck className="w-4 h-4" />
                    <span>Saved to SRS Notebook</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save to SRS Flashcards</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : null}

      </div>
    </div>
  );
};
