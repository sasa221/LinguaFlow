import React from 'react';
import {
  Play,
  Flame,
  Zap,
  Target,
  Sparkles,
  MessageSquare,
  BookOpen,
  Mic,
  ArrowRight,
  Clock,
  Lightbulb,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Utensils,
  Building2,
  Briefcase,
  ShoppingBag,
} from 'lucide-react';
import {
  Language,
  NativeLanguage,
  ProficiencyLevel,
  SavedWord,
  Scenario,
  UserProgress,
  NavigationTab,
  LearnerCurriculumProgress,
  CurriculumUnit,
  CurriculumLesson,
} from '../types';
import { SCENARIOS, getDefaultScenarioForLanguageAndLevel, buildPracticeScenario } from '../data/scenarios';
import { getNextCurriculumStep, getCanDoMasteryReport } from '../data/curriculum/curriculumEngine';

interface HomeDashboardProps {
  currentLanguage: Language;
  nativeLanguage: NativeLanguage;
  currentLevel: ProficiencyLevel;
  progress: UserProgress;
  savedWords: SavedWord[];
  currentScenario: Scenario;
  hasExplicitlySelectedScenario?: boolean;
  curriculumProgress?: LearnerCurriculumProgress;
  onNavigate: (tab: NavigationTab) => void;
  onStartLiveVoice: (scenario?: Scenario) => void;
  onStartRoleplay: (scenario: Scenario) => void;
  onStartPronunciationLab: (phrase?: string) => void;
  onStartVocabReview: () => void;
  onStartDrills: (topic?: string) => void;
  onStartCurriculumLesson?: (unit: CurriculumUnit, lesson: CurriculumLesson) => void;
}

