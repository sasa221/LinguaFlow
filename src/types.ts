export type ProficiencyLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type AppBootState = 'initializing' | 'needs_onboarding' | 'ready';

export type AuthState = 'initializing' | 'anonymous' | 'authenticated' | 'error';

export interface AuthUser {
  uid: string;
  isAnonymous: boolean;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface LearnerProfile {
  userId: string;
  hasCompletedOnboarding: boolean;
  targetLanguageId: string;
  nativeLanguageId: string;
  level: ProficiencyLevel;
  selectedVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  playbackSpeed: number;
  dailyGoalMinutes: number;
  createdAt: number;
  updatedAt: number;
}

export type NavigationTab =
  | 'home'
  | 'learn'
  | 'live'
  | 'scenarios'
  | 'practice'
  | 'pronunciation'
  | 'vocab'
  | 'drills'
  | 'tutor'
  | 'progress';

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  greeting: string;
  heroTitle: string;
  romanizedGreeting?: string;
  locale: string;
  speechCode: string;
  direction: 'ltr' | 'rtl';
  defaultVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
}

export interface NativeLanguage {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dialect?: string;
  direction: 'ltr' | 'rtl';
}

// -------------------------------------------------------------
// CURRICULUM ENGINE TYPES
// -------------------------------------------------------------

export interface VocabularyTarget {
  id: string;
  word: string;
  translation: string;
  partOfSpeech?: string;
  romanization?: string;
  contextSentence?: string;
  contextSentenceTranslation?: string;
  tip?: string;
}

export interface GrammarTarget {
  id: string;
  title: string;
  pattern: string;
  microExplanation: string;
  examples: Array<{ target: string; translation: string }>;
  commonMistake?: { wrong: string; correct: string; explanation: string };
}

export interface PronunciationTarget {
  id: string;
  sound: string;
  description: string;
  sampleWords: string[];
}

export interface CommunicationGoal {
  id: string;
  title: string;
  canDoStatement: string;
  scenarioHook?: {
    scenarioId?: string;
    title: string;
    role: string;
    partnerRole: string;
    setting: string;
    initialMessage: string;
    initialMessageTranslation: string;
  };
}

export type LessonStep =
  | {
      type: 'teach';
      id: string;
      title: string;
      item: VocabularyTarget | GrammarTarget;
      explanation?: string;
      audioText: string;
      tip?: string;
    }
  | {
      type: 'recognition';
      id: string;
      prompt: string;
      audioText?: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      type: 'listen';
      id: string;
      prompt: string;
      audioText: string;
      targetSentence: string;
      translation: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }
  | {
      type: 'speak';
      id: string;
      prompt: string;
      targetPhrase: string;
      translation: string;
      phoneticTip?: string;
    }
  | {
      type: 'build';
      id: string;
      prompt: string;
      availableWords: string[];
      targetWords: string[];
      targetSentence: string;
      translation: string;
      grammarTip?: string;
    }
  | {
      type: 'recall';
      id: string;
      prompt: string;
      targetAnswer: string;
      acceptableAnswers?: string[];
      hints: [string, string, string]; // Hint 1: first letter/clue, Hint 2: partial phrase, Hint 3: full phrase
      explanation: string;
    }
  | {
      type: 'mini_dialogue';
      id: string;
      scenarioContext: string;
      partnerRole: string;
      userRole: string;
      turns: Array<{
        aiPrompt: string;
        aiTranslation: string;
        suggestedResponse: string;
        suggestedTranslation: string;
        expectedKeywords: string[];
      }>;
    }
  | {
      type: 'review';
      id: string;
      prompt: string;
      reviewWordId: string;
      targetSentence: string;
      translation: string;
      options: string[];
      correctIndex: number;
    };

export type ContentReviewStatus =
  | 'draft'
  | 'ai_authored'
  | 'internally_reviewed'
  | 'native_review_required'
  | 'validated';

export interface CurriculumLesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  objective: string;
  contentReviewStatus?: ContentReviewStatus;
  vocabulary: VocabularyTarget[];
  grammar?: GrammarTarget[];
  pronunciation?: PronunciationTarget[];
  steps: LessonStep[];
  milestone?: boolean;
}

