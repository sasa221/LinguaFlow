import React from 'react';
import {
  BarChart3,
  Flame,
  Zap,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  Language,
  NativeLanguage,
  ProficiencyLevel,
  SavedWord,
  UserProgress,
  NavigationTab,
} from '../types';

interface ProgressAnalyticsProps {
  currentLanguage: Language;
  nativeLanguage: NativeLanguage;
  currentLevel: ProficiencyLevel;
  progress: UserProgress;
  savedWords: SavedWord[];
  onNavigate: (tab: NavigationTab) => void;
  onStartDrills: (topic?: string) => void;
  onOpenPreferences: () => void;
}

export const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({
  currentLanguage,
  currentLevel,
  progress,
  savedWords,
  onNavigate,
  onStartDrills,
  onOpenPreferences,
}) => {
  const dailyGoalMinutes = progress.dailyGoalMinutes || 15;
  const todayMinutes = progress.todayPracticeMinutes || 0;
  const goalPercentage = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

  const srsMasteryCounts = {
    new: savedWords.filter((w) => (w.masteryLevel || 0) <= 1).length,
    learning: savedWords.filter((w) => (w.masteryLevel || 0) === 2 || (w.masteryLevel || 0) === 3).length,
    mastered: savedWords.filter((w) => (w.masteryLevel || 0) >= 4).length,
  };

  const activeWeaknesses = (progress.weaknessTopics || []).filter((w) => !w.resolved);

  const cefrLevels: ProficiencyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const currentLevelIndex = cefrLevels.indexOf(currentLevel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Fluency Analytics & Progress</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Learning Trajectory in {currentLanguage.name} {currentLanguage.flag}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics on immersion time, CEFR milestones, and vocabulary retention
          </p>
        </div>

        <button
          onClick={onOpenPreferences}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          Calibrate Goals & Level
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Goal */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">Daily Immersion</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{todayMinutes}</span>
            <span className="text-xs text-slate-400 font-mono">/ {dailyGoalMinutes} mins</span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex justify-between pt-1">
            <span>{goalPercentage}% reached</span>
            <span>{Math.max(0, dailyGoalMinutes - todayMinutes)}m left</span>
          </div>
        </div>

        {/* Streak */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">Active Streak</span>
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-400">{progress.streakDays}</span>
            <span className="text-xs text-slate-400 font-mono">days</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            {progress.streakDays > 0
              ? 'Consistency builds long-term neural language pathways.'
              : 'Complete a workout today to start your active streak!'}
          </p>
        </div>

        {/* Total XP */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">Experience Points</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{progress.xp}</span>
            <span className="text-xs text-slate-400 font-mono">XP</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            Earned from live voice roleplays, vocabulary inspections, and grammar drills.
          </p>
        </div>

        {/* Total Words Saved */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 font-bold uppercase">SRS Vocabulary</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{savedWords.length}</span>
            <span className="text-xs text-slate-400 font-mono">words</span>
          </div>
          <p className="text-[11px] text-slate-400 pt-2">
            {srsMasteryCounts.mastered} mastered • {srsMasteryCounts.learning} learning • {srsMasteryCounts.new} new
          </p>
        </div>

      </div>

      {/* CEFR Immersion Pathway */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <span>CEFR Fluency Progression</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Current calibrated target: <span className="text-cyan-300 font-mono font-bold">{currentLevel}</span>
            </p>
          </div>
          <button
            onClick={onOpenPreferences}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Re-test / Change Level →
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 pt-2">
          {cefrLevels.map((lvl, index) => {
            const isPassed = index < currentLevelIndex;
            const isCurrent = index === currentLevelIndex;
            return (
              <div
                key={lvl}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : isPassed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/5 text-slate-500'
                }`}
              >
                <div className="text-lg font-black font-mono">{lvl}</div>
                <div className="text-[10px] uppercase tracking-wider font-bold mt-0.5">
                  {isCurrent ? 'Current' : isPassed ? 'Passed' : 'Upcoming'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocabulary Retention & Weaknesses Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vocabulary SRS Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>SRS Memory Retention Distribution</span>
            </h2>
            <button
              onClick={() => onNavigate('vocab')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Open Notebook →
            </button>
          </div>

          {savedWords.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <BookOpen className="w-6 h-6 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-medium">No saved flashcards yet.</p>
              <p className="text-[11px] text-slate-400">
                During live dialogues, tap on words to explain and save them to your spaced-repetition deck.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">Mastered (Level 4-5)</span>
                <span className="font-mono text-slate-300">{srsMasteryCounts.mastered} words</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${(srsMasteryCounts.mastered / savedWords.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-cyan-400 font-semibold">Learning (Level 2-3)</span>
                <span className="font-mono text-slate-300">{srsMasteryCounts.learning} words</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${(srsMasteryCounts.learning / savedWords.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-amber-400 font-semibold">New Additions (Level 0-1)</span>
                <span className="font-mono text-slate-300">{srsMasteryCounts.new} words</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${(srsMasteryCounts.new / savedWords.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Grammar & Fluency Weakness Recovery */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Identified Grammar & Pronunciation Gaps</span>
            </h2>
            {activeWeaknesses.length > 0 && (
              <button
                onClick={() => onStartDrills()}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Drill All →
              </button>
            )}
          </div>

          {activeWeaknesses.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-slate-200 font-medium">No lingering grammatical weaknesses detected.</p>
              <p className="text-[11px] text-slate-400">
                Any errors made during speech and roleplay sessions will automatically appear here with generated targeted drills.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeWeaknesses.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{w.topic}</div>
                    {w.explanation && (
                      <div className="text-[11px] text-slate-400 line-clamp-1">{w.explanation}</div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('drills');
                      onStartDrills(w.topic);
                    }}
                    className="text-[10px] font-mono font-bold text-amber-300 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 whitespace-nowrap cursor-pointer"
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
