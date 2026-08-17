import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle,
  BookOpen,
  Volume2,
} from 'lucide-react';
import { Language, NativeLanguage, ProficiencyLevel } from '../types';
import { LiveAudioPlayer } from '../utils/audioUtils';

interface AITutorCoachProps {
  currentLanguage: Language;
  nativeLanguage: NativeLanguage;
  currentLevel: ProficiencyLevel;
  selectedVoice: string;
  onAddXP: (amount: number) => void;
  onOpenVocabModal: (word: string, contextSentence?: string) => void;
}

interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
}

export const AITutorCoach: React.FC<AITutorCoachProps> = ({
  currentLanguage,
  nativeLanguage,
  currentLevel,
  selectedVoice,
  onAddXP,
  onOpenVocabModal,
}) => {
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);

  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer();
    const initialTutorMsg: TutorMessage = {
      id: 'tutor-init-' + Date.now(),
      sender: 'tutor',
      text: `Hello! I'm your dedicated LinguaCoach for **${currentLanguage.name}** (CEFR Level: **${currentLevel}**). \n\nYou can ask me anything about grammar rules, cultural etiquette, subtle nuances, or ask for sentence breakdowns in **${nativeLanguage.name}**. What would you like to explore today?`,
      timestamp: Date.now(),
    };
    setMessages([initialTutorMsg]);

    return () => {
      audioPlayerRef.current?.close();
    };
  }, [currentLanguage, currentLevel, nativeLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText || input).trim();
    if (!text || isLoading) return;

    const userMsg: TutorMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: currentLanguage.name,
          nativeLanguage: nativeLanguage.name,
          level: currentLevel,
          scenario: {
            title: 'Grammar & Etiquette Coaching',
            role: 'Language Inquirer',
            partnerRole: 'Pedagogical Language Tutor & Linguist',
            setting: 'One-on-one virtual office hours',
          },
          messages: newMsgs.map((m) => ({
            sender: m.sender === 'user' ? 'user' : 'ai',
            text: m.text,
          })),
          userMessage: text,
        }),
      });

      if (!res.ok) throw new Error('Failed to ask tutor');
      const data = await res.json();
      onAddXP(15);

      const tutorReply: TutorMessage = {
        id: 'tutor-' + Date.now(),
        sender: 'tutor',
        text: data.replyText || "Here's what you need to know about that rule...",
        timestamp: Date.now(),
      };

      setMessages([...newMsgs, tutorReply]);
    } catch (err) {
      console.error('Tutor error:', err);
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
          speed: 0.9,
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        audioPlayerRef.current?.playChunk(data.audioBase64, 24000);
      }
    } catch (e) {
      console.error('TTS error:', e);
    }
  };

  const starterQuestions = [
    `When do I use formal vs informal addressing in ${currentLanguage.name}?`,
    `Explain the most common verb tense mistakes at ${currentLevel} level.`,
    `What are 5 essential native expressions for polite dining?`,
    `How does sentence order change when asking a question in ${currentLanguage.name}?`,
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-6rem)] text-slate-100 animate-in fade-in duration-300">
      
      {/* Top Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-xl mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/10">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>LinguaCoach AI Tutor</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                Grammar & Culture
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Ask any question in {nativeLanguage.name} about {currentLanguage.name} ({currentLevel})
            </p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-5 overflow-y-auto space-y-4 shadow-2xl">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] font-mono font-bold text-slate-400">
              {m.sender === 'user' ? (
                <>
                  <span>YOU</span>
                  <User className="w-3 h-3 text-cyan-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-amber-400" />
                  <span>LINGUACOACH</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.text}

              {m.sender === 'tutor' && (
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => playTTS(m.text)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Read Aloud</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-amber-300 w-fit">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>LinguaCoach is explaining...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts */}
      {messages.length < 3 && (
        <div className="py-2 shrink-0 overflow-x-auto scrollbar-none flex gap-2">
          {starterQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-xs text-slate-300 hover:text-amber-200 transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="mt-2 shrink-0 bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 p-2 pl-4 shadow-2xl flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={`Ask any question about ${currentLanguage.name} grammar, pronunciation, or culture...`}
          className="flex-1 bg-transparent border-0 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none"
        />

        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-black flex items-center justify-center font-bold transition-all cursor-pointer shadow-lg shadow-amber-400/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
