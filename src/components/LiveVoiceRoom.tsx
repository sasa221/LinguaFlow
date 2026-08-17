import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  RotateCcw,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
  Volume2,
  BookmarkPlus,
  ArrowRight,
  MoreVertical,
  Check,
  Languages,
  ShieldCheck,
  Zap,
  ArrowDown,
  Sliders,
  HelpCircle,
  Compass,
} from 'lucide-react';
import {
  Language,
  NativeLanguage,
  ProficiencyLevel,
  Scenario,
  LiveCoachingLevel,
  LiveSessionState,
  SavedWord,
} from '../types';
import { floatTo16BitPCM, arrayBufferToBase64, LiveAudioPlayer } from '../utils/audioUtils';
import { tokenizeSentence } from '../utils/textTokenizer';
import { ConversationOrb } from './ConversationOrb';

interface LiveVoiceRoomProps {
  language: Language;
  nativeLanguage: NativeLanguage;
  level: ProficiencyLevel;
  scenario?: Scenario;
  selectedVoice: 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';
  onExit?: () => void;
  onAddXP: (amount: number, activityId?: string) => void;
  onFinishSession: (stats: {
    sessionId?: string;
    seconds: number;
    turns: number;
    scenarioTitle: string;
    transcript?: Array<{ sender: 'user' | 'ai'; text: string }>;
  }) => void;
  onOpenVocabModal: (word: string, contextSentence?: string) => void;
}

interface TranscriptEntry {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  translation?: string;
  timestamp: number;
}

interface MicroCorrection {
  id: string;
  original: string;
  corrected: string;
  reason: string;
  tryPhrase: string;
}

interface InlineWordDetail {
  word: string;
  translation: string;
  partOfSpeech?: string;
  definition: string;
  exampleTarget: string;
  exampleTranslation: string;
}

