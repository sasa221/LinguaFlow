import { PronunciationTrack } from '../../types';

export const PRONUNCIATION_TRACKS_REGISTRY: Record<string, PronunciationTrack> = {
  spanish: {
    id: 'pt_es',
    languageId: 'spanish',
    title: 'Spanish Phonetics & Rhythms',
    overview: 'Master the 5 pure Spanish vowels, rolled RR, and regional variations without English diphthongs.',
    keyPhonemes: [
      {
        id: 'p_es_vowels',
        title: 'The 5 Pure Vowels (A, E, I, O, U)',
        soundIpa: '/a/ /e/ /i/ /o/ /u/',
        soundName: 'Pure Monophthongs',
        description: 'Never glide or diphthongize your vowels. They are short, crisp, and pure.',
        mouthPositionTip: 'Keep your jaw firm and do not let your mouth close at the end of the vowel.',
        comparisonWithEnglish: 'Unlike English "say" (/seɪ/), Spanish "sé" is pure /se/.',
        sampleWords: [
          { word: 'casa', translation: 'house', tip: 'Both "a"s are identical open sounds.' },
          { word: 'mesa', translation: 'table' },
          { word: 'libro', translation: 'book' },
          { word: 'sol', translation: 'sun' },
          { word: 'luz', translation: 'light' },
        ],
      },
      {
        id: 'p_es_rr',
        title: 'The Alveolar Trill (RR / Single R)',
        soundIpa: '/r/ and /ɾ/',
        soundName: 'Rolled Double R and Tap R',
        description: 'Vibrate the tip of the tongue against the alveolar ridge behind your upper teeth.',
        mouthPositionTip: 'Relax the tip of your tongue; let the exhaled air stream make it flutter effortlessly.',
        minimalPairs: [
          { wordA: 'pero', wordB: 'perro', meaningA: 'but (tap r)', meaningB: 'dog (rolled rr)' },
          { wordA: 'caro', wordB: 'carro', meaningA: 'expensive', meaningB: 'car' },
        ],
        sampleWords: [
          { word: 'gracias', translation: 'thank you (tap)' },
          { word: 'arriba', translation: 'up / above (trill)' },
        ],
      },
    ],
  },
  french: {
    id: 'pt_fr',
    languageId: 'french',
    title: 'French Phonetics & Nasal Resonances',
    overview: 'Learn French nasal vowels, uvular R, silent endings, and fluid liaison linkages.',
    keyPhonemes: [
      {
        id: 'p_fr_nasals',
        title: 'Nasal Vowels (an, on, in, un)',
        soundIpa: '/ɑ̃/ /ɔ̃/ /ɛ̃/',
        soundName: 'French Nasal Vowels',
        description: 'Lower your soft palate (velum) so air flows simultaneously through nose and mouth without closing with an "N" consonant.',
        mouthPositionTip: 'Do not touch your tongue to the roof of your mouth; keep the sound flowing through the nasal cavity.',
        sampleWords: [
          { word: 'bonjour', translation: 'hello (nasal on)' },
          { word: 'pain', translation: 'bread (nasal in)' },
          { word: 'enfant', translation: 'child (nasal an)' },
        ],
      },
      {
        id: 'p_fr_uvular_r',
        title: 'The French Uvular R',
        soundIpa: '/ʁ/',
        soundName: 'Voiced Uvular Fricative',
        description: 'Produced at the back of the throat near the uvula, like a gentle gargle without water.',
        mouthPositionTip: 'Raise the back of your tongue lightly toward the uvula while exhaling gently.',
        sampleWords: [
          { word: 'merci', translation: 'thank you' },
          { word: 'rouge', translation: 'red' },
          { word: 'croissant', translation: 'croissant' },
        ],
      },
    ],
  },
  german: {
    id: 'pt_de',
    languageId: 'german',
    title: 'German Articulation & Umlauts',
    overview: 'Master rounded Umlauts (ä, ö, ü), the Ich-Laut vs Ach-Laut, and glottal stop word onsets.',
    keyPhonemes: [
      {
        id: 'p_de_umlauts',
        title: 'Umlauts (Ö and Ü)',
        soundIpa: '/ø/ /y/',
        soundName: 'Front Rounded Vowels',
        description: 'Shape your tongue for "ee" or "ay", but round your lips tightly as if saying "oo".',
        mouthPositionTip: 'Hold the "ee" tongue position while puckering your lips into a tight circle.',
        sampleWords: [
          { word: 'schön', translation: 'beautiful (Ö)' },
          { word: 'tschüss', translation: 'bye (Ü)' },
          { word: 'über', translation: 'over / about (Ü)' },
        ],
      },
      {
        id: 'p_de_ich_ach',
        title: 'The Ich-Laut /ç/ vs Ach-Laut /x/',
        soundIpa: '/ç/ and /x/',
        soundName: 'German CH sounds',
        description: 'Soft palate friction after front vowels (ich, nicht), throat friction after back vowels (Buch, Bach).',
        mouthPositionTip: 'Whisper "hue" in English for /ç/. Clear your throat lightly for /x/.',
        sampleWords: [
          { word: 'ich', translation: 'I (/ç/)' },
          { word: 'nicht', translation: 'not (/ç/)' },
          { word: 'auch', translation: 'also (/x/)' },
        ],
      },
    ],
  },
  italian: {
    id: 'pt_it',
    languageId: 'italian',
    title: 'Italian Musical Cadence & Double Consonants',
    overview: 'Double consonant holding (gemination), open vs closed vowels, and musical sentence intonation.',
    keyPhonemes: [
      {
        id: 'p_it_geminates',
        title: 'Double Consonants (Gemination)',
        soundIpa: '/tt/ /pp/ /kk/ /ll/',
        soundName: 'Held Consonants',
        description: 'Pause and hold tension on the consonant for double the duration of a single consonant.',
        mouthPositionTip: 'Hold the articulatory closure momentarily before releasing.',
        minimalPairs: [
          { wordA: 'sete', wordB: 'sette', meaningA: 'thirst', meaningB: 'seven' },
          { wordA: 'casa', wordB: 'cassa', meaningA: 'house', meaningB: 'cash register / box' },
        ],
        sampleWords: [
          { word: 'cappuccino', translation: 'cappuccino' },
          { word: 'grazie', translation: 'thank you' },
        ],
      },
    ],
  },
  japanese: {
    id: 'pt_ja',
    languageId: 'japanese',
    title: 'Japanese Pitch Accent & Mora Timing',
    overview: 'Strict equal-length mora rhythm, clean unvoiced vowels, and pitch contours.',
    keyPhonemes: [
      {
        id: 'p_ja_mora',
        title: 'Equal Mora Timing (拍)',
        soundIpa: '[. . .]',
        soundName: 'Metronomic Syllable Beat',
        description: 'Every Hiragana character takes exactly one beat of time, including the small っ (pause) and ん (n).',
        mouthPositionTip: 'Tap your foot or finger to maintain equal duration across every character.',
        sampleWords: [
          { word: 'ありがとう (a-ri-ga-to-u)', translation: '5 beats' },
          { word: 'にっぽん (ni-p-po-n)', translation: '4 beats' },
        ],
      },
    ],
  },
  korean: {
    id: 'pt_ko',
    languageId: 'korean',
    title: 'Korean 3-Way Consonant Contrast',
    overview: 'Plain (ㄱ) vs Aspirated (ㅋ) vs Tense (ㄲ) consonants, plus final Batchim sound shifts.',
    keyPhonemes: [
      {
        id: 'p_ko_3way',
        title: 'Plain, Aspirated & Tense Stops',
        soundIpa: '/k/ /kʰ/ /k͈/',
        soundName: '3-Way Stop Distinction',
        description: 'Plain has gentle airflow, Aspirated has strong breath puff, Tense has zero breath and tight throat muscles.',
        mouthPositionTip: 'Place a tissue paper in front of your lips: Plain moves it slightly, Aspirated blows it away, Tense does not move it at all.',
        sampleWords: [
          { word: '가다 (gada)', translation: 'to go (Plain)' },
          { word: '카메라 (kamera)', translation: 'camera (Aspirated)' },
          { word: '까마귀 (kkamagwi)', translation: 'crow (Tense)' },
        ],
      },
    ],
  },
  'arabic-msa': {
    id: 'pt_ar',
    languageId: 'arabic-msa',
    title: 'Arabic Emphatic Consonants & Deep Pharyngeals',
    overview: 'Master the deep pharyngeal sounds (ع, ح) and velarized emphatic consonants (ص, ض, ط, ظ).',
    keyPhonemes: [
      {
        id: 'p_ar_ayn_haa',
        title: 'Ayn (ع) and Haa (ح)',
        soundIpa: '/ʕ/ and /ħ/',
        soundName: 'Pharyngeal Consonants',
        description: 'Produced by constricting the pharynx deep in the throat behind the epiglottis.',
        mouthPositionTip: 'For (ح), breathe warm air on glasses to fog them. For (ع), tighten the vocal cords while vocalizing deeply.',
        sampleWords: [
          { word: 'عربي (Arabi)', translation: 'Arabic' },
          { word: 'حبيبي (Habibi)', translation: 'my love / friend' },
          { word: 'مرحباً (Marhaban)', translation: 'hello' },
        ],
      },
    ],
  },
  arabic: {
    id: 'pt_ar_gen',
    languageId: 'arabic',
    title: 'Arabic Emphatic Consonants & Deep Pharyngeals',
    overview: 'Master the deep pharyngeal sounds (ع, ح) and velarized emphatic consonants (ص, ض, ط, ظ).',
    keyPhonemes: [
      {
        id: 'p_ar_ayn_haa_g',
        title: 'Ayn (ع) and Haa (ح)',
        soundIpa: '/ʕ/ and /ħ/',
        soundName: 'Pharyngeal Consonants',
        description: 'Deep throat constriction.',
        mouthPositionTip: 'Tighten pharyngeal muscles.',
        sampleWords: [
          { word: 'مرحباً (Marhaban)', translation: 'hello' },
          { word: 'شكراً (Shukran)', translation: 'thank you' },
        ],
      },
    ],
  },
  portuguese: {
    id: 'pt_pt',
    languageId: 'portuguese',
    title: 'Brazilian Portuguese Nasal Diphthongs & Palatalization',
    overview: 'Master the nasal diphthongs (ão, ãe), reduction of unstressed final vowels (O $\\rightarrow$ U, E $\\rightarrow$ I), and DJ/CH sounds.',
    keyPhonemes: [
      {
        id: 'p_pt_ao',
        title: 'The Nasal Diphthong "ÃO"',
        soundIpa: '/ɐ̃w̃/',
        soundName: 'Nasal diphthong ão',
        description: 'Start with nasal "ah" and glide into nasal "w" without letting air escape only through the mouth.',
        mouthPositionTip: 'Pronounce "ow" while sending half the air resonance through your nose.',
        sampleWords: [
          { word: 'pão', translation: 'bread' },
          { word: 'não', translation: 'no' },
          { word: 'estação', translation: 'station' },
        ],
      },
    ],
  },
  russian: {
    id: 'pt_ru',
    languageId: 'russian',
    title: 'Russian Hard vs Soft Consonants (Palatalization)',
    overview: 'Every Russian consonant pair has a hard (unpalatalized) and soft (palatalized with raised tongue body) form.',
    keyPhonemes: [
      {
        id: 'p_ru_palatal',
        title: 'Palatalization (Soft Consonants)',
        soundIpa: '/tʲ/ /dʲ/ /mʲ/ /nʲ/',
        soundName: 'Hard vs Soft Consonant Pairs',
        description: 'Press the middle of your tongue against the hard palate as you pronounce the consonant.',
        mouthPositionTip: 'Pronounce the consonant as if blending it simultaneously with a tiny "y" sound.',
        minimalPairs: [
          { wordA: 'мат (mat)', wordB: 'мать (mat\')', meaningA: 'foul language (hard t)', meaningB: 'mother (soft t)' },
        ],
        sampleWords: [
          { word: 'здравствуйте', translation: 'hello' },
          { word: 'спасибо', translation: 'thank you' },
        ],
      },
    ],
  },
  chinese: {
    id: 'pt_zh',
    languageId: 'chinese',
    title: 'Mandarin Tone Accuracy, Pinyin & Retroflex Sounds',
    overview: 'Master the 4 lexical tones, the neutral tone, tone combinations (sandhi), and retroflex consonants (zh, ch, sh, r) vs dental sibilants (z, c, s).',
    keyPhonemes: [
      {
        id: 'p_zh_tones',
        title: 'The 4 Mandarin Tones & Tone Sandhi',
        soundIpa: '55, 35, 214, 51',
        soundName: 'Lexical Pitch Contours',
        description: 'Mandarin is tonal: high flat (1st mā), rising (2nd má), dipping (3rd mǎ), and sharp falling (4th mà).',
        mouthPositionTip: 'Use your hand to trace the pitch shape in the air as you speak to guide vocal pitch.',
        minimalPairs: [
          { wordA: 'mā (妈)', wordB: 'mǎ (马)', meaningA: 'mother (1st tone - high)', meaningB: 'horse (3rd tone - dip)' },
          { wordA: 'shì (是)', wordB: 'shí (十)', meaningA: 'to be (4th tone - falling)', meaningB: 'ten (2nd tone - rising)' },
        ],
        sampleWords: [
          { word: '你好 (Nǐ hǎo)', translation: 'hello (3rd+3rd changes to 2nd+3rd: Ní hǎo)' },
          { word: '谢谢 (Xièxie)', translation: 'thank you (4th falling + light neutral)' },
        ],
      },
      {
        id: 'p_zh_retroflex',
        title: 'Retroflex Consonants (ZH, CH, SH, R)',
        soundIpa: '/ʈʂ/ /ʈʂʰ/ /ʂ/ /ʐ/',
        soundName: 'Curled-Tongue Consonants',
        description: 'Curl the tip of your tongue backward toward the roof of your mouth behind the tooth ridge.',
        mouthPositionTip: 'Curl your tongue tip slightly back into your mouth without touching the teeth.',
        sampleWords: [
          { word: '中国 (Zhōngguó)', translation: 'China' },
          { word: '吃 (chī)', translation: 'to eat' },
          { word: '老师 (lǎoshī)', translation: 'teacher' },
          { word: '热 (rè)', translation: 'hot' },
        ],
      },
    ],
  },
  english: {
    id: 'pt_en',
    languageId: 'english',
    title: 'English Stress-Timing, Schwa /ə/ & Dental Fricatives',
    overview: 'Master the universal unstressed Schwa /ə/, voiced vs unvoiced TH (/θ/ vs /ð/), and sentence stress rhythm.',
    keyPhonemes: [
      {
        id: 'p_en_schwa',
        title: 'The Neutral Schwa Sound /ə/',
        soundIpa: '/ə/',
        soundName: 'Mid Central Unstressed Vowel',
        description: 'The most frequent sound in English. A completely relaxed, short, effortless vocal vibration.',
        mouthPositionTip: 'Completely relax your mouth and jaw; make a neutral "uh" sound with zero effort.',
        sampleWords: [
          { word: 'about (ə-bout)', translation: 'about' },
          { word: 'banana (bə-na-nə)', translation: 'banana' },
          { word: 'the (ðə)', translation: 'the' },
        ],
      },
      {
        id: 'p_en_th',
        title: 'The Dental Fricatives TH (/θ/ and /ð/)',
        soundIpa: '/θ/ (unvoiced) and /ð/ (voiced)',
        soundName: 'Interdental Fricatives',
        description: 'Place the tip of your tongue lightly between your upper and lower front teeth while exhaling.',
        mouthPositionTip: 'Gently stick out the tip of your tongue between your teeth.',
        minimalPairs: [
          { wordA: 'think', wordB: 'sink', meaningA: 'mental thought (/θ/)', meaningB: 'kitchen basin (/s/)' },
          { wordA: 'this', wordB: 'dis', meaningA: 'this demonstrative (/ð/)', meaningB: 'dis slang (/d/)' },
        ],
        sampleWords: [
          { word: 'thank you', translation: 'thank you (/θ/)' },
          { word: 'this morning', translation: 'this (/ð/)' },
        ],
      },
    ],
  },
};
