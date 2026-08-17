import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  NativeLanguage,
  ProficiencyLevel,
  Scenario,
  SavedWord,
  UserProgress,
  NavigationTab,
  LearnerProfile,
  AppBootState,
  AuthUser,
  AuthState,
  CurriculumUnit,
  CurriculumLesson,
  LearnerCurriculumProgress,
} from './types';
import { LANGUAGES, NATIVE_LANGUAGES } from './data/languages';
import { getDefaultScenarioForLanguageAndLevel } from './data/scenarios';
import {
  loadCurriculumProgress,
  saveCurriculumProgress,
  recordLessonCompletion,
} from './data/curriculum/curriculumEngine';
import {
  loadLearnerProfile,
  saveLearnerProfile,
  loadUserProgress,
  saveUserProgress,
  loadSavedWords,
  saveSavedWords,
  recordPracticeTime,
  addXPToProgress,
  resetUserData,
  clearTutorMemory,
  clearWeaknessData,
  fetchCloudUserData,
  saveCloudUserData,
  migrateLocalToCloud,
  syncCloudWord,
  deleteCloudWord,
  deleteCloudUserData,
  clearCloudTutorMemory,
  clearCloudWeaknesses,
  clearCloudVocabulary,
} from './utils/learnerStorage';
import { auth, googleProvider, isFirebaseInitialized } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from 'firebase/auth';

import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { LiveVoiceRoom } from './components/LiveVoiceRoom';
import { ScenarioSelector } from './components/ScenarioSelector';
import { RoleplayChat } from './components/RoleplayChat';
import { PronunciationLab } from './components/PronunciationLab';
import { VocabularyNotebook } from './components/VocabularyNotebook';
import { InteractiveDrills } from './components/InteractiveDrills';
import { AITutorCoach } from './components/AITutorCoach';
import { ProgressAnalytics } from './components/ProgressAnalytics';
import { WordInspectorModal } from './components/WordInspectorModal';
import { SessionReviewModal } from './components/SessionReviewModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PlacementTestModal } from './components/PlacementTestModal';
import { LearningPreferencesModal } from './components/LearningPreferencesModal';
import { CurriculumView } from './components/curriculum/CurriculumView';
import { LessonRunner } from './components/curriculum/LessonRunner';
import { TestOutModal } from './components/curriculum/TestOutModal';
import { Loader2 } from 'lucide-react';

const FALLBACK_LOCAL_USER_ID = 'saleh_primary';

