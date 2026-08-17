import { CurriculumUnit, LanguageCurriculumDefinition } from '../../types';
import { SPANISH_A0_UNITS } from './spanishCurriculum';
import { FRENCH_A0_UNITS, JAPANESE_A0_UNITS, GERMAN_A0_UNITS, ARABIC_A0_UNITS } from './otherCurricula';
import { ITALIAN_A0_UNITS } from './languages/italianCurriculum';
import { KOREAN_A0_UNITS } from './languages/koreanCurriculum';
import { PORTUGUESE_A0_UNITS } from './languages/portugueseCurriculum';
import { RUSSIAN_A0_UNITS } from './languages/russianCurriculum';
import { CHINESE_A0_UNITS } from './languages/chineseCurriculum';
import { ENGLISH_A0_UNITS } from './languages/englishCurriculum';
import { SCRIPT_TRACKS_REGISTRY } from './scriptTracks';
import { PRONUNCIATION_TRACKS_REGISTRY } from './pronunciationTracks';

export const CURRICULA_REGISTRY: Record<string, CurriculumUnit[]> = {
  spanish: SPANISH_A0_UNITS,
  french: FRENCH_A0_UNITS,
  german: GERMAN_A0_UNITS,
  italian: ITALIAN_A0_UNITS,
  japanese: JAPANESE_A0_UNITS,
  korean: KOREAN_A0_UNITS,
  'arabic-msa': ARABIC_A0_UNITS,
  arabic: ARABIC_A0_UNITS,
  portuguese: PORTUGUESE_A0_UNITS,
  russian: RUSSIAN_A0_UNITS,
  chinese: CHINESE_A0_UNITS,
  english: ENGLISH_A0_UNITS,
};

