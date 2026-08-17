import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Volume2,
  Trash2,
  Layers,
  Search,
  Plus,
  Zap,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, SavedWord } from '../types';
import { LiveAudioPlayer } from '../utils/audioUtils';
import { calculateNextReview } from '../utils/learnerStorage';

interface VocabularyNotebookProps {
  savedWords: SavedWord[];
  currentLanguage: Language;
  selectedVoice: string;
  onUpdateWord: (word: SavedWord) => void;
  onDeleteWord: (id: string) => void;
  onAddXP: (amount: number, activityId?: string) => void;
  onAddNewWord?: (word: SavedWord) => void;
}

type StudyModality = 'flip' | 'cloze' | 'audio_listen';

export const VocabularyNotebook: React.FC<VocabularyNotebookProps> = ({
  savedWords,
  currentLanguage,
  selectedVoice,
  onUpdateWord,
  onDeleteWord,
  onAddXP,
  onAddNewWord,
}) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [studySessionType, setStudySessionType] = useState<'quick' | 'full'>('quick');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyModality, setStudyModality] = useState<StudyModality>('flip');
  const [clozeInput, setClozeInput] = useState('');
  const [clozeSubmitted, setClozeSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang] = useState<string>(currentLanguage.id);
  const [filterMastery, setFilterMastery] = useState<'all' | 'learning' | 'mastered'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWordInput, setNewWordInput] = useState('');
  const [newTransInput, setNewTransInput] = useState('');
  const [newSentenceInput, setNewSentenceInput] = useState('');
  const [isRatingInFlight, setIsRatingInFlight] = useState(false);
  const processedEventsRef = React.useRef<Set<string>>(new Set());

  const audioPlayerRef = React.useRef<LiveAudioPlayer | null>(null);

  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer();
    return () => {
      audioPlayerRef.current?.close();
    };
  }, []);

  const filteredWords = savedWords.filter((w) => {
    const matchesLang = filterLang === 'all' || w.language === filterLang;
    const matchesMastery =
      filterMastery === 'all' ||
      (filterMastery === 'learning' && (w.masteryLevel || 0) < 4) ||
      (filterMastery === 'mastered' && (w.masteryLevel || 0) >= 4);
    const matchesSearch =
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.contextSentence && w.contextSentence.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLang && matchesMastery && matchesSearch;
  });

  const now = Date.now();
  const dueWords = filteredWords.filter(
    (w) => !w.nextReviewDate || w.nextReviewDate <= now || !w.lastReviewedDate
  );

  const activeDeck = isStudyMode
    ? studySessionType === 'quick'
      ? (dueWords.length > 0 ? dueWords : filteredWords).slice(0, 5)
      : (dueWords.length > 0 ? dueWords : filteredWords)
    : filteredWords;

  const playAudio = async (text: string) => {
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
    } catch (err) {
      console.error('Audio play error:', err);
    }
  };

  const handleStartStudy = (type: 'quick' | 'full', modality: StudyModality = 'flip') => {
    setStudySessionType(type);
    setStudyModality(modality);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setClozeInput('');
    setClozeSubmitted(false);
    setIsStudyMode(true);
  };

  const handleRateCard = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    if (isRatingInFlight) return;

    const currentWord = activeDeck[currentCardIndex];
    if (!currentWord || !currentWord.id) return;

    const eventKey = `rev-${currentWord.id}-${currentWord.lastReviewedDate || currentWord.dateAdded || 0}-${quality}-${currentCardIndex}`;
    if (processedEventsRef.current.has(eventKey)) {
      return;
    }
    processedEventsRef.current.add(eventKey);
    setIsRatingInFlight(true);

    const updated = calculateNextReview(currentWord, quality);
    onUpdateWord(updated);
    onAddXP(10, `xp-rev-${eventKey}`);

    if (currentCardIndex + 1 < activeDeck.length) {
      setIsFlipped(false);
      setClozeInput('');
      setClozeSubmitted(false);
      setCurrentCardIndex((prev) => prev + 1);
      setTimeout(() => {
        setIsRatingInFlight(false);
      }, 200);
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      onAddXP(studySessionType === 'quick' ? 30 : 60, `xp-sprint-${Date.now()}`);
      setIsStudyMode(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsRatingInFlight(false);
    }
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordInput.trim() || !newTransInput.trim()) return;

    const newWord: SavedWord = {
      id: 'saved-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      word: newWordInput.trim(),
      translation: newTransInput.trim(),
      language: currentLanguage.id,
      contextSentence: newSentenceInput.trim() || undefined,
      dateAdded: Date.now(),
      masteryLevel: 1,
      intervalDays: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      nextReviewDate: Date.now() + 86400000,
    };

    if (onAddNewWord) {
      onAddNewWord(newWord);
    }
    setNewWordInput('');
    setNewTransInput('');
    setNewSentenceInput('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-100 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/10">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Vocabulary Notebook</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                SRS SM-2
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Spaced repetition retention for words captured during live conversations
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Word</span>
          </button>

          <button
            onClick={() => handleStartStudy('quick', 'flip')}
            disabled={filteredWords.length === 0}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-400/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Quick Review (2 min)</span>
          </button>

          <button
            onClick={() => handleStartStudy('full', 'flip')}
            disabled={filteredWords.length === 0}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Layers className="w-4 h-4" />
            <span>Full Review ({dueWords.length > 0 ? dueWords.length : filteredWords.length})</span>
          </button>
        </div>
      </div>

      {/* STUDY MODE ARENA */}
      {isStudyMode && activeDeck.length > 0 ? (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-400 font-bold">
                Card {currentCardIndex + 1} / {activeDeck.length}
              </span>
              <span className="text-slate-400">
                ({studySessionType === 'quick' ? 'Quick 5-Card Sprint' : 'Full Deck'})
              </span>
            </div>

            <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => {
                  setStudyModality('flip');
                  setIsFlipped(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  studyModality === 'flip' ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Flip Card
              </button>
              <button
                onClick={() => {
                  setStudyModality('cloze');
                  setClozeInput('');
                  setClozeSubmitted(false);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  studyModality === 'cloze' ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Fill Blank
              </button>
              <button
                onClick={() => {
                  setStudyModality('audio_listen');
                  setIsFlipped(false);
                  playAudio(activeDeck[currentCardIndex].word);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  studyModality === 'audio_listen' ? 'bg-cyan-400 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Listen
              </button>
            </div>

            <button
              onClick={() => setIsStudyMode(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {studyModality === 'flip' && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full min-h-[300px] rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#030712] to-[#030712] border-2 border-cyan-500/30 p-8 shadow-2xl flex flex-col items-center justify-between cursor-pointer hover:border-cyan-500/50 transition-all text-center relative group"
            >
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-widest font-bold">
                {!isFlipped ? 'CLICK TO REVEAL TRANSLATION' : 'TARGET DEFINITION'}
              </span>

              <div className="my-auto space-y-3">
                {!isFlipped ? (
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {activeDeck[currentCardIndex].word}
                    </h2>
                    {activeDeck[currentCardIndex].romanization && (
                      <p className="text-sm font-mono text-cyan-300 mt-1">
                        /{activeDeck[currentCardIndex].romanization}/
                      </p>
                    )}
                    {activeDeck[currentCardIndex].contextSentence && (
                      <p className="text-xs text-slate-400 italic mt-3 max-w-md bg-white/5 p-3 rounded-2xl border border-white/5">
                        "{activeDeck[currentCardIndex].contextSentence}"
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-cyan-400">
                      {activeDeck[currentCardIndex].translation}
                    </div>
                    {activeDeck[currentCardIndex].definition && (
                      <p className="text-xs text-slate-300 mt-2 max-w-md">
                        {activeDeck[currentCardIndex].definition}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(activeDeck[currentCardIndex].word);
                  }}
                  className="p-2.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-all cursor-pointer"
                  title="Listen"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {studyModality === 'cloze' && (
            <div className="w-full min-h-[300px] rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#030712] to-[#030712] border-2 border-cyan-500/30 p-8 shadow-2xl flex flex-col justify-between text-center">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                TYPE THE TARGET WORD
              </div>

              <div className="my-auto space-y-4 max-w-md mx-auto w-full">
                <div className="text-xl font-bold text-cyan-300">
                  Meaning: {activeDeck[currentCardIndex].translation}
                </div>
                <div className="text-xs text-slate-400">
                  First letter hint: <span className="font-mono font-bold text-white uppercase">{activeDeck[currentCardIndex].word.charAt(0)}...</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type word here..."
                    value={clozeInput}
                    onChange={(e) => setClozeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setClozeSubmitted(true);
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    onClick={() => setClozeSubmitted(true)}
                    className="px-5 py-3 rounded-2xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 cursor-pointer"
                  >
                    Check
                  </button>
                </div>

                {clozeSubmitted && (
                  <div className={`p-4 rounded-2xl border text-xs font-bold ${
                    clozeInput.trim().toLowerCase() === activeDeck[currentCardIndex].word.toLowerCase()
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-amber-500/20 border-amber-500 text-amber-300'
                  }`}>
                    {clozeInput.trim().toLowerCase() === activeDeck[currentCardIndex].word.toLowerCase() ? (
                      <div>✓ Correct! Exact match: {activeDeck[currentCardIndex].word}</div>
                    ) : (
                      <div>Target answer: {activeDeck[currentCardIndex].word}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500">Rate your recall below to adjust SRS interval</div>
            </div>
          )}

          {studyModality === 'audio_listen' && (
            <div className="w-full min-h-[300px] rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#030712] to-[#030712] border-2 border-cyan-500/30 p-8 shadow-2xl flex flex-col items-center justify-between text-center">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                AUDIO RECALL CHALLENGE
              </div>

              <div className="my-auto space-y-4">
                <button
                  onClick={() => playAudio(activeDeck[currentCardIndex].word)}
                  className="w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 hover:scale-105 transition-all shadow-xl shadow-cyan-500/20 cursor-pointer mx-auto"
                >
                  <Volume2 className="w-8 h-8" />
                </button>
                <p className="text-xs text-slate-400">Click to replay native audio pronunciation</p>

                {isFlipped && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto">
                    <div className="text-xl font-black text-white">{activeDeck[currentCardIndex].word}</div>
                    <div className="text-sm font-bold text-cyan-400 mt-1">{activeDeck[currentCardIndex].translation}</div>
                  </div>
                )}
              </div>

              {!isFlipped ? (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-white cursor-pointer"
                >
                  Reveal Word
                </button>
              ) : (
                <div className="text-xs text-slate-500">Rate your recall below</div>
              )}
            </div>
          )}

          {/* SM-2 Rating Buttons */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              disabled={isRatingInFlight}
              onClick={() => handleRateCard('again')}
              className="py-3 px-2 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Again</span>
              <span className="text-[10px] opacity-70 font-mono">1 Day</span>
            </button>
            <button
              disabled={isRatingInFlight}
              onClick={() => handleRateCard('hard')}
              className="py-3 px-2 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Hard</span>
              <span className="text-[10px] opacity-70 font-mono">2 Days</span>
            </button>
            <button
              disabled={isRatingInFlight}
              onClick={() => handleRateCard('good')}
              className="py-3 px-2 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Good</span>
              <span className="text-[10px] opacity-70 font-mono">4 Days</span>
            </button>
            <button
              disabled={isRatingInFlight}
              onClick={() => handleRateCard('easy')}
              className="py-3 px-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Easy</span>
              <span className="text-[10px] opacity-70 font-mono">7+ Days</span>
            </button>
          </div>
        </div>
      ) : (
        /* WORD LIST / TABLE VIEW */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search saved vocabulary or context..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterMastery}
                onChange={(e) => setFilterMastery(e.target.value as any)}
                className="px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All Mastery Levels</option>
                <option value="learning">Learning (&lt; 4 stars)</option>
                <option value="mastered">Mastered (4+ stars)</option>
              </select>
            </div>
          </div>

          {filteredWords.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/10 text-slate-400 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-sm font-bold text-white">No saved words found</div>
              <p className="text-xs max-w-sm mx-auto">
                Save words from Live Voice calls, Roleplay conversations, or click "Add Word" to build your custom deck.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {word.word}
                        </h3>
                        {word.romanization && (
                          <div className="text-[11px] font-mono text-cyan-300/80">
                            /{word.romanization}/
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => playAudio(word.word)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                          title="Play"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteWord(word.id)}
                          className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-cyan-400">{word.translation}</div>

                    {word.contextSentence && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2 bg-white/5 p-2 rounded-xl">
                        "{word.contextSentence}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < (word.masteryLevel || 0) ? 'bg-cyan-400' : 'bg-white/10'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <span>
                      {word.reviewCount || 0} reviews • Interval: {word.intervalDays || 1}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#030712] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white mb-4">Add Word to SRS Notebook</h3>

            <form onSubmit={handleCreateWord} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Target Word in {currentLanguage.name}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Por supuesto"
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Translation / Meaning
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Of course / بالتأكيد"
                  value={newTransInput}
                  onChange={(e) => setNewTransInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Context Sentence (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ¡Por supuesto que te ayudo!"
                  value={newSentenceInput}
                  onChange={(e) => setNewSentenceInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer"
              >
                Save Word
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
