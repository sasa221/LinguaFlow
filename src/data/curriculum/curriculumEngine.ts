import {
  CurriculumUnit,
  CurriculumLesson,
  LearnerCurriculumProgress,
  SkillMasteryItem,
  SavedWord,
  CanDoEvidenceItem,
  CurriculumAuditReport,
} from '../../types';
import { getCurriculumForLanguage } from './curriculumData';
import { validateCurriculumTree, generateDeterministicDailySession, runFirst10MinutesTest } from './curriculumValidator';

const PROGRESS_STORAGE_PREFIX = 'linguaflow_curriculum_progress_';

export function getInitialCurriculumProgress(languageId: string): LearnerCurriculumProgress {
  const units = getCurriculumForLanguage(languageId);
  const firstUnit = units[0];
  const firstLesson = firstUnit?.lessons[0];

  return {
    languageId,
    currentUnitId: firstUnit?.id || 'es-u1',
    currentLessonId: firstLesson?.id || 'es-u1-l1',
    completedLessonIds: [],
    unlockedUnitIds: firstUnit ? [firstUnit.id] : ['es-u1'],
    completedUnitIds: [],
    masteredGoalIds: [],
    knownVocabularyIds: [],
    knownGrammarIds: [],
    skillMastery: {},
    canDoEvidence: {},
    unitScores: {},
    lastStudiedAt: Date.now(),
  };
}

