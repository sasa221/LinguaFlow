import {
  UserProgress,
  TutorMemory,
  SavedWord,
  SessionAnalysisResult,
  LearningIssue,
  LearnerProfile,
  VocabularyReviewEvent,
} from '../types';
import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

const STORAGE_PREFIX = 'linguaflow_v3';

export function getScopedKey(key: string, userId = 'default_user'): string {
  return `${STORAGE_PREFIX}:${userId}:${key}`;
}

export function createDefaultProfile(userId = 'default_user'): LearnerProfile {
  return {
    userId,
    hasCompletedOnboarding: false,
    targetLanguageId: 'spanish',
    nativeLanguageId: 'arabic-eg',
    level: 'A2',
    selectedVoice: 'Zephyr',
    playbackSpeed: 0.9,
    dailyGoalMinutes: 15,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// ---------------- LOCAL STORAGE CACHE ----------------

export function loadLearnerProfile(userId = 'default_user'): LearnerProfile {
  try {
    const raw = localStorage.getItem(getScopedKey('profile', userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load learner profile from cache:', e);
  }
  return createDefaultProfile(userId);
}

export function saveLearnerProfile(profile: LearnerProfile, userId = 'default_user'): void {
  try {
    localStorage.setItem(
      getScopedKey('profile', userId),
      JSON.stringify({ ...profile, updatedAt: Date.now() })
    );
  } catch (e) {
    console.error('Failed to save learner profile to cache:', e);
  }
}

export function calculateStreakFromDates(dates?: string[]): number {
  if (!dates || dates.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(dates)).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // If neither today nor yesterday is in active dates, streak is broken (0)
  if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
    return 0;
  }

  let currentCheck = new Date(uniqueDates.includes(todayStr) ? todayStr : yesterdayStr);
  let streak = 0;

  while (true) {
    const checkStr = currentCheck.toISOString().split('T')[0];
    if (uniqueDates.includes(checkStr)) {
      streak += 1;
      currentCheck = new Date(currentCheck.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

export function createInitialUserProgress(dailyGoal = 15): UserProgress {
  const today = new Date().toISOString().split('T')[0];
  return {
    xp: 0,
    streakDays: 0,
    lastActiveDate: today,
    minutesPracticedToday: 0,
    dailyGoalMinutes: dailyGoal,
    conversationsCompleted: 0,
    totalSpokenSeconds: 0,
    wordsSavedCount: 0,
    weaknesses: [],
    activeDates: [],
    processedSessionIds: [],
    processedActivityIds: [],
    processedReviewEventIds: [],
    skillScores: {
      speaking: 50,
      listening: 50,
      grammar: 50,
      vocabulary: 50,
      pronunciation: 50,
    },
    weeklyActivity: [
      { day: 'Mon', minutes: 0, xp: 0 },
      { day: 'Tue', minutes: 0, xp: 0 },
      { day: 'Wed', minutes: 0, xp: 0 },
      { day: 'Thu', minutes: 0, xp: 0 },
      { day: 'Fri', minutes: 0, xp: 0 },
      { day: 'Sat', minutes: 0, xp: 0 },
      { day: 'Sun', minutes: 0, xp: 0 },
    ],
    recentActivities: [],
  };
}

export function loadUserProgress(userId = 'default_user', dailyGoal = 15): UserProgress {
  try {
    const raw = localStorage.getItem(getScopedKey('progress', userId));
    if (raw) {
      const parsed: UserProgress = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.lastActiveDate !== today) {
        parsed.minutesPracticedToday = 0;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load user progress from cache:', e);
  }
  return createInitialUserProgress(dailyGoal);
}

export function saveUserProgress(progress: UserProgress, userId = 'default_user'): void {
  try {
    localStorage.setItem(getScopedKey('progress', userId), JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save user progress to cache:', e);
  }
}

export function addXPToProgress(progress: UserProgress, amount: number, activityId?: string): UserProgress {
  if (activityId) {
    const processed = progress.processedActivityIds || [];
    if (processed.includes(activityId)) {
      return progress;
    }
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = dayNames[new Date().getDay()];

  const currentWeekly =
    progress.weeklyActivity && progress.weeklyActivity.length === 7
      ? progress.weeklyActivity
      : [
          { day: 'Mon', minutes: 0, xp: 0 },
          { day: 'Tue', minutes: 0, xp: 0 },
          { day: 'Wed', minutes: 0, xp: 0 },
          { day: 'Thu', minutes: 0, xp: 0 },
          { day: 'Fri', minutes: 0, xp: 0 },
          { day: 'Sat', minutes: 0, xp: 0 },
          { day: 'Sun', minutes: 0, xp: 0 },
        ];

  const updatedWeekly = currentWeekly.map((w) => {
    if (w.day === todayDayName) {
      return { ...w, xp: (w.xp || 0) + amount };
    }
    return w;
  });

  const updatedProcessed = activityId
    ? [...(progress.processedActivityIds || []).slice(-60), activityId]
    : progress.processedActivityIds;

  return {
    ...progress,
    xp: progress.xp + amount,
    weeklyActivity: updatedWeekly,
    processedActivityIds: updatedProcessed,
  };
}

export function recordPracticeTime(progress: UserProgress, minutes: number, sessionId?: string): UserProgress {
  if (sessionId) {
    const processed = progress.processedSessionIds || [];
    if (processed.includes(sessionId)) {
      return progress;
    }
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = dayNames[new Date().getDay()];

  const existingDates = progress.activeDates || (progress.lastActiveDate ? [progress.lastActiveDate] : []);
  const updatedActiveDates = Array.from(new Set([...existingDates, todayStr])).sort();
  const calculatedStreak = calculateStreakFromDates(updatedActiveDates);

  const currentWeekly =
    progress.weeklyActivity && progress.weeklyActivity.length === 7
      ? progress.weeklyActivity
      : [
          { day: 'Mon', minutes: 0, xp: 0 },
          { day: 'Tue', minutes: 0, xp: 0 },
          { day: 'Wed', minutes: 0, xp: 0 },
          { day: 'Thu', minutes: 0, xp: 0 },
          { day: 'Fri', minutes: 0, xp: 0 },
          { day: 'Sat', minutes: 0, xp: 0 },
          { day: 'Sun', minutes: 0, xp: 0 },
        ];

  const updatedWeekly = currentWeekly.map((w) => {
    if (w.day === todayDayName) {
      return { ...w, minutes: (w.minutes || 0) + minutes };
    }
    return w;
  });

  const updatedProcessed = sessionId
    ? [...(progress.processedSessionIds || []).slice(-60), sessionId]
    : progress.processedSessionIds;

  return {
    ...progress,
    streakDays: calculatedStreak,
    activeDates: updatedActiveDates,
    lastActiveDate: todayStr,
    minutesPracticedToday:
      (progress.lastActiveDate === todayStr ? progress.minutesPracticedToday : 0) + minutes,
    conversationsCompleted: progress.conversationsCompleted + 1,
    weeklyActivity: updatedWeekly,
    processedSessionIds: updatedProcessed,
  };
}

export function createVocabularyReviewEvent(
  word: SavedWord,
  rating: 'again' | 'hard' | 'good' | 'easy',
  explicitId?: string
): { event: VocabularyReviewEvent; updatedWord: SavedWord } {
  const updatedWord = calculateNextReview(word, rating);
  const eventId = explicitId || `rev-${word.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  const event: VocabularyReviewEvent = {
    id: eventId,
    wordId: word.id,
    rating,
    reviewedAt: new Date().toISOString(),
    previous: {
      masteryLevel: word.masteryLevel || 0,
      intervalDays: word.intervalDays || 1,
      easeFactor: word.easeFactor || 2.5,
    },
    next: {
      masteryLevel: updatedWord.masteryLevel || 0,
      intervalDays: updatedWord.intervalDays || 1,
      easeFactor: updatedWord.easeFactor || 2.5,
      nextReviewDate: updatedWord.nextReviewDate || Date.now() + 86400000,
    },
  };

  return { event, updatedWord };
}

export function applyVocabularyReviewWithIdempotency(
  word: SavedWord,
  rating: 'again' | 'hard' | 'good' | 'easy',
  progress: UserProgress,
  reviewEventId?: string
): {
  updatedWord: SavedWord;
  updatedProgress: UserProgress;
  applied: boolean;
  event: VocabularyReviewEvent;
} {
  const stableEventId = reviewEventId || `rev-${word.id}-${word.lastReviewedDate || word.dateAdded}-${rating}`;
  const processed = progress.processedReviewEventIds || [];

  if (processed.includes(stableEventId)) {
    // Idempotency check: review already applied
    return {
      updatedWord: word,
      updatedProgress: progress,
      applied: false,
      event: {
        id: stableEventId,
        wordId: word.id,
        rating,
        reviewedAt: new Date(word.lastReviewedDate || Date.now()).toISOString(),
        previous: {
          masteryLevel: word.masteryLevel || 0,
          intervalDays: word.intervalDays || 1,
          easeFactor: word.easeFactor || 2.5,
        },
        next: {
          masteryLevel: word.masteryLevel || 0,
          intervalDays: word.intervalDays || 1,
          easeFactor: word.easeFactor || 2.5,
          nextReviewDate: word.nextReviewDate || Date.now() + 86400000,
        },
      },
    };
  }

  const { event, updatedWord } = createVocabularyReviewEvent(word, rating, stableEventId);
  const updatedProgressWithXP = addXPToProgress(progress, 10, `xp-review-${stableEventId}`);
  const updatedProcessedEvents = [...processed.slice(-100), stableEventId];

  const todayStr = new Date().toISOString().split('T')[0];
  const existingDates = updatedProgressWithXP.activeDates || (updatedProgressWithXP.lastActiveDate ? [updatedProgressWithXP.lastActiveDate] : []);
  const updatedActiveDates = Array.from(new Set([...existingDates, todayStr])).sort();
  const calculatedStreak = calculateStreakFromDates(updatedActiveDates);

  const finalProgress: UserProgress = {
    ...updatedProgressWithXP,
    streakDays: calculatedStreak,
    activeDates: updatedActiveDates,
    lastActiveDate: todayStr,
    processedReviewEventIds: updatedProcessedEvents,
  };

  return {
    updatedWord,
    updatedProgress: finalProgress,
    applied: true,
    event,
  };
}

export function loadSavedWords(userId = 'default_user'): SavedWord[] {
  try {
    const raw = localStorage.getItem(getScopedKey('saved_words', userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved words from cache:', e);
  }
  return [];
}

export function saveSavedWords(words: SavedWord[], userId = 'default_user'): void {
  try {
    localStorage.setItem(getScopedKey('saved_words', userId), JSON.stringify(words));
  } catch (e) {
    console.error('Failed to save words to cache:', e);
  }
}

export function loadTutorMemory(userId = 'default_user'): TutorMemory {
  try {
    const raw = localStorage.getItem(getScopedKey('tutor_memory', userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load tutor memory from cache:', e);
  }
  return createInitialTutorMemory();
}

export function saveTutorMemory(memory: TutorMemory, userId = 'default_user'): void {
  try {
    localStorage.setItem(getScopedKey('tutor_memory', userId), JSON.stringify(memory));
  } catch (e) {
    console.error('Failed to save tutor memory to cache:', e);
  }
}

export function createInitialTutorMemory(): TutorMemory {
  return {
    goals: 'Conversational fluency, natural speech reflexes, and practical communication',
    weaknesses: [],
    strengths: [],
    recentTopics: [],
    savedWordsCount: 0,
    preferredTone: 'Encouraging, clear, and focused on real-world practical speaking',
  };
}

// ---------------- CLOUD FIRESTORE PERSISTENCE ----------------

export async function fetchCloudUserData(uid: string): Promise<{
  profile: LearnerProfile | null;
  progress: UserProgress | null;
  tutorMemory: TutorMemory | null;
  savedWords: SavedWord[];
}> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    let profile: LearnerProfile | null = null;
    let progress: UserProgress | null = null;
    let tutorMemory: TutorMemory | null = null;

    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.profile) {
        profile = { ...data.profile, userId: uid };
      }
      if (data.progress) {
        progress = data.progress;
      }
      if (data.tutorMemory) {
        tutorMemory = data.tutorMemory;
      }
    }

    // Load vocabulary subcollection
    const vocabColRef = collection(db, 'users', uid, 'vocabulary');
    const vocabSnap = await getDocs(vocabColRef);
    const savedWords: SavedWord[] = [];
    vocabSnap.forEach((docItem) => {
      savedWords.push(docItem.data() as SavedWord);
    });

    return { profile, progress, tutorMemory, savedWords };
  } catch (err) {
    console.warn('Cloud data fetch error (using local cache):', err);
    return { profile: null, progress: null, tutorMemory: null, savedWords: [] };
  }
}

export async function saveCloudUserData(
  uid: string,
  dataOrProfile: LearnerProfile | { profile?: LearnerProfile; progress?: UserProgress; tutorMemory?: TutorMemory; savedWords?: SavedWord[] },
  progress?: UserProgress,
  tutorMemory?: TutorMemory,
  savedWords?: SavedWord[]
): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    let payload: any = { updatedAt: Date.now(), schemaVersion: 3 };

    if ('targetLanguageId' in (dataOrProfile as any)) {
      payload.profile = { ...(dataOrProfile as LearnerProfile), userId: uid, updatedAt: Date.now() };
      if (progress) payload.progress = progress;
      if (tutorMemory) payload.tutorMemory = tutorMemory;
    } else {
      const partial = dataOrProfile as { profile?: LearnerProfile; progress?: UserProgress; tutorMemory?: TutorMemory; savedWords?: SavedWord[] };
      if (partial.profile) payload.profile = { ...partial.profile, userId: uid, updatedAt: Date.now() };
      if (partial.progress) payload.progress = partial.progress;
      if (partial.tutorMemory) payload.tutorMemory = partial.tutorMemory;
      if (partial.savedWords) savedWords = partial.savedWords;
    }

    await setDoc(userDocRef, payload, { merge: true });

    if (savedWords && savedWords.length > 0) {
      const batch = writeBatch(db);
      for (const word of savedWords.slice(0, 200)) {
        if (!word.id) continue;
        const wordRef = doc(db, 'users', uid, 'vocabulary', word.id);
        batch.set(wordRef, word, { merge: true });
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('Cloud data save error (cached locally):', err);
  }
}

export async function syncCloudWord(uid: string, word: SavedWord): Promise<void> {
  try {
    if (!uid || !word.id) return;
    const wordRef = doc(db, 'users', uid, 'vocabulary', word.id);
    await setDoc(wordRef, word, { merge: true });
  } catch (err) {
    console.warn('Cloud word sync error:', err);
  }
}

export async function deleteCloudWord(uid: string, wordId: string): Promise<void> {
  try {
    if (!uid || !wordId) return;
    const wordRef = doc(db, 'users', uid, 'vocabulary', wordId);
    await deleteDoc(wordRef);
  } catch (err) {
    console.warn('Cloud word delete error:', err);
  }
}

export async function deleteCloudUserData(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    await deleteDoc(userDocRef);

    const vocabColRef = collection(db, 'users', uid, 'vocabulary');
    const vocabSnap = await getDocs(vocabColRef);
    const batch = writeBatch(db);
    vocabSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Cloud user data delete error:', err);
  }
}

export async function clearCloudTutorMemory(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const initial = createInitialTutorMemory();
    await setDoc(userDocRef, { tutorMemory: initial, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Cloud tutor memory clear error:', err);
  }
}

export async function clearCloudWeaknesses(uid: string): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const progress = data.progress || createInitialUserProgress();
      progress.weaknesses = [];
      const tutorMemory = data.tutorMemory || createInitialTutorMemory();
      tutorMemory.weaknesses = [];
      await setDoc(userDocRef, { progress, tutorMemory, updatedAt: Date.now() }, { merge: true });
    }
  } catch (err) {
    console.warn('Cloud weakness clear error:', err);
  }
}

export async function clearCloudVocabulary(uid: string): Promise<void> {
  try {
    const vocabColRef = collection(db, 'users', uid, 'vocabulary');
    const vocabSnap = await getDocs(vocabColRef);
    const batch = writeBatch(db);
    vocabSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.warn('Cloud vocabulary clear error:', err);
  }
}

// ---------------- SAFE MIGRATION & MERGE ----------------

export async function migrateLocalToCloud(
  uid: string,
  localUserKey = 'default_user'
): Promise<{
  profile: LearnerProfile;
  progress: UserProgress;
  tutorMemory: TutorMemory;
  savedWords: SavedWord[];
}> {
  const localProfile = loadLearnerProfile(localUserKey);
  const localProgress = loadUserProgress(localUserKey);
  const localTutorMemory = loadTutorMemory(localUserKey);
  const localSavedWords = loadSavedWords(localUserKey);

  const cloudData = await fetchCloudUserData(uid);

  // If cloud data is empty, populate cloud from local
  if (!cloudData.profile && !cloudData.progress) {
    const profileToSave: LearnerProfile = { ...localProfile, userId: uid };
    await saveCloudUserData(
      uid,
      profileToSave,
      localProgress,
      localTutorMemory,
      localSavedWords
    );
    // Cache under uid
    saveLearnerProfile(profileToSave, uid);
    saveUserProgress(localProgress, uid);
    saveTutorMemory(localTutorMemory, uid);
    saveSavedWords(localSavedWords, uid);

    return {
      profile: profileToSave,
      progress: localProgress,
      tutorMemory: localTutorMemory,
      savedWords: localSavedWords,
    };
  }

  // If cloud already exists, merge safely
  const cloudProfileTime = cloudData.profile?.updatedAt || 0;
  const localProfileTime = localProfile.updatedAt || 0;
  const mergedProfile: LearnerProfile = localProfileTime > cloudProfileTime
    ? { ...localProfile, userId: uid }
    : cloudData.profile || { ...localProfile, userId: uid };

  // 1. Merge Progress with Event-based Deduplication & Date-derived Streak
  const baseProgress = cloudData.progress || createInitialUserProgress();
  const todayStr = new Date().toISOString().split('T')[0];

  const mergedActiveDates = Array.from(
    new Set([
      ...(baseProgress.activeDates || (baseProgress.lastActiveDate ? [baseProgress.lastActiveDate] : [])),
      ...(localProgress.activeDates || (localProgress.lastActiveDate ? [localProgress.lastActiveDate] : [])),
    ])
  ).sort();
  const mergedStreak = calculateStreakFromDates(mergedActiveDates);

  const mergedSessionIds = Array.from(
    new Set([...(baseProgress.processedSessionIds || []), ...(localProgress.processedSessionIds || [])])
  );
  const mergedActivityIds = Array.from(
    new Set([...(baseProgress.processedActivityIds || []), ...(localProgress.processedActivityIds || [])])
  );
  const mergedReviewEventIds = Array.from(
    new Set([...(baseProgress.processedReviewEventIds || []), ...(localProgress.processedReviewEventIds || [])])
  );

  // Merge recent activities deduplicated by id
  const activityMap = new Map<string, any>();
  for (const act of baseProgress.recentActivities || []) {
    if (act.id) activityMap.set(act.id, act);
  }
  for (const act of localProgress.recentActivities || []) {
    if (act.id && !activityMap.has(act.id)) {
      activityMap.set(act.id, act);
    }
  }
  const mergedRecentActivities = Array.from(activityMap.values()).slice(0, 20);

  // Derive XP without naive max loss: combine distinct session/activity XP
  const hasDistinctEvents =
    localProgress.xp > 0 &&
    baseProgress.xp > 0 &&
    (mergedSessionIds.length > (baseProgress.processedSessionIds?.length || 0) ||
      mergedActivityIds.length > (baseProgress.processedActivityIds?.length || 0) ||
      mergedReviewEventIds.length > (baseProgress.processedReviewEventIds?.length || 0));

  const mergedXP = hasDistinctEvents
    ? (baseProgress.xp || 0) + (localProgress.xp || 0)
    : Math.max(baseProgress.xp || 0, localProgress.xp || 0);

  const mergedMinutes =
    (baseProgress.lastActiveDate === todayStr ? baseProgress.minutesPracticedToday || 0 : 0) +
    (localProgress.lastActiveDate === todayStr ? localProgress.minutesPracticedToday || 0 : 0);

  const mergedConversations = Math.max(
    mergedSessionIds.length,
    (baseProgress.conversationsCompleted || 0) +
      (localProgress.processedSessionIds && localProgress.processedSessionIds.length > 0
        ? 0
        : localProgress.conversationsCompleted || 0)
  );

  // Merge weaknesses by normalized topic key
  const weaknessMap = new Map<string, LearningIssue>();
  for (const w of baseProgress.weaknesses || []) {
    weaknessMap.set(w.topic.trim().toLowerCase(), w);
  }
  for (const lw of localProgress.weaknesses || []) {
    const key = lw.topic.trim().toLowerCase();
    const existing = weaknessMap.get(key);
    if (!existing || (lw.lastPracticed || 0) > (existing.lastPracticed || 0)) {
      weaknessMap.set(key, lw);
    }
  }
  const mergedWeaknesses = Array.from(weaknessMap.values()).slice(0, 15);

  const mergedProgress: UserProgress = {
    ...baseProgress,
    xp: mergedXP,
    streakDays: mergedStreak,
    activeDates: mergedActiveDates,
    lastActiveDate: todayStr,
    minutesPracticedToday: mergedMinutes,
    conversationsCompleted: mergedConversations,
    weaknesses: mergedWeaknesses,
    processedSessionIds: mergedSessionIds,
    processedActivityIds: mergedActivityIds,
    processedReviewEventIds: mergedReviewEventIds,
    recentActivities: mergedRecentActivities,
  };

  // 2. Semantic TutorMemory Merge
  const baseMemory = cloudData.tutorMemory || createInitialTutorMemory();
  const mergedTopics = Array.from(
    new Set([...(baseMemory.recentTopics || []), ...(localTutorMemory.recentTopics || [])])
  )
    .filter(Boolean)
    .slice(0, 8);

  const mergedStrengths = Array.from(
    new Set([...(baseMemory.strengths || []), ...(localTutorMemory.strengths || [])])
  )
    .filter(Boolean)
    .slice(0, 8);

  const mergedTutorMemory: TutorMemory = {
    ...baseMemory,
    goals: localProfileTime > cloudProfileTime && localTutorMemory.goals ? localTutorMemory.goals : baseMemory.goals,
    recentTopics: mergedTopics,
    strengths: mergedStrengths,
    weaknesses: mergedWeaknesses.map((w) => w.topic),
    savedWordsCount: (cloudData.savedWords?.length || 0) + (localSavedWords?.length || 0),
  };

  // 3. Vocabulary Merge by Stable ID with Timestamp-based Latest SRS State
  const wordMap = new Map<string, SavedWord>();
  for (const w of cloudData.savedWords) {
    if (w.id) wordMap.set(w.id, w);
  }
  for (const lw of localSavedWords) {
    if (!lw.id) continue;
    const existing = wordMap.get(lw.id);
    if (existing) {
      // Prefer latest valid SRS state based on lastReviewedDate or dateAdded
      const existingTime = existing.lastReviewedDate || existing.dateAdded || 0;
      const incomingTime = lw.lastReviewedDate || lw.dateAdded || 0;
      if (incomingTime > existingTime) {
        wordMap.set(lw.id, lw);
      }
    } else {
      wordMap.set(lw.id, lw);
    }
  }
  const mergedWords = Array.from(wordMap.values());

  // Save merged state to cloud & local cache
  await saveCloudUserData(uid, mergedProfile, mergedProgress, mergedTutorMemory, mergedWords);
  saveLearnerProfile(mergedProfile, uid);
  saveUserProgress(mergedProgress, uid);
  saveTutorMemory(mergedTutorMemory, uid);
  saveSavedWords(mergedWords, uid);

  return {
    profile: mergedProfile,
    progress: mergedProgress,
    tutorMemory: mergedTutorMemory,
    savedWords: mergedWords,
  };
}

// ---------------- DOMAIN UTILITIES ----------------

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Strictly separates Again (1d), Hard (1d), Good (1d or 3d), Easy (2d or 4d+)
 */
export function calculateNextReview(
  word: SavedWord,
  quality: 'again' | 'hard' | 'good' | 'easy'
): SavedWord {
  let qNumber = 3;
  if (quality === 'again') qNumber = 1;
  else if (quality === 'hard') qNumber = 2;
  else if (quality === 'good') qNumber = 4;
  else if (quality === 'easy') qNumber = 5;

  let easeFactor = word.easeFactor || 2.5;
  let intervalDays = word.intervalDays || 1;
  let reviewCount = (word.reviewCount || 0) + 1;
  let masteryLevel = word.masteryLevel || 0;

  if (quality === 'again') {
    reviewCount = 0;
    intervalDays = 1;
    masteryLevel = Math.max(0, masteryLevel - 1);
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (quality === 'hard') {
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (quality === 'good') {
    if (reviewCount === 1) {
      intervalDays = 1;
    } else if (reviewCount === 2) {
      intervalDays = 3;
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));
    }
    masteryLevel = Math.min(5, masteryLevel + 1);
  } else if (quality === 'easy') {
    if (reviewCount === 1) {
      intervalDays = 2;
    } else if (reviewCount === 2) {
      intervalDays = 4;
    } else {
      intervalDays = Math.max(2, Math.round(intervalDays * easeFactor * 1.3));
    }
    masteryLevel = Math.min(5, masteryLevel + 1);
    easeFactor = easeFactor + 0.15;
  }

  const now = Date.now();
  const nextReviewDate = now + intervalDays * 24 * 60 * 60 * 1000;

  return {
    ...word,
    lastReviewedDate: now,
    reviewCount,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    masteryLevel,
    nextReviewDate,
  };
}

/**
 * Integrate Session Analysis into Central User Progress & Tutor Memory with Idempotency
 */
export function integrateSessionAnalysis(
  currentProgress: UserProgress,
  currentTutorMemory: TutorMemory,
  stats: { seconds: number; turns: number; scenarioTitle: string; sessionId?: string },
  analysis: SessionAnalysisResult
): { updatedProgress: UserProgress; updatedTutorMemory: TutorMemory } {
  const sessionId = stats.sessionId || 'session-' + Date.now();

  // Idempotency check: if activity already recorded with this ID, do not duplicate progress
  const alreadyRecorded = (currentProgress.recentActivities || []).some((a) => a.id === sessionId);
  if (alreadyRecorded) {
    return { updatedProgress: currentProgress, updatedTutorMemory: currentTutorMemory };
  }

  const earnedXP = Math.max(30, stats.turns * 15 + Math.round(stats.seconds / 6));
  const sessionMinutes = Math.max(1, Math.round(stats.seconds / 60));

  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const todayDayName = dayNames[new Date().getDay()];

  // Streak calculation
  let newStreak = currentProgress.streakDays || 0;
  if (!currentProgress.lastActiveDate || currentProgress.streakDays === 0) {
    newStreak = 1;
  } else if (currentProgress.lastActiveDate !== todayStr) {
    const lastDate = new Date(currentProgress.lastActiveDate);
    const currDate = new Date(todayStr);
    const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  // Update weekly activity
  const currentWeekly =
    currentProgress.weeklyActivity && currentProgress.weeklyActivity.length === 7
      ? currentProgress.weeklyActivity
      : [
          { day: 'Mon', minutes: 0, xp: 0 },
          { day: 'Tue', minutes: 0, xp: 0 },
          { day: 'Wed', minutes: 0, xp: 0 },
          { day: 'Thu', minutes: 0, xp: 0 },
          { day: 'Fri', minutes: 0, xp: 0 },
          { day: 'Sat', minutes: 0, xp: 0 },
          { day: 'Sun', minutes: 0, xp: 0 },
        ];

  const updatedWeekly = currentWeekly.map((w) => {
    if (w.day === todayDayName) {
      return {
        ...w,
        minutes: w.minutes + sessionMinutes,
        xp: w.xp + earnedXP,
      };
    }
    return w;
  });

  const updatedSkills = {
    speaking: Math.round(
      (currentProgress.skillScores?.speaking || 50) * 0.7 +
        (analysis.scores.fluency || 70) * 0.3
    ),
    listening: Math.round(
      (currentProgress.skillScores?.listening || 50) * 0.7 +
        (analysis.scores.listening || 75) * 0.3
    ),
    grammar: Math.round(
      (currentProgress.skillScores?.grammar || 50) * 0.7 +
        (analysis.scores.grammar || 65) * 0.3
    ),
    vocabulary: Math.round(
      (currentProgress.skillScores?.vocabulary || 50) * 0.7 +
        (analysis.scores.vocabulary || 70) * 0.3
    ),
    pronunciation: Math.round(
      (currentProgress.skillScores?.pronunciation || 50) * 0.7 +
        (analysis.scores.pronunciation || 70) * 0.3
    ),
  };

  const newWeaknessItems: LearningIssue[] = (analysis.topCorrections || []).map((c, i) => ({
    id: 'issue-' + Date.now() + '-' + i,
    topic: c.corrected,
    explanation: c.explanation,
    evidence: c.original,
    status: 'needs_attention',
    lastPracticed: Date.now(),
  }));

  const mergedWeaknesses = [
    ...newWeaknessItems,
    ...(currentProgress.weaknesses || []).filter(
      (old) => !newWeaknessItems.some((n) => n.topic.toLowerCase() === old.topic.toLowerCase())
    ),
  ].slice(0, 10);

  const newActivityRecord = {
    id: sessionId,
    title: stats.scenarioTitle,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    xpEarned: earnedXP,
    score: Math.round(
      ((analysis.scores.fluency + analysis.scores.grammar + analysis.scores.vocabulary) / 3)
    ),
  };

  const updatedProgress: UserProgress = {
    ...currentProgress,
    xp: currentProgress.xp + earnedXP,
    streakDays: newStreak,
    lastActiveDate: todayStr,
    minutesPracticedToday:
      (currentProgress.lastActiveDate === todayStr ? currentProgress.minutesPracticedToday : 0) +
      sessionMinutes,
    conversationsCompleted: currentProgress.conversationsCompleted + 1,
    totalSpokenSeconds: currentProgress.totalSpokenSeconds + stats.seconds,
    skillScores: updatedSkills,
    weaknesses: mergedWeaknesses,
    weeklyActivity: updatedWeekly,
    recentActivities: [newActivityRecord, ...(currentProgress.recentActivities || []).slice(0, 7)],
  };

  const updatedTopics = Array.from(
    new Set([stats.scenarioTitle, ...(currentTutorMemory.recentTopics || [])])
  ).slice(0, 5);

  const updatedTutorMemory: TutorMemory = {
    ...currentTutorMemory,
    recentTopics: updatedTopics,
    weaknesses: mergedWeaknesses.map((w) => w.topic).slice(0, 6),
    strengths: Array.from(
      new Set([...(analysis.whatYouDidWell || []), ...(currentTutorMemory.strengths || [])])
    ).slice(0, 5),
  };

  return { updatedProgress, updatedTutorMemory };
}

export function resetUserData(userId = 'default_user'): void {
  try {
    localStorage.removeItem(getScopedKey('profile', userId));
    localStorage.removeItem(getScopedKey('progress', userId));
    localStorage.removeItem(getScopedKey('saved_words', userId));
    localStorage.removeItem(getScopedKey('tutor_memory', userId));
  } catch (e) {
    console.error('Failed to reset user data:', e);
  }
}

export function clearTutorMemory(userId = 'default_user'): void {
  try {
    const initial = createInitialTutorMemory();
    saveTutorMemory(initial, userId);
  } catch (e) {
    console.error('Failed to clear tutor memory:', e);
  }
}

export function clearWeaknessData(userId = 'default_user'): void {
  try {
    const progress = loadUserProgress(userId);
    progress.weaknesses = [];
    saveUserProgress(progress, userId);
    const tutorMemory = loadTutorMemory(userId);
    tutorMemory.weaknesses = [];
    saveTutorMemory(tutorMemory, userId);
  } catch (e) {
    console.error('Failed to clear weakness data:', e);
  }
}