export default function App() {
  const [bootState, setBootState] = useState<AppBootState>('initializing');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authState, setAuthState] = useState<AuthState>('initializing');
  const [currentUserId, setCurrentUserId] = useState<string>(FALLBACK_LOCAL_USER_ID);

  const [profile, setProfile] = useState<LearnerProfile>(() => loadLearnerProfile(FALLBACK_LOCAL_USER_ID));
  
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const saved = LANGUAGES.find((l) => l.id === profile.targetLanguageId);
    return saved || LANGUAGES[0];
  });

  const [nativeLanguage, setNativeLanguage] = useState<NativeLanguage>(() => {
    const saved = NATIVE_LANGUAGES.find((l) => l.id === profile.nativeLanguageId);
    return saved || NATIVE_LANGUAGES[0];
  });

  const [currentLevel, setCurrentLevel] = useState<ProficiencyLevel>(() => profile.level || 'A0');
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon'>(
    () => profile.selectedVoice || 'Zephyr'
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => profile.playbackSpeed || 0.9);

  const [activeScenario, setActiveScenario] = useState<Scenario>(() =>
    getDefaultScenarioForLanguageAndLevel(currentLanguage, currentLevel)
  );
  const [hasExplicitlySelectedScenario, setHasExplicitlySelectedScenario] = useState<boolean>(false);

  const [progress, setProgress] = useState<UserProgress>(() =>
    loadUserProgress(FALLBACK_LOCAL_USER_ID, profile.dailyGoalMinutes || 15)
  );
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => loadSavedWords(FALLBACK_LOCAL_USER_ID));

  // Curriculum State
  const [curriculumProgress, setCurriculumProgress] = useState<LearnerCurriculumProgress>(() =>
    loadCurriculumProgress(currentLanguage.id)
  );
  const [activeLesson, setActiveLesson] = useState<{
    unit: CurriculumUnit;
    lesson: CurriculumLesson;
  } | null>(null);
  const [testOutUnit, setTestOutUnit] = useState<CurriculumUnit | null>(null);

  // Sync curriculum progress when language switches
  useEffect(() => {
    setCurriculumProgress(loadCurriculumProgress(currentLanguage.id));
  }, [currentLanguage.id]);

  // Modal States
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPlacement, setShowPlacement] = useState(false);
  const [inspectingWord, setInspectingWord] = useState<{ word: string; contextSentence?: string } | null>(null);
  const [pronunciationPhrase, setPronunciationPhrase] = useState<string | undefined>(undefined);
  const [activeDrillTopic, setActiveDrillTopic] = useState<string | undefined>(undefined);
  const [sessionReviewStats, setSessionReviewStats] = useState<{
    seconds: number;
    turns: number;
    scenarioTitle: string;
    transcript?: Array<{ sender: 'user' | 'ai'; text: string }>;
  } | null>(null);

  // Apply learner data to state
  const hydrateLearnerData = useCallback((userId: string, loadedProfile: LearnerProfile, loadedProgress: UserProgress, loadedWords: SavedWord[]) => {
    setProfile(loadedProfile);
    const targetLang = LANGUAGES.find((l) => l.id === loadedProfile.targetLanguageId) || LANGUAGES[0];
    const nativeLang = NATIVE_LANGUAGES.find((l) => l.id === loadedProfile.nativeLanguageId) || NATIVE_LANGUAGES[0];
    
    setCurrentLanguage(targetLang);
    setNativeLanguage(nativeLang);
    setCurrentLevel(loadedProfile.level || 'A2');
    setSelectedVoice(loadedProfile.selectedVoice || 'Zephyr');
    setPlaybackSpeed(loadedProfile.playbackSpeed || 0.9);
    setProgress(loadedProgress);
    setSavedWords(loadedWords);

    if (!loadedProfile.hasCompletedOnboarding) {
      setBootState('needs_onboarding');
      setShowOnboarding(true);
    } else {
      setBootState('ready');
    }
  }, []);

  // Firebase Auth Lifecycle & Cloud Hydration
  useEffect(() => {
    if (!isFirebaseInitialized || !auth) {
      // Fallback to local storage if Firebase is not active
      const localProfile = loadLearnerProfile(FALLBACK_LOCAL_USER_ID);
      const localProgress = loadUserProgress(FALLBACK_LOCAL_USER_ID, localProfile.dailyGoalMinutes || 15);
      const localWords = loadSavedWords(FALLBACK_LOCAL_USER_ID);
      hydrateLearnerData(FALLBACK_LOCAL_USER_ID, localProfile, localProgress, localWords);
      setAuthState('anonymous');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userObj: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isAnonymous: fbUser.isAnonymous,
        };
        setAuthUser(userObj);
        setAuthState(fbUser.isAnonymous ? 'anonymous' : 'authenticated');
        setCurrentUserId(fbUser.uid);

        // Attempt cloud hydration
        try {
          const cloudData = await fetchCloudUserData(fbUser.uid);
          if (cloudData && cloudData.profile) {
            // Authorized Cloud Data exists
            hydrateLearnerData(fbUser.uid, cloudData.profile, cloudData.progress || loadUserProgress(fbUser.uid, 15), cloudData.savedWords || []);
          } else {
            // First time cloud user -> migrate local data to cloud
            await migrateLocalToCloud(fbUser.uid);
            const localProfile = loadLearnerProfile(FALLBACK_LOCAL_USER_ID);
            const localProgress = loadUserProgress(FALLBACK_LOCAL_USER_ID, localProfile.dailyGoalMinutes || 15);
            const localWords = loadSavedWords(FALLBACK_LOCAL_USER_ID);
            hydrateLearnerData(fbUser.uid, localProfile, localProgress, localWords);
          }
        } catch (err) {
          console.warn('Could not sync cloud data, falling back to local cached state:', err);
          const cachedProfile = loadLearnerProfile(fbUser.uid);
          const cachedProgress = loadUserProgress(fbUser.uid, cachedProfile.dailyGoalMinutes || 15);
          const cachedWords = loadSavedWords(fbUser.uid);
          hydrateLearnerData(fbUser.uid, cachedProfile, cachedProgress, cachedWords);
        }
      } else {
        // Guest mode
        setAuthUser(null);
        setAuthState('anonymous');
        setCurrentUserId(FALLBACK_LOCAL_USER_ID);
        const localProfile = loadLearnerProfile(FALLBACK_LOCAL_USER_ID);
        const localProgress = loadUserProgress(FALLBACK_LOCAL_USER_ID, localProfile.dailyGoalMinutes || 15);
        const localWords = loadSavedWords(FALLBACK_LOCAL_USER_ID);
        hydrateLearnerData(FALLBACK_LOCAL_USER_ID, localProfile, localProgress, localWords);
      }
    });

    return () => unsubscribe();
  }, [hydrateLearnerData]);

  // Sync active scenario when language or level switches
  useEffect(() => {
    setActiveScenario(getDefaultScenarioForLanguageAndLevel(currentLanguage, currentLevel));
    setHasExplicitlySelectedScenario(false);
  }, [currentLanguage, currentLevel]);

  // Persist user progress (Local + Cloud if authenticated)
  useEffect(() => {
    if (bootState === 'ready') {
      saveUserProgress(progress, currentUserId);
      if (authUser && !authUser.isAnonymous) {
        saveCloudUserData(currentUserId, { progress });
      }
    }
  }, [progress, bootState, currentUserId, authUser]);

  // Persist saved words (Local)
  useEffect(() => {
    if (bootState === 'ready') {
      saveSavedWords(savedWords, currentUserId);
    }
  }, [savedWords, bootState, currentUserId]);

  // Persist profile (Local + Cloud if authenticated)
  useEffect(() => {
    if (bootState === 'ready') {
      const updatedProfile: LearnerProfile = {
        ...profile,
        targetLanguageId: currentLanguage.id,
        nativeLanguageId: nativeLanguage.id,
        level: currentLevel,
        selectedVoice,
        playbackSpeed,
        updatedAt: Date.now(),
      };
      saveLearnerProfile(updatedProfile, currentUserId);
      if (authUser && !authUser.isAnonymous) {
        saveCloudUserData(currentUserId, { profile: updatedProfile });
      }
    }
  }, [currentLanguage, nativeLanguage, currentLevel, selectedVoice, playbackSpeed, bootState, currentUserId, authUser]);

  const handleSignInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      alert('Google Authentication service is not configured in this environment.');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        alert(`Sign in failed: ${err.message || 'Please try again.'}`);
      }
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      try {
        setBootState('initializing');
        setSessionReviewStats(null);
        setInspectingWord(null);
        setSavedWords([]);
        await fbSignOut(auth);
      } catch (err) {
        console.error('Sign-out error:', err);
      }
    }
  };

  const handleCompleteOnboarding = (newProfile: LearnerProfile) => {
    saveLearnerProfile(newProfile, currentUserId);
    if (authUser && !authUser.isAnonymous) {
      saveCloudUserData(currentUserId, { profile: newProfile });
    }
    setProfile(newProfile);

    const target = LANGUAGES.find((l) => l.id === newProfile.targetLanguageId) || LANGUAGES[0];
    const native = NATIVE_LANGUAGES.find((l) => l.id === newProfile.nativeLanguageId) || NATIVE_LANGUAGES[0];

    setCurrentLanguage(target);
    setNativeLanguage(native);
    setCurrentLevel(newProfile.level);
    setSelectedVoice(newProfile.selectedVoice);
    setPlaybackSpeed(newProfile.playbackSpeed || 0.9);
    setShowOnboarding(false);
    setBootState('ready');
  };

  const handleResetData = async () => {
    resetUserData(currentUserId);
    if (authUser && !authUser.isAnonymous) {
      await deleteCloudUserData(currentUserId);
    }
    const freshProfile = loadLearnerProfile(currentUserId);
    setProfile(freshProfile);
    setCurrentLanguage(LANGUAGES[0]);
    setNativeLanguage(NATIVE_LANGUAGES[0]);
    setCurrentLevel('A2');
    setProgress(loadUserProgress(currentUserId, 15));
    setSavedWords([]);
    setShowPreferences(false);
    setBootState('needs_onboarding');
    setShowOnboarding(true);
  };

  const handleClearTutorMemory = async () => {
    clearTutorMemory(currentUserId);
    if (authUser && !authUser.isAnonymous) {
      await clearCloudTutorMemory(currentUserId);
    }
  };

  const handleClearWeaknesses = async () => {
    clearWeaknessData(currentUserId);
    if (authUser && !authUser.isAnonymous) {
      await clearCloudWeaknesses(currentUserId);
    }
    setProgress((prev) => ({ ...prev, weaknesses: [] }));
  };

  const handleClearVocabulary = async () => {
    setSavedWords([]);
    saveSavedWords([], currentUserId);
    if (authUser && !authUser.isAnonymous) {
      await clearCloudVocabulary(currentUserId);
    }
  };

  const handleAddXP = (amount: number, activityId?: string) => {
    setProgress((prev) => addXPToProgress(prev, amount, activityId));
  };

  const handleFinishSession = (stats: {
    sessionId?: string;
    seconds: number;
    turns: number;
    scenarioTitle: string;
    transcript?: Array<{ sender: 'user' | 'ai'; text: string }>;
  }) => {
    const minutes = Math.max(1, Math.round(stats.seconds / 60));
    const stableSessionId = stats.sessionId || `session-${stats.scenarioTitle}-${Date.now()}`;
    const statsWithId = { ...stats, sessionId: stableSessionId };
    setProgress((prev) => recordPracticeTime(prev, minutes, stableSessionId));
    setSessionReviewStats(statsWithId);
  };

  const handleSaveWord = (word: SavedWord) => {
    setSavedWords((prev) => {
      const exists = prev.some(
        (w) =>
          w.id === word.id ||
          (w.word.toLowerCase() === word.word.toLowerCase() && w.language === word.language)
      );
      if (exists) {
        return prev.map((w) =>
          w.word.toLowerCase() === word.word.toLowerCase() && w.language === word.language
            ? word
            : w
        );
      }
      return [word, ...prev];
    });
    handleAddXP(10);
    if (authUser && !authUser.isAnonymous) {
      syncCloudWord(currentUserId, word);
    }
  };

  const handleUpdateWord = (updated: SavedWord) => {
    setSavedWords((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    if (authUser && !authUser.isAnonymous) {
      syncCloudWord(currentUserId, updated);
    }
  };

  const handleDeleteWord = (id: string) => {
    setSavedWords((prev) => prev.filter((w) => w.id !== id));
    if (authUser && !authUser.isAnonymous) {
      deleteCloudWord(currentUserId, id);
    }
  };

  const handleLaunchRoleplay = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setHasExplicitlySelectedScenario(true);
    setActiveTab('practice');
  };

  const handleLaunchVoiceRoom = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setHasExplicitlySelectedScenario(true);
    setActiveTab('live');
  };

  // Curriculum handlers
  const handleStartLesson = (unit: CurriculumUnit, lesson: CurriculumLesson) => {
    setActiveLesson({ unit, lesson });
  };

  const handleCompleteLesson = (result: {
    unitId: string;
    lessonId: string;
    score: number;
    completedAt: number;
    stepsCompleted: number;
    totalSteps: number;
  }) => {
    if (!activeLesson) return;

    const testedWords = (activeLesson.lesson.vocabulary || []).map((v) => ({
      id: v.id,
      word: v.word,
      translation: v.translation,
      correct: result.score >= 60,
    }));

    const { updatedProgress, newWordsToSave } = recordLessonCompletion(
      curriculumProgress,
      activeLesson.unit,
      activeLesson.lesson,
      {
        accuracy: result.score,
        testedWords,
      }
    );

    setCurriculumProgress(updatedProgress);
    saveCurriculumProgress(updatedProgress);

    // Award XP and record time
    const xpReward = Math.round(result.score * 0.5) + 30;
    handleAddXP(xpReward);
    setProgress((prev) => recordPracticeTime(prev, 5, `lesson-${result.lessonId}-${Date.now()}`));

    // Save vocabulary words to SRS
    newWordsToSave.forEach((w) => {
      handleSaveWord(w);
    });

    setActiveLesson(null);
  };

  const handleStartMilestone = (unit: CurriculumUnit) => {
    if (!unit.milestoneChallenge) return;
    const challengeScenario: Scenario = {
      id: `milestone-${unit.id}`,
      title: unit.milestoneChallenge.title,
      category: 'Daily Life',
      role: unit.milestoneChallenge.userRole,
      partnerRole: unit.milestoneChallenge.partnerRole,
      setting: unit.milestoneChallenge.setting,
      difficultyLevel: unit.level,
      objectives: unit.milestoneChallenge.requiredGoals,
      initialMessage: unit.milestoneChallenge.initialMessage,
      initialMessageTranslation: unit.milestoneChallenge.initialMessageTranslation,
      icon: 'Award',
      suggestedReplies: (unit.vocabularyTargets || []).slice(0, 3).map((v) => ({
        text: v.word,
        translation: v.translation,
      })),
    };

    setActiveScenario(challengeScenario);
    setHasExplicitlySelectedScenario(true);
    setActiveTab('live');
  };

  const handlePassTestOut = () => {
    if (!testOutUnit) return;
    const unitIdx = curriculumProgress.unlockedUnitIds.indexOf(testOutUnit.id);
    const updatedUnlocked = Array.from(
      new Set([...curriculumProgress.unlockedUnitIds, testOutUnit.id, `es-u${testOutUnit.order + 1}`])
    );
    const updatedCompleted = Array.from(
      new Set([...curriculumProgress.completedUnitIds, testOutUnit.id])
    );

    const updated: LearnerCurriculumProgress = {
      ...curriculumProgress,
      unlockedUnitIds: updatedUnlocked,
      completedUnitIds: updatedCompleted,
      unitScores: {
        ...curriculumProgress.unitScores,
        [testOutUnit.id]: 100,
      },
    };

    setCurriculumProgress(updated);
    saveCurriculumProgress(updated);
    setTestOutUnit(null);
  };

  const handleOpenPronunciationModal = (phrase: string) => {
    setPronunciationPhrase(phrase);
    setActiveTab('pronunciation');
  };

  const handleOpenDrills = (topic?: string) => {
    setActiveDrillTopic(topic);
    setActiveTab('drills');
  };

  if (bootState === 'initializing') {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-100 font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 mx-auto">
            <span className="font-extrabold text-2xl text-black">L</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-cyan-400 font-mono">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing LinguaFlow AI...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
      
      {/* 1. Global Navigation Bar (Hidden during full-bleed Live Voice session) */}
      {activeTab !== 'live' && (
        <Navbar
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          currentLevel={currentLevel}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          progress={progress}
          authUser={authUser}
          authState={authState}
          onOpenPreferences={() => setShowPreferences(true)}
        />
      )}

      {/* 2. Main Dynamic Content View */}
      <main className={`flex-1 w-full relative z-10 ${activeTab === 'live' ? 'p-0' : 'pb-20 lg:pb-12'}`}>
        {activeTab === 'home' && (
          <HomeDashboard
            currentLanguage={currentLanguage}
            nativeLanguage={nativeLanguage}
            currentLevel={currentLevel}
            progress={progress}
            savedWords={savedWords}
            currentScenario={activeScenario}
            hasExplicitlySelectedScenario={hasExplicitlySelectedScenario}
            curriculumProgress={curriculumProgress}
            onNavigate={setActiveTab}
            onStartLiveVoice={(sc) => {
              if (sc) {
                setActiveScenario(sc);
                setHasExplicitlySelectedScenario(true);
              }
              setActiveTab('live');
            }}
            onStartRoleplay={handleLaunchRoleplay}
            onStartPronunciationLab={(ph) => {
              if (ph) setPronunciationPhrase(ph);
              setActiveTab('pronunciation');
            }}
            onStartVocabReview={() => setActiveTab('vocab')}
            onStartDrills={handleOpenDrills}
            onStartCurriculumLesson={handleStartLesson}
          />
        )}

        {activeTab === 'learn' && (
          <CurriculumView
            language={currentLanguage}
            progress={curriculumProgress}
            onStartLesson={handleStartLesson}
            onStartMilestone={handleStartMilestone}
            onTestOutUnit={(u) => setTestOutUnit(u)}
          />
        )}

        {activeTab === 'live' && (
          <LiveVoiceRoom
            language={currentLanguage}
            nativeLanguage={nativeLanguage}
            level={currentLevel}
            scenario={activeScenario}
            selectedVoice={selectedVoice}
            onExit={() => setActiveTab('home')}
            onAddXP={handleAddXP}
            onFinishSession={handleFinishSession}
            onOpenVocabModal={(w, s) => setInspectingWord({ word: w, contextSentence: s })}
          />
        )}

        {activeTab === 'scenarios' && (
          <ScenarioSelector
            language={currentLanguage}
            currentLevel={currentLevel}
            onSelectScenario={handleLaunchRoleplay}
            onSelectVoiceRoom={handleLaunchVoiceRoom}
          />
        )}

        {activeTab === 'practice' && (
          <RoleplayChat
            language={currentLanguage}
            nativeLanguage={nativeLanguage}
            level={currentLevel}
            scenario={activeScenario}
            selectedVoice={selectedVoice}
            playbackSpeed={playbackSpeed}
            onAddXP={handleAddXP}
            onOpenVocabModal={(w, s) => setInspectingWord({ word: w, contextSentence: s })}
            onOpenPronunciationModal={handleOpenPronunciationModal}
            onFinishSession={handleFinishSession}
          />
        )}

        {activeTab === 'pronunciation' && (
          <PronunciationLab
            currentLanguage={currentLanguage}
            nativeLanguage={nativeLanguage}
            currentLevel={currentLevel}
            selectedVoice={selectedVoice}
            initialPhrase={pronunciationPhrase}
            onAddXP={handleAddXP}
            onOpenVocabModal={(w, s) => setInspectingWord({ word: w, contextSentence: s })}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabularyNotebook
            savedWords={savedWords}
            currentLanguage={currentLanguage}
            selectedVoice={selectedVoice}
            onUpdateWord={handleUpdateWord}
            onDeleteWord={handleDeleteWord}
            onAddXP={handleAddXP}
            onAddNewWord={handleSaveWord}
          />
        )}

        {activeTab === 'drills' && (
          <InteractiveDrills
            currentLanguage={currentLanguage}
            nativeLanguage={nativeLanguage}
            currentLevel={currentLevel}
            initialTopic={activeDrillTopic}
            onAddXP={handleAddXP}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutorCoach
            currentLanguage={currentLanguage}
            nativeLanguage={nativeLanguage}
            currentLevel={currentLevel}
            selectedVoice={selectedVoice}
            onAddXP={handleAddXP}
            onOpenVocabModal={(w, s) => setInspectingWord({ word: w, contextSentence: s })}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressAnalytics
            currentLanguage={currentLanguage}
            nativeLanguage={nativeLanguage}
            currentLevel={currentLevel}
            progress={progress}
            savedWords={savedWords}
            onNavigate={setActiveTab}
            onStartDrills={handleOpenDrills}
            onOpenPreferences={() => setShowPreferences(true)}
          />
        )}
      </main>

      {/* 3. Learning Preferences & Settings Modal */}
      {showPreferences && (
        <LearningPreferencesModal
          currentLanguage={currentLanguage}
          onSelectLanguage={setCurrentLanguage}
          nativeLanguage={nativeLanguage}
          onSelectNativeLanguage={setNativeLanguage}
          currentLevel={currentLevel}
          onSelectLevel={setCurrentLevel}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          playbackSpeed={playbackSpeed}
          onSelectSpeed={setPlaybackSpeed}
          dailyGoalMinutes={profile.dailyGoalMinutes || 15}
          onSelectDailyGoal={(mins) => {
            setProfile((prev) => ({ ...prev, dailyGoalMinutes: mins }));
            setProgress((prev) => ({ ...prev, dailyGoalMinutes: mins }));
          }}
          authUser={authUser}
          authState={authState}
          onSignInWithGoogle={handleSignInWithGoogle}
          onSignOut={handleSignOut}
          onOpenPlacement={() => setShowPlacement(true)}
          onClearTutorMemory={handleClearTutorMemory}
          onClearWeaknesses={handleClearWeaknesses}
          onClearVocabulary={handleClearVocabulary}
          onResetUserData={handleResetData}
          onClose={() => setShowPreferences(false)}
        />
      )}

      {/* 4. Onboarding / Profile Calibration Modal */}
      {showOnboarding && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={handleCompleteOnboarding}
          onClose={() => setShowOnboarding(false)}
          canClose={profile.hasCompletedOnboarding}
        />
      )}

      {/* 5. Placement Test Modal */}
      {showPlacement && (
        <PlacementTestModal
          currentLanguage={currentLanguage}
          nativeLanguage={nativeLanguage}
          currentLevel={currentLevel}
          onApplyLevel={setCurrentLevel}
          onClose={() => setShowPlacement(false)}
        />
      )}

      {/* 6. Global Word Inspector Modal */}
      {inspectingWord && (
        <WordInspectorModal
          word={inspectingWord.word}
          contextSentence={inspectingWord.contextSentence}
          currentLanguage={currentLanguage}
          nativeLanguage={nativeLanguage}
          selectedVoice={selectedVoice}
          isSaved={savedWords.some(
            (w) =>
              w.word.toLowerCase() === inspectingWord.word.toLowerCase() &&
              w.language === currentLanguage.id
          )}
          onSaveWord={handleSaveWord}
          onClose={() => setInspectingWord(null)}
        />
      )}

      {/* 7. Global Session Review Modal */}
      {sessionReviewStats && (
        <SessionReviewModal
          language={currentLanguage}
          nativeLanguage={nativeLanguage}
          level={currentLevel}
          stats={sessionReviewStats}
          onClose={() => setSessionReviewStats(null)}
          onStartDrills={handleOpenDrills}
          onAddXP={handleAddXP}
        />
      )}

      {/* 8. Interactive Curriculum Lesson Runner */}
      {activeLesson && (
        <LessonRunner
          unit={activeLesson.unit}
          lesson={activeLesson.lesson}
          language={currentLanguage}
          nativeLanguage={nativeLanguage}
          selectedVoice={selectedVoice}
          onComplete={handleCompleteLesson}
          onExit={() => setActiveLesson(null)}
        />
      )}

      {/* 9. Test Out Unit Modal */}
      {testOutUnit && (
        <TestOutModal
          unit={testOutUnit}
          language={currentLanguage}
          onPassed={handlePassTestOut}
          onClose={() => setTestOutUnit(null)}
        />
      )}

    </div>
  );
}