interface QuickTemplate {
  id: string;
  label: string;
  labelNative: string;
  icon: any;
  category: string;
  color: string;
  borderHover: string;
  defaultTitleMatch: string[];
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'intro',
    label: 'Introduce Myself',
    labelNative: 'التعريف بالنفس والتحية',
    icon: Sparkles,
    category: 'Daily Life',
    color: 'from-amber-400 to-orange-500 text-amber-300',
    borderHover: 'hover:border-amber-400/60 hover:shadow-amber-500/20',
    defaultTitleMatch: ['starter', 'greetings', 'first words', 'hallo', 'ciao', 'konnichiwa', 'ahlan', 'olá', 'privet'],
  },
  {
    id: 'order_food',
    label: 'Order Food & Drink',
    labelNative: 'طلب الطعام والقهوة',
    icon: Utensils,
    category: 'Dining',
    color: 'from-rose-400 to-red-500 text-rose-300',
    borderHover: 'hover:border-rose-400/60 hover:shadow-rose-500/20',
    defaultTitleMatch: ['tapas', 'café', 'cafe', 'restaurant', 'bakery', 'gelato', 'izakaya', 'coffee', 'market', 'bbq', 'food'],
  },
  {
    id: 'travel_hotel',
    label: 'Hotel & Directions',
    labelNative: 'الفندق والتنقل',
    icon: Building2,
    category: 'Travel',
    color: 'from-cyan-400 to-blue-500 text-cyan-300',
    borderHover: 'hover:border-cyan-400/60 hover:shadow-cyan-500/20',
    defaultTitleMatch: ['hotel', 'metro', 'lost', 'airport', 'taxi', 'travel', 'directions', 'train'],
  },
  {
    id: 'job_interview',
    label: 'Career & Interview',
    labelNative: 'مقابلة عمل مهنية',
    icon: Briefcase,
    category: 'Career',
    color: 'from-emerald-400 to-teal-500 text-emerald-300',
    borderHover: 'hover:border-emerald-400/60 hover:shadow-emerald-500/20',
    defaultTitleMatch: ['interview', 'tech', 'startup', 'career', 'job', 'team'],
  },
  {
    id: 'shopping',
    label: 'Shopping & Market',
    labelNative: 'التسوق والدفع',
    icon: ShoppingBag,
    category: 'Shopping',
    color: 'from-purple-400 to-pink-500 text-purple-300',
    borderHover: 'hover:border-purple-400/60 hover:shadow-purple-500/20',
    defaultTitleMatch: ['bakery', 'market', 'shopping', 'gelato', 'store', 'mall'],
  },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  currentLanguage,
  nativeLanguage,
  currentLevel,
  progress,
  savedWords,
  currentScenario,
  hasExplicitlySelectedScenario = false,
  curriculumProgress,
  onNavigate,
  onStartLiveVoice,
  onStartRoleplay,
  onStartPronunciationLab,
  onStartVocabReview,
  onStartDrills,
  onStartCurriculumLesson,
}) => {
  const goalPercent = Math.min(
    100,
    Math.round((progress.minutesPracticedToday / (progress.dailyGoalMinutes || 15)) * 100)
  );

  const now = Date.now();
  const wordsDueForReview = savedWords.filter(
    (w) => !w.nextReviewDate || w.nextReviewDate <= now || !w.lastReviewedDate
  );

  const activeWeaknesses = (progress.weaknesses || []).filter(
    (w) => w.status === 'needs_attention' || w.status === 'improving'
  );

  // Curriculum progress calculation
  const currProgress =
    curriculumProgress || {
      languageId: currentLanguage.id,
      currentUnitId: 'es-u1',
      currentLessonId: 'es-u1-l1',
      completedLessonIds: [],
      unlockedUnitIds: ['es-u1'],
      completedUnitIds: [],
      masteredGoalIds: [],
      knownVocabularyIds: [],
      knownGrammarIds: [],
      skillMastery: {},
      unitScores: {},
      lastStudiedAt: Date.now(),
    };

  const nextCurriculum = getNextCurriculumStep(currentLanguage.id, currProgress);
  const canDoReport = getCanDoMasteryReport(currentLanguage.id, currProgress);

  const getScenarioForTemplate = (template: QuickTemplate): Scenario => {
    const list = SCENARIOS[currentLanguage.id] || [];
    
    for (const kw of template.defaultTitleMatch) {
      const match = list.find(
        (s) =>
          s.id.toLowerCase().includes(kw) ||
          s.title.toLowerCase().includes(kw) ||
          s.category.toLowerCase().includes(kw)
      );
      if (match) return match;
    }

    const catMatch = list.find((s) => s.category.toLowerCase() === template.category.toLowerCase());
    if (catMatch) return catMatch;

    return buildPracticeScenario(currentLanguage, currentLevel, template.category, template.id);
  };

  const getSmartRecommendation = () => {
    if (wordsDueForReview.length > 0) {
      return {
        title: `Review ${wordsDueForReview.length} Due Vocabulary ${wordsDueForReview.length === 1 ? 'Word' : 'Words'}`,
        reason: `Spaced repetition algorithm scheduled ${wordsDueForReview.length} items for review today to lock them into long-term memory.`,
        actionLabel: 'Review Flashcards',
        type: 'vocab',
        onClick: () => {
          onNavigate('vocab');
          onStartVocabReview();
        },
        badge: 'Memory Retention',
        badgeColor: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
        icon: BookOpen,
      };
    }

    if (activeWeaknesses.length > 0) {
      const topWeakness = activeWeaknesses[0];
      return {
        title: `Targeted Drill: ${topWeakness.topic}`,
        reason: topWeakness.evidence
          ? `You encountered difficulty with "${topWeakness.evidence}" in a recent conversation.`
          : `Identified by post-session analysis as a focus area for level ${currentLevel}.`,
        actionLabel: 'Start Targeted Drill',
        type: 'drill',
        onClick: () => {
          onNavigate('drills');
          onStartDrills(topWeakness.topic);
        },
        badge: 'Gap Recovery',
        badgeColor: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        icon: Target,
      };
    }

    if (progress.conversationsCompleted > 0) {
      return {
        title: `Immersive Conversation: ${currentScenario.title}`,
        reason: `Build spontaneous speech reflexes at ${currentLevel} level in setting: "${currentScenario.setting}".`,
        actionLabel: 'Start Live Voice Call',
        type: 'live',
        onClick: () => onStartLiveVoice(currentScenario),
        badge: 'Fluency Workout',
        badgeColor: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
        icon: Mic,
      };
    }

    return {
      title: `First Conversation: ${currentScenario.title}`,
      reason: `Start a quick introductory dialogue in ${currentLanguage.name} so LinguaFlow can calibrate to your speaking level.`,
      actionLabel: 'Begin First Session',
      type: 'live',
      onClick: () => onStartLiveVoice(currentScenario),
      badge: 'Starter Calibration',
      badgeColor: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
      icon: Sparkles,
    };
  };

  const smartRec = getSmartRecommendation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300 text-slate-100">
      
      {/* 1. COMPACT HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a1428] to-[#050b14] border border-cyan-500/30 p-5 sm:p-7 md:p-8 shadow-2xl shadow-cyan-950/30">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Main Hero Copy & Action CTAs */}
          <div className="lg:col-span-8 space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONTINUE YOUR COURSE • {currentLanguage.name.toUpperCase()} {currentLevel}</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Unit {nextCurriculum.unit.order}: {nextCurriculum.unit.title}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-sm sm:text-base font-semibold text-cyan-200 flex-wrap">
                <span>Lesson {nextCurriculum.lesson.order}: {nextCurriculum.lesson.title}</span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  ~{nextCurriculum.lesson.estimatedMinutes} min
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                Objective: {nextCurriculum.lesson.objective}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => {
                  if (onStartCurriculumLesson) {
                    onStartCurriculumLesson(nextCurriculum.unit, nextCurriculum.lesson);
                  } else {
                    onNavigate('learn');
                  }
                }}
                className="group flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-black text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="p-1 rounded-lg bg-black/20 text-black">
                  <Play className="w-3.5 h-3.5 fill-black" />
                </div>
                <span>Start Lesson ({nextCurriculum.lesson.title})</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('learn')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>View Full Roadmap</span>
              </button>

              <button
                onClick={() => onStartLiveVoice(currentScenario)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors"
              >
                <Mic className="w-4 h-4 text-teal-400" />
                <span>Practice Scenario</span>
              </button>
            </div>

            {/* Scenario attribution */}
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5 flex-wrap">
              <span className="font-semibold text-slate-300">
                {hasExplicitlySelectedScenario ? 'Selected Scenario:' : `Recommended for ${currentLevel}:`}
              </span>
              <span className="font-medium text-cyan-300">
                {currentScenario.title}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Partner: {currentScenario.partnerRole}</span>
            </div>
          </div>

          {/* Today's Goal Ring & Can-Do Competencies Card */}
          <div className="lg:col-span-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Can-Do Competencies
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {canDoReport.mastered.length} Mastered
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {canDoReport.mastered.length > 0 ? (
                canDoReport.mastered.slice(0, 2).map((c) => (
                  <div key={c.id} className="flex items-start gap-2 text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{c.canDoStatement}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-xs italic">
                  Complete your first lesson to unlock Can-Do statements!
                </div>
              )}
              {canDoReport.inProgress.slice(0, 1).map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-slate-300">
                  <div className="w-3.5 h-3.5 rounded-full border border-cyan-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{c.canDoStatement}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Next Milestone</span>
              <span className="text-cyan-300 font-bold">Unit {nextCurriculum.unit.order} Challenge</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. QUICK START PRACTICE WORKOUTS (Clean Responsive Grid Layout - No Raw Scrollbar) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              1-Click Immersion Workouts
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Targeted in {currentLanguage.name}
          </span>
        </div>

        {/* Responsive Grid across viewports */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {QUICK_TEMPLATES.map((tpl) => {
            const Icon = tpl.icon;
            const targetScenario = getScenarioForTemplate(tpl);

            return (
              <div
                key={tpl.id}
                className={`group flex flex-col justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-all duration-200 shadow-md ${tpl.borderHover}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className={`p-2 rounded-xl bg-black/40 ${tpl.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 px-1.5 py-0.5 rounded bg-white/5">
                      {tpl.category}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {tpl.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {tpl.labelNative}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 pt-3 mt-2 border-t border-white/5">
                  <button
                    onClick={() => onStartRoleplay(targetScenario)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 text-[10px] font-bold text-center border border-white/5 transition-all cursor-pointer"
                    title={`Start text roleplay: ${targetScenario.title}`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => onStartLiveVoice(targetScenario)}
                    className="p-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-400 text-cyan-400 hover:text-black border border-cyan-500/20 transition-all cursor-pointer"
                    title={`Start live voice: ${targetScenario.title}`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DYNAMIC SMART RECOMMENDATION & QUICK SHORTCUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recommended Activity Card */}
        <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <smartRec.icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                  INTELLIGENT RECOMMENDATION
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">{smartRec.title}</h3>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${smartRec.badgeColor}`}>
              {smartRec.badge}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 rounded-2xl p-3 border border-white/5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 inline mr-1.5" />
            {smartRec.reason}
          </p>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Est. time: 4-6 minutes</span>
            </div>

            <button
              onClick={smartRec.onClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider transition-all hover:scale-[1.02] cursor-pointer shadow-md"
            >
              <span>{smartRec.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Practice Modes */}
        <div className="lg:col-span-5 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Practice Modes
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">CORE TOOLS</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onStartLiveVoice()}
              className="flex flex-col items-start p-3 rounded-2xl bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                Free Talk
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Spoken flow</span>
            </button>

            <button
              onClick={() => {
                onNavigate('vocab');
                onStartVocabReview();
              }}
              className="flex flex-col items-start p-3 rounded-2xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-purple-300">
                SRS Review
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {savedWords.length} saved words
              </span>
            </button>

            <button
              onClick={() => {
                onNavigate('pronunciation');
                onStartPronunciationLab();
              }}
              className="flex flex-col items-start p-3 rounded-2xl bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Target className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                Accent Lab
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Phonetic clarity</span>
            </button>

            <button
              onClick={() => onNavigate('tutor')}
              className="flex flex-col items-start p-3 rounded-2xl bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-amber-300">
                AI Coach
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Personal guidance</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. RECENT LEARNING & WEAKNESS RECOVERY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recently Saved Vocabulary */}
        <div className="lg:col-span-6 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Recently Saved Vocabulary</h3>
            </div>
            <button
              onClick={() => onNavigate('vocab')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              View Notebook ({savedWords.length}) →
            </button>
          </div>

          {savedWords.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400 space-y-1.5">
              <BookOpen className="w-5 h-5 text-slate-500 mx-auto" />
              <p className="text-slate-300 font-medium">Your notebook is ready.</p>
              <p className="text-[11px] text-slate-400">
                Tap or save unfamiliar words during conversations to review them with spaced repetition.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedWords.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{w.word}</div>
                    <div className="text-[11px] text-slate-400">{w.translation}</div>
                    {w.contextSentence && (
                      <div className="text-[10px] text-slate-400 italic truncate max-w-xs mt-0.5">
                        "{w.contextSentence}"
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                      SRS Level {w.masteryLevel || 0}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Focus & Weakness Tracking */}
        <div className="lg:col-span-6 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Focus & Improvement Areas</h3>
            </div>
            {activeWeaknesses.length > 0 && (
              <button
                onClick={() => onStartDrills()}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Practice Drills →
              </button>
            )}
          </div>

          {activeWeaknesses.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-slate-400 space-y-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
              <p className="text-slate-200 font-medium">No active grammar gaps detected.</p>
              <p className="text-[11px] text-slate-400">
                Complete roleplay dialogues and live voice sessions to identify personalized grammar and pronunciation focus areas.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeWeaknesses.slice(0, 3).map((weakness) => (
                <div
                  key={weakness.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <div className="text-xs font-bold text-white truncate">{weakness.topic}</div>
                    {weakness.explanation && (
                      <div className="text-[11px] text-slate-400 line-clamp-1">{weakness.explanation}</div>
                    )}
                    {weakness.evidence && (
                      <div className="text-[10px] text-red-300/80 italic">Said: "{weakness.evidence}"</div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('drills');
                      onStartDrills(weakness.topic);
                    }}
                    className="text-[10px] font-mono font-bold text-amber-300 px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 whitespace-nowrap cursor-pointer"
                  >
                    Drill Topic
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