export const LANGUAGE_CURRICULA_DEFINITIONS: Record<string, LanguageCurriculumDefinition> = {
  spanish: {
    languageId: 'spanish',
    languageCode: 'es',
    languageName: 'Spanish',
    curriculumVersion: '1.2.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: SPANISH_A0_UNITS,
        levelCanDo: ['Greet and introduce yourself', 'Count and state age', 'Express origin and city', 'State likes and dislikes', 'Order at a café', 'Ask essential questions'],
      },
    },
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.spanish,
  },
  french: {
    languageId: 'french',
    languageCode: 'fr',
    languageName: 'French',
    curriculumVersion: '1.1.0',
    qualityStatus: 'BETA',
    levels: {
      A0: {
        units: FRENCH_A0_UNITS,
        levelCanDo: ['Polite greetings and thank you', 'State name with Je m\'appelle'],
      },
    },
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.french,
  },
  german: {
    languageId: 'german',
    languageCode: 'de',
    languageName: 'German',
    curriculumVersion: '1.1.0',
    qualityStatus: 'BETA',
    levels: {
      A0: {
        units: GERMAN_A0_UNITS,
        levelCanDo: ['Polite German greetings', 'Basic bakery interaction with Bitte and Danke'],
      },
    },
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.german,
  },
  italian: {
    languageId: 'italian',
    languageCode: 'it',
    languageName: 'Italian',
    curriculumVersion: '1.0.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: ITALIAN_A0_UNITS,
        levelCanDo: ['Ciao, Buongiorno, Grazie and Per favore', 'Introduce self with Mi chiamo and Piacere'],
      },
    },
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.italian,
  },
  japanese: {
    languageId: 'japanese',
    languageCode: 'ja',
    languageName: 'Japanese',
    curriculumVersion: '1.1.0',
    qualityStatus: 'BETA',
    levels: {
      A0: {
        units: JAPANESE_A0_UNITS,
        levelCanDo: ['Polite greetings with Konnichiwa and Arigatou', 'Pardon with Sumimasen'],
      },
    },
    scriptTrack: SCRIPT_TRACKS_REGISTRY.japanese,
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.japanese,
  },
  korean: {
    languageId: 'korean',
    languageCode: 'ko',
    languageName: 'Korean',
    curriculumVersion: '1.0.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: KOREAN_A0_UNITS,
        levelCanDo: ['Polite greetings with Annyeonghaseyo and Gamsahamnida', 'State identity with Jeoneun ... ieyo'],
      },
    },
    scriptTrack: SCRIPT_TRACKS_REGISTRY.korean,
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.korean,
  },
  'arabic-msa': {
    languageId: 'arabic-msa',
    languageCode: 'ar',
    languageName: 'Arabic',
    curriculumVersion: '1.1.0',
    qualityStatus: 'BETA',
    levels: {
      A0: {
        units: ARABIC_A0_UNITS,
        levelCanDo: ['Polite Arabic greetings with Marhaban and Shukran', 'Polite requests with Min fadlak'],
      },
    },
    scriptTrack: SCRIPT_TRACKS_REGISTRY['arabic-msa'],
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY['arabic-msa'],
  },
  portuguese: {
    languageId: 'portuguese',
    languageCode: 'pt',
    languageName: 'Portuguese (Brazilian)',
    curriculumVersion: '1.0.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: PORTUGUESE_A0_UNITS,
        levelCanDo: ['Everyday Brazilian greetings with Oi and Bom dia', 'State name with Meu nome é and say Prazer'],
      },
    },
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.portuguese,
  },
  russian: {
    languageId: 'russian',
    languageCode: 'ru',
    languageName: 'Russian',
    curriculumVersion: '1.0.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: RUSSIAN_A0_UNITS,
        levelCanDo: ['Formal and informal greetings (Здравствуйте and Привет)', 'State name with Меня зовут and say Очень приятно'],
      },
    },
    scriptTrack: SCRIPT_TRACKS_REGISTRY.russian,
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.russian,
  },
  chinese: {
    languageId: 'chinese',
    languageCode: 'zh',
    languageName: 'Chinese (Mandarin)',
    curriculumVersion: '1.0.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: CHINESE_A0_UNITS,
        levelCanDo: ['Nǐ hǎo and Xièxie with accurate tone contour', 'State name with Wǒ jiào and say Rènshi nǐ hěn gāoxìng'],
      },
    },
    scriptTrack: SCRIPT_TRACKS_REGISTRY.chinese,
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.chinese,
  },
  english: {
    languageId: 'english',
    languageCode: 'en',
    languageName: 'English',
    curriculumVersion: '1.0.0',
    qualityStatus: 'VALIDATED',
    levels: {
      A0: {
        units: ENGLISH_A0_UNITS,
        levelCanDo: ['Polite greetings with Hello and Thank you', 'State name with My name is and say Nice to meet you'],
      },
    },
    pronunciationTrack: PRONUNCIATION_TRACKS_REGISTRY.english,
  },
};

export function getCurriculumDefinition(languageId: string): LanguageCurriculumDefinition | undefined {
  const norm = (languageId || 'spanish').toLowerCase();
  return LANGUAGE_CURRICULA_DEFINITIONS[norm] || LANGUAGE_CURRICULA_DEFINITIONS['spanish'];
}

export function getCurriculumForLanguage(languageId: string): CurriculumUnit[] {
  const norm = (languageId || 'spanish').toLowerCase();
  if (CURRICULA_REGISTRY[norm]) {
    return CURRICULA_REGISTRY[norm];
  }
  // Default to Spanish curriculum if not yet defined
  return SPANISH_A0_UNITS;
}

export function getUnitById(languageId: string, unitId: string): CurriculumUnit | undefined {
  const units = getCurriculumForLanguage(languageId);
  return units.find((u) => u.id === unitId);
}

export function getLessonById(
  languageId: string,
  lessonId: string
): { unit: CurriculumUnit; lesson: CurriculumUnit['lessons'][0] } | undefined {
  const units = getCurriculumForLanguage(languageId);
  for (const unit of units) {
    const lesson = unit.lessons.find((l) => l.id === lessonId);
    if (lesson) {
      return { unit, lesson };
    }
  }
  return undefined;
}