export interface CurriculumUnit {
  id: string;
  languageId: string;
  level: ProficiencyLevel;
  order: number;
  title: string;
  subtitle: string;
  icon: string;
  objective: string;
  validationStatus?: 'VALIDATED_A0' | 'BETA_CURRICULUM';
  contentReviewStatus?: ContentReviewStatus;
  vocabularyTargets: VocabularyTarget[];
  grammarTargets: GrammarTarget[];
  pronunciationTargets: PronunciationTarget[];
  communicationGoals: CommunicationGoal[];
  lessons: CurriculumLesson[];
  milestoneChallenge: {
    id: string;
    title: string;
    description: string;
    partnerRole: string;
    userRole: string;
    setting: string;
    requiredGoals: string[];
    initialMessage: string;
    initialMessageTranslation: string;
  };
}

export interface ScriptCharacter {
  char: string;
  romaji: string;
  ipa?: string;
  name?: string;
  audioText: string;
  strokeCount?: number;
  mnemonic?: string;
  sampleWord?: { word: string; translation: string; romanization?: string };
}

export interface ScriptLesson {
  id: string;
  title: string;
  description: string;
  characters: ScriptCharacter[];
}

export interface ScriptTrack {
  id: string;
  languageId: string;
  scriptName: string;
  nativeScriptName: string;
  description: string;
  stages: Array<{
    id: string;
    name: string;
    description: string;
    lessons: ScriptLesson[];
  }>;
}

export interface PronunciationLesson {
  id: string;
  title: string;
  soundIpa: string;
  soundName: string;
  description: string;
  mouthPositionTip: string;
  comparisonWithEnglish?: string;
  sampleWords: Array<{ word: string; translation: string; romanization?: string; tip?: string }>;
  minimalPairs?: Array<{ wordA: string; wordB: string; meaningA: string; meaningB: string }>;
}

export interface PronunciationTrack {
  id: string;
  languageId: string;
  title: string;
  overview: string;
  keyPhonemes: PronunciationLesson[];
}

export interface LanguageCurriculumDefinition {
  languageId: string;
  languageCode: string;
  languageName: string;
  curriculumVersion: string;
  qualityStatus: 'VALIDATED' | 'BETA' | 'DRAFT';
  levels: {
    A0?: { units: CurriculumUnit[]; levelCanDo: string[] };
    A1?: { units: CurriculumUnit[]; levelCanDo: string[] };
    A2?: { units: CurriculumUnit[]; levelCanDo: string[] };
    B1?: { units: CurriculumUnit[]; levelCanDo: string[] };
    B2?: { units: CurriculumUnit[]; levelCanDo: string[] };
  };
  scriptTrack?: ScriptTrack;
  pronunciationTrack: PronunciationTrack;
}

export interface CanDoEvidenceItem {
  goalId: string;
  mastered: boolean;
  spontaneousRecall: boolean;
  hintLevel: number; // 0 = unprompted, 1 = slight hint, 2 = partial hint, 3 = full answer
  speechAccuracy: number;
  unverifiedSpeechEvidence?: boolean;
  demonstratedAt: number;
  context: string;
}

export interface SkillMasteryItem {
  id: string;
  type: 'vocab' | 'grammar' | 'goal';
  target: string;
  recognition: number;
  recall: number;
  listening: number;
  speaking: number;
  contextualUse: number;
  lastPracticed: number;
  strength: 'learning' | 'developing' | 'mastered';
  hintDependencyScore?: number; // 0 (pure independent) to 100 (heavily reliant on hints)
}

export interface LearnerCurriculumProgress {
  languageId: string;
  currentUnitId: string;
  currentLessonId: string;
  completedLessonIds: string[];
  unlockedUnitIds: string[];
  completedUnitIds: string[];
  masteredGoalIds: string[];
  knownVocabularyIds: string[];
  knownGrammarIds: string[];
  skillMastery: Record<string, SkillMasteryItem>;
  canDoEvidence?: Record<string, CanDoEvidenceItem>;
  unitScores: Record<string, { accuracy: number; completedAt: number; turns: number }>;
  lastStudiedAt: number;
}

export interface CurriculumAuditIssue {
  severity: 'error' | 'warning' | 'info';
  type: 'missing_prerequisite' | 'duplicate_id' | 'script_barrier' | 'unnatural_progression' | 'cognitive_overload' | 'unintroduced_vocab';
  unitId: string;
  lessonId?: string;
  stepId?: string;
  message: string;
  suggestion?: string;
}

export interface CurriculumAuditReport {
  languageId: string;
  validationStatus: 'VALIDATED_A0' | 'BETA_CURRICULUM';
  totalUnits: number;
  totalLessons: number;
  totalVocabulary: number;
  totalCommunicationGoals: number;
  first10MinutesTestPassed: boolean;
  issues: CurriculumAuditIssue[];
  auditSummary: string;
}