export function loadCurriculumProgress(languageId: string): LearnerCurriculumProgress {
  try {
    const raw = localStorage.getItem(`${PROGRESS_STORAGE_PREFIX}${languageId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...getInitialCurriculumProgress(languageId),
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to load curriculum progress', e);
  }
  return getInitialCurriculumProgress(languageId);
}

export function saveCurriculumProgress(progress: LearnerCurriculumProgress): void {
  try {
    localStorage.setItem(
      `${PROGRESS_STORAGE_PREFIX}${progress.languageId}`,
      JSON.stringify(progress)
    );
  } catch (e) {
    console.error('Failed to save curriculum progress', e);
  }
}

/**
 * Returns the current unit, current lesson, and next recommended action.
 */
export function getNextCurriculumStep(
  languageId: string,
  progress: LearnerCurriculumProgress
): {
  unit: CurriculumUnit;
  lesson: CurriculumLesson;
  isMilestone: boolean;
  canDoCount: { mastered: number; total: number };
} {
  const units = getCurriculumForLanguage(languageId);
  
  // Find current unit
  let unit = units.find((u) => u.id === progress.currentUnitId) || units[0];
  
  // Check if current unit's lessons are all done
  const allUnitLessonsDone = unit.lessons.every((l) =>
    progress.completedLessonIds.includes(l.id)
  );

  let lesson: CurriculumLesson | undefined;
  if (!allUnitLessonsDone) {
    lesson = unit.lessons.find((l) => !progress.completedLessonIds.includes(l.id));
  }

  if (!lesson) {
    // If all lessons in current unit are done, either do milestone or move to next unit
    const currentUnitIndex = units.findIndex((u) => u.id === unit.id);
    if (currentUnitIndex < units.length - 1) {
      const nextUnit = units[currentUnitIndex + 1];
      unit = nextUnit;
      lesson = nextUnit.lessons[0];
    } else {
      lesson = unit.lessons[unit.lessons.length - 1];
    }
  }

  // Calculate total Can-Do statements
  let totalGoals = 0;
  let masteredGoals = 0;
  units.forEach((u) => {
    u.communicationGoals.forEach((g) => {
      totalGoals += 1;
      if (progress.masteredGoalIds.includes(g.id)) {
        masteredGoals += 1;
      }
    });
  });

  return {
    unit,
    lesson,
    isMilestone: allUnitLessonsDone,
    canDoCount: { mastered: masteredGoals, total: totalGoals },
  };
}

/**
 * Updates learner progress after completing a lesson, recalculating unit unlocks and skill mastery.
 */
export function recordLessonCompletion(
  currentProgress: LearnerCurriculumProgress,
  unit: CurriculumUnit,
  lesson: CurriculumLesson,
  lessonPerformance: {
    accuracy: number;
    testedWords: Array<{ id: string; word: string; translation: string; correct: boolean }>;
    spokenPhrases?: string[];
    hintLevelUsed?: number; // 0 = unprompted, 1 = slight hint, 2 = partial hint, 3 = full answer
    spontaneousRecall?: boolean;
  }
): { updatedProgress: LearnerCurriculumProgress; newWordsToSave: SavedWord[] } {
  const hintLevel = lessonPerformance.hintLevelUsed ?? 0;
  const spontaneous = lessonPerformance.spontaneousRecall ?? (hintLevel === 0);

  const progress: LearnerCurriculumProgress = {
    ...currentProgress,
    completedLessonIds: Array.from(
      new Set([...currentProgress.completedLessonIds, lesson.id])
    ),
    lastStudiedAt: Date.now(),
  };

  // Add lesson vocabulary to knownVocabularyIds
  const newVocabIds = lesson.vocabulary.map((v) => v.id);
  progress.knownVocabularyIds = Array.from(
    new Set([...progress.knownVocabularyIds, ...newVocabIds])
  );

  // Add grammar targets to knownGrammarIds
  if (lesson.grammar) {
    const newGrammarIds = lesson.grammar.map((g) => g.id);
    progress.knownGrammarIds = Array.from(
      new Set([...progress.knownGrammarIds, ...newGrammarIds])
    );
  }

  // Update skill mastery for each word tested
  const newSkillMastery = { ...progress.skillMastery };
  const wordsToEnrollInSRS: SavedWord[] = [];

  lesson.vocabulary.forEach((v) => {
    const existing: SkillMasteryItem = newSkillMastery[v.id] || {
      id: v.id,
      type: 'vocab',
      target: v.word,
      recognition: 60,
      recall: 40,
      listening: 50,
      speaking: 40,
      contextualUse: 30,
      lastPracticed: Date.now(),
      strength: 'learning',
      hintDependencyScore: hintLevel * 25,
    };

    const tested = lessonPerformance.testedWords.find((w) => w.id === v.id);
    if (tested) {
      if (tested.correct) {
        const recallBoost = hintLevel === 0 ? 25 : hintLevel === 1 ? 15 : 8;
        existing.recognition = Math.min(100, existing.recognition + 25);
        existing.recall = Math.min(100, existing.recall + recallBoost);
        existing.listening = Math.min(100, existing.listening + 20);
        existing.speaking = Math.min(100, existing.speaking + 20);
      } else {
        existing.recall = Math.max(20, existing.recall - 10);
      }
    }

    // Update hint dependency score
    existing.hintDependencyScore = Math.round(
      ((existing.hintDependencyScore || 0) * 0.7) + (hintLevel * 25 * 0.3)
    );

    const avg =
      (existing.recognition +
        existing.recall +
        existing.listening +
        existing.speaking) /
      4;
    existing.strength = avg >= 80 && (existing.hintDependencyScore || 0) <= 25
      ? 'mastered'
      : avg >= 50
      ? 'developing'
      : 'learning';
    existing.lastPracticed = Date.now();
    newSkillMastery[v.id] = existing;

    // Create automatic SRS enroll word object
    wordsToEnrollInSRS.push({
      id: `course_${v.id}`,
      word: v.word,
      translation: v.translation,
      language: currentProgress.languageId,
      definition: v.tip || `Core curriculum vocabulary from ${unit.title}`,
      contextSentence: v.contextSentence,
      dateAdded: Date.now(),
      masteryLevel: tested?.correct && hintLevel <= 1 ? 1 : 0,
      intervalDays: tested?.correct && hintLevel === 0 ? 1 : 0,
      easeFactor: 2.5,
      nextReviewDate: Date.now() + (tested?.correct && hintLevel === 0 ? 86400000 : 3600000), // 24h or 1h
    });
  });

  progress.skillMastery = newSkillMastery;

  // Record Can-Do Evidence
  const updatedEvidence = { ...(progress.canDoEvidence || {}) };
  unit.communicationGoals.forEach((g) => {
    updatedEvidence[g.id] = {
      goalId: g.id,
      mastered: lessonPerformance.accuracy >= 70 && hintLevel <= 1,
      spontaneousRecall: spontaneous,
      hintLevel: hintLevel,
      speechAccuracy: lessonPerformance.accuracy,
      demonstratedAt: Date.now(),
      context: `Completed Lesson: ${lesson.title}`,
    };
  });
  progress.canDoEvidence = updatedEvidence;

  // Check if all lessons of the unit are completed
  const allUnitLessonsDone = unit.lessons.every((l) =>
    progress.completedLessonIds.includes(l.id)
  );

  if (allUnitLessonsDone) {
    if (!progress.completedUnitIds.includes(unit.id)) {
      progress.completedUnitIds = [...progress.completedUnitIds, unit.id];
    }
    // Master unit communication goals
    unit.communicationGoals.forEach((g) => {
      if (!progress.masteredGoalIds.includes(g.id)) {
        progress.masteredGoalIds = [...progress.masteredGoalIds, g.id];
      }
    });

    // Unlock next unit in sequence
    const units = getCurriculumForLanguage(currentProgress.languageId);
    const currIdx = units.findIndex((u) => u.id === unit.id);
    if (currIdx < units.length - 1) {
      const nextUnit = units[currIdx + 1];
      if (!progress.unlockedUnitIds.includes(nextUnit.id)) {
        progress.unlockedUnitIds = [...progress.unlockedUnitIds, nextUnit.id];
      }
      progress.currentUnitId = nextUnit.id;
      progress.currentLessonId = nextUnit.lessons[0].id;
    }
  }

  saveCurriculumProgress(progress);
  return { updatedProgress: progress, newWordsToSave: wordsToEnrollInSRS };
}

/**
 * Audit curriculum data statically for pedagogical soundness.
 */
export function auditCurriculum(languageId: string): CurriculumAuditReport {
  const units = getCurriculumForLanguage(languageId);
  return validateCurriculumTree(languageId, units);
}

export { generateDeterministicDailySession, runFirst10MinutesTest };


/**
 * Checks if a unit is unlocked.
 */
export function isUnitUnlocked(
  unitId: string,
  progress: LearnerCurriculumProgress
): boolean {
  return progress.unlockedUnitIds.includes(unitId);
}

/**
 * Returns summary statistics for Can-Do competencies and mastery.
 */
export function getCanDoMasteryReport(
  languageId: string,
  progress: LearnerCurriculumProgress
): {
  mastered: Array<{ id: string; title: string; canDoStatement: string; unitTitle: string }>;
  inProgress: Array<{ id: string; title: string; canDoStatement: string; unitTitle: string }>;
  locked: Array<{ id: string; title: string; canDoStatement: string; unitTitle: string }>;
} {
  const units = getCurriculumForLanguage(languageId);
  const mastered: Array<{ id: string; title: string; canDoStatement: string; unitTitle: string }> = [];
  const inProgress: Array<{ id: string; title: string; canDoStatement: string; unitTitle: string }> = [];
  const locked: Array<{ id: string; title: string; canDoStatement: string; unitTitle: string }> = [];

  units.forEach((u) => {
    const isUnlocked = progress.unlockedUnitIds.includes(u.id);
    const isCompleted = progress.completedUnitIds.includes(u.id);

    u.communicationGoals.forEach((g) => {
      if (progress.masteredGoalIds.includes(g.id) || isCompleted) {
        mastered.push({
          id: g.id,
          title: g.title,
          canDoStatement: g.canDoStatement,
          unitTitle: u.title,
        });
      } else if (isUnlocked) {
        inProgress.push({
          id: g.id,
          title: g.title,
          canDoStatement: g.canDoStatement,
          unitTitle: u.title,
        });
      } else {
        locked.push({
          id: g.id,
          title: g.title,
          canDoStatement: g.canDoStatement,
          unitTitle: u.title,
        });
      }
    });
  });

  return { mastered, inProgress, locked };
}
