import React, { useState } from 'react';
import {
  CheckCircle2,
  Lock,
  Play,
  Award,
  Sparkles,
  BookOpen,
  ChevronRight,
  MessageSquare,
  Volume2,
  Clock,
  Check,
  Target,
  Flame,
  ArrowRight,
  HelpCircle,
  Zap,
  Mic,
  PenTool,
} from 'lucide-react';
import {
  CurriculumUnit,
  CurriculumLesson,
  LearnerCurriculumProgress,
  Language,
} from '../../types';
import { getCurriculumForLanguage, getCurriculumDefinition } from '../../data/curriculum/curriculumData';
import { getCanDoMasteryReport } from '../../data/curriculum/curriculumEngine';
import { useSpeech } from '../../hooks/useSpeech';

interface CurriculumViewProps {
  language: Language;
  progress: LearnerCurriculumProgress;
  onStartLesson: (unit: CurriculumUnit, lesson: CurriculumLesson) => void;
  onStartMilestone: (unit: CurriculumUnit) => void;
  onTestOutUnit?: (unit: CurriculumUnit) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  language,
  progress,
  onStartLesson,
  onStartMilestone,
  onTestOutUnit,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    progress.currentUnitId || 'es-u1'
  );
  const [activeSubTab, setActiveSubTab] = useState<'roadmap' | 'cando' | 'script' | 'phonetics'>('roadmap');

  const { speak } = useSpeech();
  const units = getCurriculumForLanguage(language.id);
  const definition = getCurriculumDefinition(language.id);
  const scriptTrack = definition?.scriptTrack;
  const pronunciationTrack = definition?.pronunciationTrack;

  const selectedUnit = units.find((u) => u.id === selectedUnitId) || units[0];

  const canDoReport = getCanDoMasteryReport(language.id, progress);
  const totalCompletedLessons = progress.completedLessonIds.length;
  const totalLessons = units.reduce((acc, u) => acc + u.lessons.length, 0);
  const overallCurriculumProgress = Math.round(
    (totalCompletedLessons / Math.max(1, totalLessons)) * 100
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0a1128] to-slate-950 border border-white/10 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{language.flag}</span>
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                Structured Course • A0 to Early A1
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {language.name} Learning Path
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              From absolute zero to real conversational independence through structured, step-by-step units.
            </p>
          </div>

          {/* Quick Progress Stat Card */}
          <div className="flex items-center gap-4 bg-slate-950/70 border border-white/10 rounded-2xl p-4 sm:p-5 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-cyan-500/20">
              {overallCurriculumProgress}%
            </div>
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase">
                Course Progress
              </div>
              <div className="text-sm font-bold text-white">
                {totalCompletedLessons} of {totalLessons} Lessons Done
              </div>
              <div className="text-xs text-emerald-400 font-medium">
                {canDoReport.mastered.length} Can-Do Skills Mastered
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'roadmap'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Unit Roadmap
          </button>
          <button
            onClick={() => setActiveSubTab('cando')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeSubTab === 'cando'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Can-Do Competencies ({canDoReport.mastered.length})
          </button>
          {scriptTrack && (
            <button
              onClick={() => setActiveSubTab('script')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeSubTab === 'script'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className="w-4 h-4" />
              Script & Alphabet
            </button>
          )}
          {pronunciationTrack && (
            <button
              onClick={() => setActiveSubTab('phonetics')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
                activeSubTab === 'phonetics'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mic className="w-4 h-4" />
              Phonetics & Pronunciation
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'roadmap' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Roadmap Unit Steps */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span>Learning Sequence</span>
            </h2>

            <div className="space-y-3 relative">
              {units.map((unit, index) => {
                const isUnlocked = progress.unlockedUnitIds.includes(unit.id);
                const isCompleted = progress.completedUnitIds.includes(unit.id);
                const isCurrent = progress.currentUnitId === unit.id && !isCompleted;
                const isSelected = selectedUnitId === unit.id;

                const completedUnitLessonsCount = unit.lessons.filter((l) =>
                  progress.completedLessonIds.includes(l.id)
                ).length;

                return (
                  <div
                    key={unit.id}
                    onClick={() => isUnlocked && setSelectedUnitId(unit.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10'
                        : isUnlocked
                        ? 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900/90'
                        : 'bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                            isCompleted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isCurrent
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                              : isUnlocked
                              ? 'bg-slate-800 text-slate-300'
                              : 'bg-slate-900 text-slate-600'
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : isUnlocked ? (
                            <span>{unit.icon}</span>
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-cyan-400">
                              Unit {unit.order}
                            </span>
                            {unit.validationStatus === 'VALIDATED_A0' ? (
                              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                                A0 Validated
                              </span>
                            ) : unit.validationStatus === 'BETA_CURRICULUM' ? (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">
                                Beta
                              </span>
                            ) : null}
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                                Current
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-white">
                            {unit.title}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400">
                          {completedUnitLessonsCount}/{unit.lessons.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Unit Detail */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative">
              
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{selectedUnit.icon}</span>
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                      Unit {selectedUnit.order} • {selectedUnit.level} Level
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {selectedUnit.title}
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    {selectedUnit.subtitle}
                  </p>
                </div>

                {onTestOutUnit && (
                  <button
                    onClick={() => onTestOutUnit(selectedUnit)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors"
                    title="Skip ahead by demonstrating mastery"
                  >
                    I already know this
                  </button>
                )}
              </div>

              {/* Unit Objective Box */}
              <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 mb-6">
                <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Unit Learning Goal
                </div>
                <p className="text-xs sm:text-sm text-slate-200">
                  {selectedUnit.objective}
                </p>
              </div>

              {/* Lessons List */}
              <div className="space-y-3 mb-6">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Lessons in this Unit
                </div>

                {selectedUnit.lessons.map((lesson, lIdx) => {
                  const isDone = progress.completedLessonIds.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                        isDone
                          ? 'bg-emerald-950/20 border-emerald-500/30'
                          : 'bg-slate-950/60 border-white/10 hover:border-cyan-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {isDone ? <Check className="w-4 h-4" /> : lIdx + 1}
                        </div>

                        <div>
                          <div className="text-sm font-bold text-white">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{lesson.subtitle}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-400 font-mono">
                              <Clock className="w-3 h-3" />
                              ~{lesson.estimatedMinutes} min
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onStartLesson(selectedUnit, lesson)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isDone
                            ? 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        }`}
                      >
                        <span>{isDone ? 'Review' : 'Start'}</span>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Milestone Challenge Card */}
              {selectedUnit.milestoneChallenge && (
                <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/30 border border-indigo-500/30 rounded-2xl p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      <span className="text-xs font-bold uppercase text-indigo-300 tracking-wider">
                        Unit Milestone Challenge
                      </span>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      Live Voice Connected
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {selectedUnit.milestoneChallenge.title}
                  </h3>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    {selectedUnit.milestoneChallenge.description}
                  </p>

                  <button
                    onClick={() => onStartMilestone(selectedUnit)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Begin Milestone Spoken Challenge
                  </button>
                </div>
              )}

            </div>
          </div>

        </div>
      ) : activeSubTab === 'cando' ? (
        /* Can-Do Competencies Tab */
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2">
              Your Communicative Competencies
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mb-6">
              Instead of arbitrary scores, LinguaFlow tracks exactly what real-world actions you can perform in {language.name}.
            </p>

            <div className="space-y-6">
              {/* Mastered Skills */}
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Mastered Can-Do Skills ({canDoReport.mastered.length})
                </div>

                {canDoReport.mastered.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 text-xs text-slate-400 italic">
                    Complete your first unit lessons to unlock your initial Can-Do competencies!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {canDoReport.mastered.map((c) => {
                      const evidence = progress.canDoEvidence?.[c.id];
                      return (
                        <div
                          key={c.id}
                          className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="text-xs text-emerald-300 font-bold uppercase">
                                {c.unitTitle}
                              </span>
                              {evidence && (
                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                  evidence.spontaneousRecall
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                }`}>
                                  {evidence.spontaneousRecall ? '⭐️ Spontaneous' : `💡 Hint Lvl ${evidence.hintLevel}`}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-semibold text-emerald-100">
                              {c.canDoStatement}
                            </div>
                            {evidence && (
                              <div className="text-[11px] text-emerald-400/80 font-mono mt-1">
                                Verified: {evidence.speechAccuracy}% accuracy • {evidence.context}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* In Progress */}
              <div>
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Currently Developing ({canDoReport.inProgress.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {canDoReport.inProgress.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full border-2 border-cyan-400/60 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs text-slate-400 font-bold uppercase">
                          {c.unitTitle}
                        </div>
                        <div className="text-sm font-semibold text-slate-200">
                          {c.canDoStatement}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      ) : activeSubTab === 'script' && scriptTrack ? (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Script Track • {scriptTrack.nativeScriptName}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {scriptTrack.scriptName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {scriptTrack.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {scriptTrack.stages.map((stage) => (
              <div key={stage.id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-cyan-300">{stage.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                </div>

                {stage.lessons.map((lesson) => (
                  <div key={lesson.id} className="space-y-3">
                    <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {lesson.title} — <span className="text-slate-400 lowercase font-normal">{lesson.description}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {lesson.characters.map((char, charIdx) => (
                        <div
                          key={charIdx}
                          className="p-4 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col items-center text-center group"
                        >
                          <div className="text-3xl sm:text-4xl font-black text-white mb-1 group-hover:scale-110 transition-transform">
                            {char.char}
                          </div>
                          <div className="text-xs font-mono font-bold text-cyan-400 mb-1">
                            {char.romaji} {char.ipa ? `[${char.ipa}]` : ''}
                          </div>
                          {char.mnemonic && (
                            <div className="text-[11px] text-amber-300/90 italic mb-2">
                              💡 {char.mnemonic}
                            </div>
                          )}
                          {char.sampleWord && (
                            <div className="text-[11px] text-slate-300 bg-white/5 rounded-lg px-2 py-1 w-full mt-auto">
                              <span className="font-bold text-white">{char.sampleWord.word}</span>
                              <span className="block text-[10px] text-slate-400">{char.sampleWord.translation}</span>
                            </div>
                          )}
                          <button
                            onClick={() => speak(char.audioText || char.char, language.speechCode)}
                            className="mt-2 p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                            title="Listen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'phonetics' && pronunciationTrack ? (
        <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Phonetics Lab
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {pronunciationTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {pronunciationTrack.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pronunciationTrack.keyPhonemes.map((phoneme) => (
              <div key={phoneme.id} className="bg-slate-950/60 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                    {phoneme.soundIpa}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{phoneme.soundName}</span>
                </div>

                <h3 className="text-base font-bold text-white">{phoneme.title}</h3>
                <p className="text-xs text-slate-300">{phoneme.description}</p>

                {phoneme.mouthPositionTip && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                    <span className="font-bold">Mouth & Articulation: </span>
                    {phoneme.mouthPositionTip}
                  </div>
                )}

                {phoneme.minimalPairs && phoneme.minimalPairs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">Minimal Distinction Pairs</div>
                    {phoneme.minimalPairs.map((pair, pIdx) => (
                      <div key={pIdx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 font-mono">
                        <span className="text-cyan-300 font-bold">{pair.wordA} <span className="text-slate-400 font-normal">({pair.meaningA})</span></span>
                        <span className="text-slate-500">vs</span>
                        <span className="text-emerald-300 font-bold">{pair.wordB} <span className="text-slate-400 font-normal">({pair.meaningB})</span></span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  {phoneme.sampleWords.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => speak(sample.word, language.speechCode)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold">{sample.word}</span>
                      <span className="text-slate-400">({sample.translation})</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
};