export interface Scenario {
  id: string;
  title: string;
  category: 'Dining' | 'Travel' | 'Career' | 'Daily Life' | 'Shopping' | 'Health';
  role: string;
  partnerRole: string;
  setting: string;
  difficultyLevel: ProficiencyLevel;
  objectives: string[];
  initialMessage: string;
  initialMessageTranslation: string;
  initialMessageRomanization?: string;
  icon: string;
  suggestedReplies: Array<{
    text: string;
    translation: string;
  }>;
}

export interface SuggestedReply {
  text: string;
  translation: string;
}

export interface GrammarCorrection {
  hasMistake?: boolean;
  wrongWords?: Array<{
    word: string;
    correction: string;
    reason: string;
  }>;
  correctedText?: string;
  explanation?: string;
  accentTip?: string;
  grammarTip?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string;
  romanization?: string;
  timestamp: number;
  correction?: GrammarCorrection;
  suggestedReplies?: SuggestedReply[];
}

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  language: string;
  contextSentence?: string;
  scenarioTitle?: string;
  partOfSpeech?: string;
  romanization?: string;
  definition?: string;
  dateAdded: number;
  lastReviewedDate?: number;
  masteryLevel: number; // 0 to 5
  intervalDays?: number;
  easeFactor?: number;
  reviewCount?: number;
  nextReviewDate?: number;
}

export interface VocabularyReviewEvent {
  id: string;
  wordId: string;
  rating: 'again' | 'hard' | 'good' | 'easy';
  reviewedAt: string;
  previous: {
    masteryLevel: number;
    intervalDays: number;
    easeFactor: number;
  };
  next: {
    masteryLevel: number;
    intervalDays: number;
    easeFactor: number;
    nextReviewDate: number;
  };
}

export interface LearningIssue {
  id: string;
  languageId?: string;
  topic: string;
  explanation: string;
  evidence?: string;
  status: 'needs_attention' | 'improving' | 'mastered';
  lastPracticed?: number;
}

export interface UserProgress {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  minutesPracticedToday: number;
  dailyGoalMinutes: number;
  conversationsCompleted: number;
  totalSpokenSeconds: number;
  wordsSavedCount: number;
  weaknesses: LearningIssue[];
  activeDates?: string[];
  processedSessionIds?: string[];
  processedActivityIds?: string[];
  processedReviewEventIds?: string[];
  skillScores: {
    speaking: number;
    listening: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
  };
  weeklyActivity: Array<{
    day: string;
    minutes: number;
    xp: number;
  }>;
  recentActivities: Array<{
    id: string;
    title: string;
    date: string;
    xpEarned: number;
    score?: number;
  }>;
}

export interface TutorMemory {
  languageId?: string;
  goals: string;
  weaknesses: string[];
  strengths: string[];
  recentTopics: string[];
  savedWordsCount: number;
  preferredTone?: string;
  notes?: string;
}

export interface PronunciationResult {
  overallScore: number;
  score?: number;
  accuracyCategory?: string;
  feedback: string;
  feedbackMessage?: string;
  fluencyTip?: string;
  wordBreakdown?: Array<{
    word: string;
    accuracyScore: number;
    phonetic?: string;
    tip?: string;
  }>;
  keyAccentTips?: string[];
}

export interface SessionAnalysis {
  summary: string;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  pronunciationScore: number;
  strengths: string[];
  mistakesToAvoid: Array<{
    mistake: string;
    correction: string;
    explanation: string;
  }>;
  nextFocusArea: string;
  earnedXP: number;
}

export interface SessionAnalysisResult {
  scores: {
    fluency: number;
    grammar: number;
    vocabulary: number;
    pronunciation: number;
    listening: number;
  };
  whatYouDidWell: string[];
  topCorrections: Array<{
    original: string;
    corrected: string;
    explanation: string;
    naturalAlternative?: string;
  }>;
  pronunciationOpportunities: Array<{
    phrase: string;
    tip: string;
  }>;
  keyVocabularyLearned: Array<{
    word: string;
    translation: string;
    contextSentence?: string;
  }>;
  nextRecommendedStep?: {
    title: string;
    description: string;
    actionType: string;
  };
}

export interface QuizQuestion {
  id: string;
  type?: 'multiple_choice' | 'fill_blank' | 'translate' | 'accent_fix';
  question: string;
  context?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type LiveCoachingLevel = 'immersion' | 'balanced' | 'gentle' | 'coach';

export type LiveSessionState =
  | 'idle'
  | 'requesting_permission'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'user_speaking'
  | 'thinking'
  | 'ai_speaking'
  | 'interrupted'
  | 'reconnecting'
  | 'ended'
  | 'error';