export const LiveVoiceRoom: React.FC<LiveVoiceRoomProps> = ({
  language,
  nativeLanguage,
  level,
  scenario,
  selectedVoice,
  onExit,
  onAddXP,
  onFinishSession,
  onOpenVocabModal,
}) => {
  const [sessionState, setSessionState] = useState<LiveSessionState>('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimUserText, setInterimUserText] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [showManualType, setShowManualType] = useState(false);
  const [manualText, setManualText] = useState('');
  const [userAnalyser, setUserAnalyser] = useState<AnalyserNode | null>(null);
  const [coachingLevel, setCoachingLevel] = useState<LiveCoachingLevel>('balanced');
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(true);
  const [showTranslations, setShowTranslations] = useState(coachingLevel === 'gentle');
  const [showObjectiveBanner, setShowObjectiveBanner] = useState(true);
  const [showHintDrawer, setShowHintDrawer] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [showDevDiagnostics, setShowDevDiagnostics] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [firstTimeHelperFaded, setFirstTimeHelperFaded] = useState(false);

  // In-session contextual coaching & word inspection
  const [activeCorrection, setActiveCorrection] = useState<MicroCorrection | null>(null);
  const [selectedWordDetail, setSelectedWordDetail] = useState<InlineWordDetail | null>(null);
  const [wordLookupLoading, setWordLookupLoading] = useState(false);
  const [savedWordIds, setSavedWordIds] = useState<Set<string>>(new Set());

  const sessionIdRef = useRef<string>('live-' + Date.now());
  const wsRef = useRef<WebSocket | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const connectTimeoutRef = useRef<any>(null);
  const currentVolumeRef = useRef<number>(0);

  const isConnected =
    sessionState !== 'idle' &&
    sessionState !== 'requesting_permission' &&
    sessionState !== 'connecting' &&
    sessionState !== 'ended' &&
    sessionState !== 'error';

  // Role names
  const partnerRoleName = scenario?.partnerRole || 'Conversation Partner';
  const userRoleName = scenario?.role || 'Learner';

  useEffect(() => {
    audioPlayerRef.current = new LiveAudioPlayer((playing) => {
      if (playing) {
        setSessionState('ai_speaking');
        setIsInterrupted(false);
      } else {
        setSessionState((prev) => (prev === 'ai_speaking' ? 'ready' : prev));
      }
    });

    return () => {
      stopCall();
      audioPlayerRef.current?.close();
    };
  }, []);

  // Update translation visibility when coaching level changes
  useEffect(() => {
    if (coachingLevel === 'gentle') {
      setShowTranslations(true);
    } else if (coachingLevel === 'immersion') {
      setShowTranslations(false);
    }
  }, [coachingLevel]);

  // Dev diagnostic shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        setShowDevDiagnostics((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fade initial helper after 6 seconds of connected state
  useEffect(() => {
    if (isConnected && !firstTimeHelperFaded) {
      const timer = setTimeout(() => setFirstTimeHelperFaded(true), 7000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, firstTimeHelperFaded]);

  // Auto-scroll transcript unless user scrolled up
  useEffect(() => {
    if (!isUserScrolledUp) {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimUserText, isUserScrolledUp]);

  // Session duration timer
  useEffect(() => {
    if (isConnected) {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isConnected]);

  const handleScroll = () => {
    if (!transcriptScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = transcriptScrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    setIsUserScrolledUp(!isAtBottom);
  };

  const scrollToBottom = () => {
    setIsUserScrolledUp(false);
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startCall = async () => {
    try {
      sessionIdRef.current = `live-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setSessionState('requesting_permission');
      setConnectionError(null);
      setTranscript([]);
      setCallDuration(0);
      setTurnCount(0);
      setActiveCorrection(null);
      setSelectedWordDetail(null);
      setFirstTimeHelperFaded(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      setSessionState('connecting');

      // Set connection timeout warning
      connectTimeoutRef.current = setTimeout(() => {
        if (sessionState === 'connecting') {
          setConnectionError('Connection taking longer than expected. Retrying...');
        }
      }, 9000);

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        ws.send(
          JSON.stringify({
            type: 'init',
            language: language.name,
            nativeLanguage: nativeLanguage.name,
            level: level,
            scenario: scenario || {
              title: 'Open Real-Time Conversation',
              role: userRoleName,
              partnerRole: partnerRoleName,
              setting: 'Friendly live voice conversation',
            },
            voice: selectedVoice,
            coachingLevel: coachingLevel,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ready') {
            setSessionState('ready');
            onAddXP(20, `live-start-${sessionIdRef.current}`);
            startAudioStreaming(stream);
            initWebSpeechRecognition();
          } else if (msg.type === 'audio' && msg.audio) {
            audioPlayerRef.current?.playChunk(msg.audio, 24000);
            setTurnCount((prev) => prev + 1);
          } else if (msg.type === 'interrupted') {
            audioPlayerRef.current?.stopAll();
            setIsInterrupted(true);
            setSessionState('interrupted');
            setTimeout(() => {
              setIsInterrupted(false);
              setSessionState('ready');
            }, 1200);
          } else if (msg.type === 'error') {
            console.error('Live API Error:', msg.message);
            setConnectionError(msg.message || 'Live session error occurred.');
            setSessionState('error');
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setConnectionError('Could not reach the Live Voice streaming server. Check network connection.');
        setSessionState('error');
      };

      ws.onclose = () => {
        if (sessionState !== 'ended' && sessionState !== 'idle') {
          setSessionState('ended');
        }
      };
    } catch (err: any) {
      console.error('Failed to start call:', err);
      setConnectionError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser to practice speaking.'
          : err.message || 'Failed to initialize voice session'
      );
      setSessionState('error');
    }
  };

  const startAudioStreaming = (stream: MediaStream) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtxClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const micAnalyser = audioCtx.createAnalyser();
      micAnalyser.fftSize = 256;
      micAnalyser.smoothingTimeConstant = 0.75;
      setUserAnalyser(micAnalyser);

      const scriptProcessor = audioCtx.createScriptProcessor(2048, 1, 1);
      scriptProcessorRef.current = scriptProcessor;
      isRecordingRef.current = true;

      scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
        if (!isRecordingRef.current || isMicMuted) return;

        const inputBuffer = audioProcessingEvent.inputBuffer;
        const channelData = inputBuffer.getChannelData(0);

        let sum = 0;
        for (let i = 0; i < channelData.length; i++) {
          sum += Math.abs(channelData[i]);
        }
        const avg = sum / channelData.length;
        const vol = Math.min(1, avg * 5);
        currentVolumeRef.current = vol;
        setUserVolume(vol);

        // Real-time Voice Activity Detection (VAD) & Barge-in trigger
        if (vol > 0.14) {
          if (sessionState === 'ai_speaking') {
            // Instant barge-in interruption!
            audioPlayerRef.current?.stopAll();
            setIsInterrupted(true);
            setSessionState('interrupted');
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'interrupt' }));
            }
            setTimeout(() => {
              setIsInterrupted(false);
              setSessionState('user_speaking');
            }, 600);
          } else if (sessionState === 'ready' || sessionState === 'listening') {
            setSessionState('user_speaking');
          }
        } else if (vol <= 0.05 && sessionState === 'user_speaking') {
          setSessionState('thinking');
          setTimeout(() => {
            setSessionState((prev) => (prev === 'thinking' ? 'ready' : prev));
          }, 1500);
        }

        const pcm16 = floatTo16BitPCM(channelData);
        const base64 = arrayBufferToBase64(pcm16);

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: 'audio',
              audio: base64,
            })
          );
        }
      };

      source.connect(micAnalyser);
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);
    } catch (e) {
      console.error('Error in audio processing setup:', e);
    }
  };

  const initWebSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language.speechCode || 'es-ES';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript.trim();
            if (finalTranscript) {
              setTranscript((prev) => [
                ...prev,
                {
                  id: 'usr-' + Date.now(),
                  sender: 'user',
                  text: finalTranscript,
                  timestamp: Date.now(),
                },
              ]);
              checkForMicroCorrection(finalTranscript);
            }
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setInterimUserText(interim);
      };

      recognition.onend = () => {
        if (isRecordingRef.current && isConnected) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.log('Web Speech recognition note:', e);
    }
  };

  // Progressive micro-correction check (non-blocking, unobtrusive)
  const checkForMicroCorrection = (userSentence: string) => {
    // Generate helpful correction if appropriate based on common patterns
    if (userSentence.length > 8 && coachingLevel !== 'immersion') {
      const lower = userSentence.toLowerCase();
      if (lower.includes('yo querer') || lower.includes('yo tener hambre')) {
        setActiveCorrection({
          id: 'corr-' + Date.now(),
          original: userSentence,
          corrected: userSentence.replace(/yo querer/i, 'Quisiera').replace(/yo tener/i, 'Tengo'),
          reason: 'In natural Spanish, express requests using "Quisiera" or conjugated forms without redundant pronouns.',
          tryPhrase: 'Quisiera un café, por favor.',
        });
      }
    }
  };

  const stopCall = () => {
    isRecordingRef.current = false;
    setUserAnalyser(null);
    setUserVolume(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    audioPlayerRef.current?.stopAll();
    setSessionState('ended');

    if (callDuration > 5) {
      onFinishSession({
        sessionId: sessionIdRef.current,
        seconds: callDuration,
        turns: turnCount,
        scenarioTitle: scenario?.title || 'Daily Voice Immersion',
        transcript: transcript.map((t) => ({ sender: t.sender, text: t.text })),
      });
    }
  };

  const toggleMic = () => {
    setIsMicMuted((prev) => !prev);
  };

  const handleSendManual = () => {
    const text = manualText.trim();
    if (!text) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: text,
        })
      );
      setTranscript((prev) => [
        ...prev,
        {
          id: 'usr-prompt-' + Date.now(),
          sender: 'user',
          text: text,
          timestamp: Date.now(),
        },
      ]);
      setManualText('');
      setShowManualType(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Inspect word in non-destructive slide-over side drawer
  const handleWordClick = async (cleanWord: string, sentenceText: string) => {
    setWordLookupLoading(true);
    setSelectedWordDetail({
      word: cleanWord,
      translation: 'Looking up translation...',
      definition: 'Retrieving context definition...',
      exampleTarget: sentenceText,
      exampleTranslation: '',
    });

    try {
      const res = await fetch('/api/word/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: cleanWord,
          sentence: sentenceText,
          language: language.name,
          nativeLanguage: nativeLanguage.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedWordDetail({
          word: data.word || cleanWord,
          translation: data.translation || 'Translation available',
          partOfSpeech: data.partOfSpeech,
          definition: data.definition || 'Definition in target context',
          exampleTarget: data.exampleTarget || sentenceText,
          exampleTranslation: data.exampleTranslation || '',
        });
      }
    } catch (e) {
      setSelectedWordDetail((prev) =>
        prev
          ? {
              ...prev,
              translation: 'Vocabulary term',
              definition: 'Context word from live dialogue.',
            }
          : null
      );
    } finally {
      setWordLookupLoading(false);
    }
  };

  const handleSaveCurrentWord = () => {
    if (!selectedWordDetail) return;
    const newWord: SavedWord = {
      id: `word-${language.id}-${selectedWordDetail.word.toLowerCase()}`,
      word: selectedWordDetail.word,
      translation: selectedWordDetail.translation,
      language: language.id,
      partOfSpeech: selectedWordDetail.partOfSpeech || 'noun',
      definition: selectedWordDetail.definition,
      contextSentence: selectedWordDetail.exampleTarget,
      masteryLevel: 0,
      easeFactor: 2.5,
      intervalDays: 1,
      dateAdded: Date.now(),
      lastReviewedDate: Date.now(),
      nextReviewDate: Date.now() + 86400000,
    };
    onOpenVocabModal(selectedWordDetail.word, selectedWordDetail.exampleTarget);
    setSavedWordIds((prev) => new Set([...prev, selectedWordDetail.word.toLowerCase()]));
    onAddXP(10, `save-word-${selectedWordDetail.word}`);
  };

  // Tiered hints based on CEFR level
  const getContextualHints = () => {
    if (level === 'A1' || level === 'A2') {
      return [
        {
          tier: 'Simple (A1)',
          target: language.id === 'spanish' ? 'Sí, por favor.' : 'Yes, please.',
          translation: 'Yes, please.',
        },
        {
          tier: 'Natural (A2)',
          target: language.id === 'spanish' ? 'Quisiera un café con leche.' : 'I would like a coffee with milk.',
          translation: 'I would like a coffee with milk.',
        },
        {
          tier: 'Question',
          target: language.id === 'spanish' ? '¿Cuánto cuesta?' : 'How much is it?',
          translation: 'How much does it cost?',
        },
      ];
    } else if (level === 'B1' || level === 'B2') {
      return [
        {
          tier: 'Conversational (B1)',
          target: language.id === 'spanish' ? 'Me gustaría probar la especialidad de la casa.' : 'I would like to try the house special.',
          translation: 'I would like to try the house specialty.',
        },
        {
          tier: 'Natural (B2)',
          target: language.id === 'spanish' ? '¿Qué me recomiendas para acompañar el desayuno?' : 'What do you recommend to go with breakfast?',
          translation: 'What do you recommend for breakfast?',
        },
        {
          tier: 'Nuanced',
          target: language.id === 'spanish' ? 'Si no es mucha molestia, ¿puedo pedirlo para llevar?' : 'If it is no trouble, can I have it to go?',
          translation: 'If it is not much trouble, can I get it to go?',
        },
      ];
    } else {
      return [
        {
          tier: 'Fluent (C1)',
          target: language.id === 'spanish' ? 'Agradezco la recomendación, me inclino por la opción artesanal.' : 'I appreciate the recommendation, I lean towards the artisanal option.',
          translation: 'I appreciate the recommendation, I lean towards the artisanal choice.',
        },
        {
          tier: 'Idiomatic (C1+)',
          target: language.id === 'spanish' ? 'Queda a tu criterio, confío plenamente en el barista.' : 'It is up to your judgment, I trust the barista completely.',
          translation: "It's at your discretion, I trust the barista completely.",
        },
      ];
    }
  };

  // State presentation
  const getStatePresentation = () => {
    switch (sessionState) {
      case 'idle':
        return {
          title: 'Ready when you are',
          helper: 'Start a natural, patient conversation calibrated to your level.',
          badge: 'Ready to connect',
          badgeColor: 'text-slate-400 bg-white/5 border-white/10',
        };
      case 'requesting_permission':
        return {
          title: 'Enabling microphone…',
          helper: 'Please grant microphone access in your browser prompt.',
          badge: 'Microphone permission',
          badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'connecting':
        return {
          title: 'Connecting to your partner…',
          helper: `Setting up voice line with ${partnerRoleName} in ${language.name}.`,
          badge: 'Connecting Live',
          badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
        };
      case 'ready':
      case 'listening':
        return {
          title: 'Listening',
          helper: !firstTimeHelperFaded ? 'Speak naturally — you can interrupt anytime.' : '',
          badge: 'Live • Listening',
          badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        };
      case 'user_speaking':
        return {
          title: "You're speaking",
          helper: 'Microphone active. AI is listening attentively.',
          badge: 'Your turn',
          badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        };
      case 'thinking':
        return {
          title: 'Thinking…',
          helper: `${partnerRoleName} is processing your response.`,
          badge: 'Processing',
          badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
        };
      case 'ai_speaking':
        return {
          title: 'Speaking',
          helper: 'You can speak at any moment to interrupt naturally.',
          badge: `${partnerRoleName} speaking`,
          badgeColor: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30',
        };
      case 'interrupted':
        return {
          title: "I'm listening",
          helper: 'Barge-in recognized. Conversation flows seamlessly.',
          badge: 'Barge-in',
          badgeColor: 'text-purple-300 bg-purple-500/15 border-purple-500/30',
        };
      case 'reconnecting':
        return {
          title: 'Connection interrupted',
          helper: 'Trying to reconnect automatically…',
          badge: 'Reconnecting',
          badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      case 'error':
        return {
          title: 'Connection issue',
          helper: connectionError || 'Could not complete audio stream.',
          badge: 'Error',
          badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        };
      case 'ended':
        return {
          title: 'Conversation completed',
          helper: 'Preparing session fluency report…',
          badge: 'Ended',
          badgeColor: 'text-slate-400 bg-white/5 border-white/10',
        };
    }
  };

  const stateInfo = getStatePresentation();

  return (
    <div className="relative w-full min-h-[calc(100vh-2rem)] md:min-h-screen flex flex-col justify-between bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black overflow-hidden">
      
      {/* 1. Immersive Compact Top Bar */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl z-30">
        
        {/* Left: Scenario & Role Context */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-md shadow-cyan-500/10">
            {language.flag || '🗣'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {scenario?.title || 'Open Conversation'}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300 font-bold">
                {language.id.toUpperCase()} • {level}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Speaking with <strong className="text-slate-200">{partnerRoleName}</strong> as <span className="text-slate-300">{userRoleName}</span>
            </p>
          </div>
        </div>

        {/* Center: Live Timer & State Pill */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${stateInfo.badgeColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{isConnected ? formatTimer(callDuration) : stateInfo.badge}</span>
          </div>
        </div>

        {/* Right: Actions (Settings, End/Exit) */}
        <div className="flex items-center gap-2">
          {/* Translation Toggle */}
          {isConnected && (
            <button
              onClick={() => setShowTranslations((prev) => !prev)}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                showTranslations
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={showTranslations ? 'Hide English translations' : 'Show English translations'}
              aria-label="Toggle translations"
            >
              <Languages className="w-4 h-4" />
            </button>
          )}

          {/* More Settings Menu */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs cursor-pointer transition-all"
              title="Coaching settings"
              aria-label="Coaching settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-11 w-56 p-3 rounded-2xl bg-[#090d16] border border-white/10 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-3 animate-in fade-in zoom-in-95">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                    Coaching Pace
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
                    {(['immersion', 'balanced', 'gentle'] as LiveCoachingLevel[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => {
                          setCoachingLevel(mode);
                          setShowSettingsMenu(false);
                        }}
                        className={`py-1 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                          coachingLevel === mode
                            ? 'bg-cyan-400 text-black shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-slate-400">
                  <span>Voice Model</span>
                  <span className="font-mono text-cyan-300 font-bold">{selectedVoice}</span>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      setShowDevDiagnostics((prev) => !prev);
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-cyan-300 py-1"
                  >
                    {showDevDiagnostics ? 'Hide Dev Diagnostics' : 'Show Dev Diagnostics (Ctrl+Shift+D)'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exit / End button */}
          {isConnected ? (
            <button
              onClick={() => setShowEndConfirmModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer"
            >
              End Call
            </button>
          ) : (
            <button
              onClick={onExit}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Return to Explore"
              aria-label="Return to Explore"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Main Conversation Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col items-center justify-between z-10 relative">
        
        {/* Scenario Objective Pill (Collapsible) */}
        {scenario && showObjectiveBanner && (
          <div className="w-full max-w-xl mb-2 px-4 py-2.5 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 backdrop-blur-md flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2 text-cyan-300 font-medium">
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                <strong className="text-white">Goal:</strong> {scenario.objective || `Converse naturally in ${scenario.title}`}
              </span>
            </div>
            <button
              onClick={() => setShowObjectiveBanner(false)}
              className="text-slate-500 hover:text-slate-300 ml-2 cursor-pointer"
              title="Dismiss goal"
            >
              ✕
            </button>
          </div>
        )}

        {/* Central Magical Conversation Orb */}
        <div className="flex flex-col items-center justify-center my-auto py-4 space-y-3">
          <div className="relative">
            <ConversationOrb
              sessionState={sessionState}
              userAnalyser={userAnalyser}
              aiAnalyser={audioPlayerRef.current?.getAnalyser() || null}
              isMicMuted={isMicMuted}
              isInterrupted={isInterrupted}
              userVolume={userVolume}
              size={210}
              onClick={!isConnected && sessionState !== 'connecting' ? startCall : undefined}
            />
          </div>

          {/* Spoken State Typography */}
          <div className="text-center max-w-md space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {stateInfo.title}
            </h2>
            {stateInfo.helper && (
              <p className="text-xs text-slate-400 leading-relaxed font-normal animate-in fade-in">
                {stateInfo.helper}
              </p>
            )}
          </div>
        </div>

        {/* 3. Conversational Waterfall Transcript */}
        <div className="w-full max-w-2xl flex-1 max-h-[36vh] sm:max-h-[38vh] flex flex-col relative my-2">
          
          {/* Inline Micro-Correction Chip */}
          {activeCorrection && (
            <div className="mb-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-center justify-between shadow-lg backdrop-blur-md animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">
                  <strong>Quick fix:</strong> <span className="line-through text-slate-400">{activeCorrection.original}</span> ➔ <strong className="text-amber-300">{activeCorrection.corrected}</strong>
                </span>
              </div>
              <button
                onClick={() => setActiveCorrection(null)}
                className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Waterfall Scroll Area */}
          <div
            ref={transcriptScrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-1 space-y-4 rounded-2xl bg-black/30 border border-white/5 p-4 sm:p-5 backdrop-blur-md shadow-inner text-xs"
          >
            {transcript.length === 0 && !interimUserText && isConnected && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-6">
                <p>Conversation transcribes here cleanly in real time.</p>
                <p className="text-[11px] text-slate-600 mt-1">Tap any word to inspect meaning or save to your notebook.</p>
              </div>
            )}

            {transcript.map((entry, idx) => {
              const isLatest = idx === transcript.length - 1;
              const isUser = entry.sender === 'user';

              return (
                <div
                  key={entry.id}
                  className={`transition-opacity duration-300 ${
                    isLatest ? 'opacity-100' : 'opacity-75 hover:opacity-100'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <span>{isUser ? 'You' : partnerRoleName}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-[9px] text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* High-Contrast Target Language Text */}
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                    {tokenizeSentence(entry.text, language.id).map((tok, i) =>
                      tok.isWord ? (
                        <span
                          key={i}
                          onClick={() => handleWordClick(tok.cleanWord, entry.text)}
                          className={`hover:text-cyan-300 hover:underline cursor-pointer transition-colors ${
                            savedWordIds.has(tok.cleanWord.toLowerCase()) ? 'text-cyan-300 font-semibold' : ''
                          }`}
                          title="Tap to inspect word"
                        >
                          {tok.text}
                        </span>
                      ) : (
                        <span key={i}>{tok.text}</span>
                      )
                    )}
                  </p>

                  {/* Secondary Translation */}
                  {showTranslations && (
                    <p className="text-xs text-slate-400 mt-1 italic leading-normal">
                      {entry.translation || '…'}
                    </p>
                  )}
                </div>
              );
            })}

            {/* Active Interim Provisional User Speech */}
            {interimUserText && (
              <div className="opacity-90 animate-pulse">
                <div className="text-[10px] font-mono font-bold text-blue-400 mb-1">
                  You (speaking…)
                </div>
                <p className="text-sm sm:text-base font-medium text-blue-300 italic leading-relaxed">
                  {interimUserText}
                </p>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Floating 'Scroll to Latest' Indicator */}
          {isUserScrolledUp && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-cyan-500 text-black font-bold text-xs flex items-center gap-1 shadow-lg shadow-cyan-500/30 cursor-pointer animate-in fade-in"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>Latest</span>
            </button>
          )}
        </div>

        {/* 4. Non-Destructive In-Room Slide-Over Word Drawer */}
        {selectedWordDetail && (
          <div className="w-full max-w-2xl mt-2 p-4 rounded-2xl bg-[#0b1120] border border-cyan-500/30 shadow-2xl backdrop-blur-xl z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-cyan-300 font-sans">
                  {selectedWordDetail.word}
                </span>
                {selectedWordDetail.partOfSpeech && (
                  <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-slate-400">
                    {selectedWordDetail.partOfSpeech}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-200">{selectedWordDetail.translation}</p>
              <p className="text-[11px] text-slate-400 italic">"{selectedWordDetail.exampleTarget}"</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={handleSaveCurrentWord}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{savedWordIds.has(selectedWordDetail.word.toLowerCase()) ? 'Saved' : 'Save (+10 XP)'}</span>
              </button>
              <button
                onClick={() => setSelectedWordDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 5. Contextual Hints Drawer */}
        {showHintDrawer && (
          <div className="w-full max-w-2xl mt-2 p-4 rounded-2xl bg-[#070b14] border border-cyan-500/30 shadow-2xl backdrop-blur-xl z-20 space-y-2.5 animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 font-bold text-xs text-white">
                <Lightbulb className="w-4 h-4 text-cyan-400" />
                <span>Suggested Responses ({level})</span>
              </div>
              <button
                onClick={() => setShowHintDrawer(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {getContextualHints().map((h, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 flex flex-col justify-between gap-1 transition-all"
                >
                  <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    {h.tier}
                  </div>
                  <p className="text-xs text-white font-medium">{h.target}</p>
                  {showTranslations && <p className="text-[10px] text-slate-400 italic">{h.translation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Box if needed */}
        {connectionError && (
          <div className="w-full max-w-xl p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 z-10 my-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{connectionError}</span>
            </div>
            <button
              onClick={startCall}
              className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* 6. Minimal Bottom Controls */}
        <div className="w-full max-w-xl pt-3 pb-2 flex items-center justify-center gap-4 z-10">
          {!isConnected ? (
            <button
              onClick={startCall}
              disabled={sessionState === 'connecting' || sessionState === 'requesting_permission'}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-extrabold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 cursor-pointer disabled:opacity-50 flex items-center gap-3"
            >
              <Mic className="w-5 h-5" />
              <span>{sessionState === 'connecting' ? 'Connecting to partner…' : 'Start conversation'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Need a hint button */}
              <button
                onClick={() => setShowHintDrawer((prev) => !prev)}
                className={`px-4 py-3 rounded-full border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  showHintDrawer
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
                }`}
                title="Need a hint?"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Need a hint?</span>
              </button>

              {/* Primary Microphone Button */}
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full border transition-all cursor-pointer shadow-lg ${
                  isMicMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-rose-500/20'
                    : 'bg-gradient-to-tr from-cyan-500 to-blue-600 border-cyan-400 text-black shadow-cyan-500/30 hover:scale-105'
                }`}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* End Session Button */}
              <button
                onClick={() => setShowEndConfirmModal(true)}
                className="px-4 py-3 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                title="End session"
              >
                <PhoneOff className="w-4 h-4" />
                <span className="hidden sm:inline">End session</span>
              </button>

              {/* Fallback Text Toggle */}
              <button
                onClick={() => setShowManualType((prev) => !prev)}
                className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white cursor-pointer"
                title="Type message"
                aria-label="Type message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Manual Keyboard Input Bar (if open) */}
        {showManualType && isConnected && (
          <div className="w-full max-w-xl flex gap-2 z-10 pt-2 animate-in slide-in-from-bottom-2">
            <input
              type="text"
              placeholder={`Type in ${language.name}...`}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendManual()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendManual}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs hover:bg-cyan-300 cursor-pointer"
            >
              Send
            </button>
          </div>
        )}

        {/* Dev-Only Diagnostics Panel (Strictly developer inspection) */}
        {showDevDiagnostics && (
          <div className="w-full max-w-xl p-3.5 rounded-2xl bg-black/90 border border-cyan-500/40 text-cyan-400 font-mono text-[11px] space-y-1.5 shadow-2xl backdrop-blur-md z-30 mt-2">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-1 text-white font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>DEV DIAGNOSTICS</span>
              </span>
              <button
                onClick={() => setShowDevDiagnostics(false)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
              <div>State: <span className="text-white font-sans">{sessionState}</span></div>
              <div>
                WebSocket:{' '}
                <span className={wsRef.current?.readyState === WebSocket.OPEN ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {wsRef.current?.readyState === WebSocket.OPEN ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
              <div>
                Microphone:{' '}
                <span className={!isMicMuted && isRecordingRef.current ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {!isMicMuted && isRecordingRef.current ? 'ACTIVE' : 'MUTED/INACTIVE'}
                </span>
              </div>
              <div>Input Rate: <span className="text-white">{inputAudioCtxRef.current?.sampleRate || 16000} Hz</span></div>
              <div>
                AudioContexts:{' '}
                <span className="text-white">
                  {(inputAudioCtxRef.current ? 1 : 0) + (audioPlayerRef.current?.getAudioContext() ? 1 : 0)} active
                </span>
              </div>
              <div>Queue Depth: <span className="text-white">{audioPlayerRef.current?.getQueueLength() || 0} chunks</span></div>
            </div>
            <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1 truncate">
              Session ID: <span className="text-cyan-300 font-mono">{sessionIdRef.current}</span>
            </div>
          </div>
        )}

      </main>

      {/* 7. End Session Confirmation Modal */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-[#090d16] border border-white/10 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <PhoneOff className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Finish this conversation?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You’ve completed <strong className="text-white">{formatTimer(callDuration)}</strong> of spoken immersion. Would you like to generate your fluency review?
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setShowEndConfirmModal(false);
                  stopCall();
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Finish & Review
              </button>
              <button
                onClick={() => setShowEndConfirmModal(false)}
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Continue speaking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
