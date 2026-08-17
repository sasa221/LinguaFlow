import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  Award,
  Languages,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Loader2,
  Pause,
} from 'lucide-react';
import {
  Language,
  NativeLanguage,
  ProficiencyLevel,
  Scenario,
  ChatMessage,
} from '../types';
import { LiveAudioPlayer } from '../utils/audioUtils';
import { getSurvivalPhrases } from '../data/languageAids';
import { tokenizeSentence } from '../utils/textTokenizer';

interface RoleplayChatProps {
  language: Language;
  nativeLanguage: NativeLanguage;
  level: ProficiencyLevel;
  scenario: Scenario;
  selectedVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  playbackSpeed: number;
  onAddXP: (amount: number) => void;
  onOpenVocabModal: (word: string, contextSentence?: string) => void;
  onOpenPronunciationModal: (sentence: string) => void;
  onFinishSession: (stats: { seconds: number; turns: number; scenarioTitle: string }) => void;
}

export const RoleplayChat: React.FC<RoleplayChatProps> = ({
  language,
  nativeLanguage,
  level,
  scenario,
  selectedVoice,
  playbackSpeed,
  onAddXP,
  onOpenVocabModal,
  onOpenPronunciationModal,
  onFinishSession,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);
  const [showRomanization, setShowRomanization] = useState(true);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [sessionStartTime] = useState<number>(Date.now());
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);

  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer((playing) => {
      if (!playing) {
        setPlayingAudioId(null);
      }
    });

    return () => {
      audioPlayerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const initialMsg: ChatMessage = {
      id: 'init-' + Date.now(),
      sender: 'ai',
      text: scenario.initialMessage,
      translation: scenario.initialMessageTranslation,
      romanization: scenario.initialMessageRomanization,
      timestamp: Date.now(),
      suggestedReplies: scenario.suggestedReplies,
    };
    setMessages([initialMsg]);
    setHintLevel(0);
  }, [scenario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const playMessageAudio = async (messageId: string, text: string) => {
    if (playingAudioId === messageId) {
      audioPlayerRef.current?.stopAll();
      setPlayingAudioId(null);
      return;
    }

    try {
      setAudioLoadingId(messageId);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: language.name,
          voice: selectedVoice,
          speed: playbackSpeed,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate TTS');
      }

      const data = await res.json();
      setAudioLoadingId(null);

      if (data.audioBase64) {
        setPlayingAudioId(messageId);
        audioPlayerRef.current?.playChunk(data.audioBase64, data.sampleRate || 24000);
      }
    } catch (err) {
      console.error('Error generating audio:', err);
      setAudioLoadingId(null);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language.speechCode || 'es-ES';
        utterance.rate = playbackSpeed;
        utterance.onend = () => setPlayingAudioId(null);
        setPlayingAudioId(messageId);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setHintLevel(0);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: language.name,
          nativeLanguage: nativeLanguage.name,
          level: level,
          scenario: scenario,
          messages: newMessages.map((m) => ({ sender: m.sender, text: m.text })),
          userMessage: text,
          partnerRole: scenario.partnerRole,
          userRole: scenario.role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get chat response');
      }

      const data = await response.json();
      onAddXP(15);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.replyText,
        translation: data.replyTranslation,
        romanization: data.replyRomanization,
        timestamp: Date.now(),
        correction:
          data.correction?.hasMistake || (data.correction?.wrongWords && data.correction.wrongWords.length > 0)
            ? data.correction
            : undefined,
        suggestedReplies: data.suggestedReplies,
      };

      setMessages([...newMessages, aiMsg]);
      playMessageAudio(aiMsg.id, aiMsg.text);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackAiMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: language.greeting || '¡Muy bien! Sigamos practicando.',
        translation: 'ممتاز! كمل كلامك ومعاك خطوة بخطوة.',
        timestamp: Date.now(),
      };
      setMessages([...newMessages, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language.speechCode || 'es-ES';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsListening(false);
    }
  };

  const renderClickableWords = (text: string, fullSentence: string) => {
    const tokens = tokenizeSentence(text, language.id);
    return tokens.map((token, i) => {
      if (!token.isWord) return <span key={i}>{token.text}</span>;

      return (
        <span
          key={i}
          onClick={() => onOpenVocabModal(token.cleanWord, fullSentence)}
          className="cursor-pointer hover:text-cyan-300 hover:underline decoration-cyan-400/40 rounded px-0.5 transition-colors"
          title="Inspect word & save to Notebook"
        >
          {token.text}
        </span>
      );
    });
  };

  const handleEndSession = () => {
    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
    const userTurns = messages.filter((m) => m.sender === 'user').length;
    onFinishSession({
      seconds: durationSeconds,
      turns: userTurns,
      scenarioTitle: scenario.title,
    });
  };

  const lastAiMessage =
    messages.length > 0 && messages[messages.length - 1].sender === 'ai'
      ? messages[messages.length - 1]
      : null;
  const suggestedReplies = lastAiMessage?.suggestedReplies || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-6rem)]">
      
      {/* Scenario Header */}
      <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-2xl mb-4 shrink-0 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="text-2xl p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner flex items-center gap-1.5">
              <span>{nativeLanguage.flag}</span>
              <span className="text-xs text-slate-500">➔</span>
              <span>{language.flag}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  {scenario.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {scenario.difficultyLevel}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {scenario.title}
              </h1>
              <p className="text-xs text-slate-400">
                You: <span className="text-slate-200 font-medium">{scenario.role}</span> • Partner: <span className="text-cyan-300 font-semibold">{scenario.partnerRole}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                showTranslations
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
              title="Toggle Translations"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Translations</span>
            </button>

            <button
              onClick={() => setShowRomanization(!showRomanization)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                showRomanization
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
              title="Toggle Romanization"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phonetics</span>
            </button>

            <button
              onClick={handleEndSession}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Review Session</span>
            </button>
          </div>
        </div>

        {/* Objectives */}
        <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
            Mission Goals:
          </span>
          {scenario.objectives.map((obj, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px]"
            >
              {obj}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-5 overflow-y-auto space-y-4 shadow-2xl">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono font-bold text-slate-400">
              <span className={msg.sender === 'user' ? 'text-slate-300' : 'text-cyan-400'}>
                {msg.sender === 'user' ? 'YOU' : scenario.partnerRole.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 shadow-xl text-sm relative transition-all ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                  : 'bg-white/5 border border-white/10 text-slate-100 rounded-tl-none backdrop-blur-md'
              }`}
            >
              <div className="text-base leading-relaxed font-medium">
                {renderClickableWords(msg.text, msg.text)}
              </div>

              {showRomanization && msg.romanization && (
                <div className="mt-1 text-xs text-cyan-300/90 italic font-mono">
                  {msg.romanization}
                </div>
              )}

              {showTranslations && msg.translation && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-300 font-sans">
                  {msg.translation}
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => playMessageAudio(msg.id, msg.text)}
                    disabled={audioLoadingId === msg.id}
                    className={`px-2.5 py-1 rounded-full flex items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
                      playingAudioId === msg.id
                        ? 'bg-cyan-400 text-black font-bold animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                    title="Listen"
                  >
                    {audioLoadingId === msg.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : playingAudioId === msg.id ? (
                      <Pause className="w-3 h-3" />
                    ) : (
                      <Volume2 className="w-3 h-3 text-cyan-400" />
                    )}
                    <span>{playingAudioId === msg.id ? 'Playing' : 'Listen'}</span>
                  </button>

                  <button
                    onClick={() => onOpenPronunciationModal(msg.text)}
                    className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-white/10 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                    title="Practice sentence pronunciation"
                  >
                    <Mic className="w-3 h-3 text-orange-400" />
                    <span>Practice Pronunciation</span>
                  </button>
                </div>

                <div className="text-[10px] font-mono text-slate-400 italic hidden sm:inline">
                  Tap any word to inspect
                </div>
              </div>
            </div>

            {/* Wrong Words & Grammar Correction Coach Banner */}
            {msg.correction && (
              <div className="mt-2 max-w-[85%] sm:max-w-[75%] rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border-l-4 border-orange-500 p-4 text-xs text-orange-200 shadow-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-orange-400 font-mono uppercase tracking-wider text-[11px]">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span>Mistake & Accent Coach</span>
                  </div>
                </div>

                {msg.correction.wrongWords && msg.correction.wrongWords.length > 0 && (
                  <div className="bg-black/30 rounded-xl p-2.5 space-y-1.5 border border-white/5">
                    <div className="text-[10px] font-bold text-amber-300 uppercase">Specific Word Corrections:</div>
                    {msg.correction.wrongWords.map((item, idx) => (
                      <div key={idx} className="flex flex-col text-[11px] text-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="line-through text-red-400 font-mono">{item.word}</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400" />
                          <span className="text-cyan-300 font-bold font-mono">{item.correction}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">{item.reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <div>
                    <span className="text-slate-400">Better Phrasing:</span>{' '}
                    <strong className="text-white font-semibold">{msg.correction.correctedText}</strong>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{msg.correction.explanation}</p>
                </div>

                {msg.correction.accentTip && (
                  <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-cyan-300 font-bold block">Accent & Cadence Tip:</strong>
                      <span>{msg.correction.accentTip}</span>
                    </div>
                  </div>
                )}

                {msg.correction.grammarTip && (
                  <div className="text-[10px] text-amber-300 font-mono flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-400" /> Quick Rule: {msg.correction.grammarTip}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-3xl bg-white/5 border border-white/10 text-slate-300 text-xs w-fit backdrop-blur-md">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="font-mono text-cyan-300">{scenario.partnerRole} is replying...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Progressive 3-Level Hint System */}
      {suggestedReplies.length > 0 && (
        <div className="py-2 shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" /> Progressive Assistance
            </div>
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              {[
                { lvl: 1, label: 'Keywords' },
                { lvl: 2, label: 'Starter' },
                { lvl: 3, label: 'Full Reply' },
              ].map((h) => (
                <button
                  key={h.lvl}
                  onClick={() => setHintLevel(hintLevel === h.lvl ? 0 : h.lvl)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    hintLevel === h.lvl ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {hintLevel > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {suggestedReplies.map((reply, index) => {
                let displayPrompt = reply.text;
                if (hintLevel === 1) {
                  const words = reply.text.split(' ').filter((w) => w.length > 3);
                  displayPrompt = words.slice(0, 3).join(' • ') + '...';
                } else if (hintLevel === 2) {
                  const words = reply.text.split(' ');
                  displayPrompt = words.slice(0, Math.min(3, words.length)).join(' ') + '...';
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (hintLevel === 3) {
                        handleSendMessage(reply.text);
                      } else {
                        setInputText(reply.text);
                      }
                    }}
                    disabled={isLoading}
                    className="p-3 rounded-2xl bg-black/40 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">
                      {displayPrompt}
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-cyan-300 mt-0.5">
                      {reply.translation}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Beginner Quick Phrasebook Strip */}
      {level === 'A1' && getSurvivalPhrases(language.id).length > 0 && (
        <div className="py-1 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider whitespace-nowrap px-1.5 py-0.5 rounded bg-cyan-500/10">
              A1 Survival:
            </span>
            {getSurvivalPhrases(language.id).slice(0, 6).map((phrase) => (
              <button
                key={phrase.id}
                onClick={() => handleSendMessage(phrase.target)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400/40 text-left text-xs whitespace-nowrap text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <span>{phrase.target}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Immersive Input Bar */}
      <div className="mt-2 shrink-0 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 p-2 pl-3 shadow-2xl flex items-center gap-2">
        <button
          onClick={toggleSpeechRecognition}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            isListening
              ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
              : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10'
          }`}
          title={isListening ? 'Listening... Tap to stop' : 'Tap to speak your response'}
        >
          <Mic className="w-4 h-4 text-cyan-400" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Speak or type in ${language.name}...`}
          disabled={isLoading}
          className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-white hover:bg-cyan-400 disabled:opacity-30 text-black flex items-center justify-center transition-colors font-bold shadow-lg shadow-cyan-500/20 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
