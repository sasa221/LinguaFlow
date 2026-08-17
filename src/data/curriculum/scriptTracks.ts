import { ScriptTrack } from '../../types';

// ==========================================
// 1. JAPANESE SCRIPT TRACK (Hiragana -> Katakana -> Basic Kanji)
// ==========================================
export const JAPANESE_SCRIPT_TRACK: ScriptTrack = {
  id: 'st_ja',
  languageId: 'japanese',
  scriptName: 'Japanese Writing Systems (Hiragana & Katakana)',
  nativeScriptName: '日本語の文字 (ひらがな・カタカナ)',
  description: 'Step-by-step progression through Hiragana syllabary, Katakana for loanwords, and essential basic Kanji recognition.',
  stages: [
    {
      id: 'st_ja_hiragana_vowels',
      name: 'Stage 1: Hiragana Core Vowels (あ・い・う・え・お)',
      description: 'The foundation of all Japanese syllables.',
      lessons: [
        {
          id: 'sl_ja_vowels',
          title: 'Core Vowels (A, I, U, E, O)',
          description: 'Learn the stroke structure, shape recognition, and pure open vowels.',
          characters: [
            { char: 'あ', romaji: 'a', ipa: 'a', audioText: 'あ', strokeCount: 3, mnemonic: 'Looks like an Apple with a curved stem', sampleWord: { word: 'あさ (asa)', translation: 'morning' } },
            { char: 'い', romaji: 'i', ipa: 'i', audioText: 'い', strokeCount: 2, mnemonic: 'Two parallel lines like two Eels (ii-ls)', sampleWord: { word: 'いぬ (inu)', translation: 'dog' } },
            { char: 'う', romaji: 'u', ipa: 'ɯ', audioText: 'う', strokeCount: 2, mnemonic: 'Curved spine saying "Oof"', sampleWord: { word: 'うみ (umi)', translation: 'sea / ocean' } },
            { char: 'え', romaji: 'e', ipa: 'e', audioText: 'え', strokeCount: 2, mnemonic: 'An Energetic bird running forward', sampleWord: { word: 'えき (eki)', translation: 'train station' } },
            { char: 'お', romaji: 'o', ipa: 'o', audioText: 'お', strokeCount: 3, mnemonic: 'Golfer on the green putting a ball ("O!")', sampleWord: { word: 'おちゃ (ocha)', translation: 'tea' } },
          ],
        },
      ],
    },
    {
      id: 'st_ja_hiragana_k_s',
      name: 'Stage 2: K-Row & S-Row (か〜こ, さ〜そ)',
      description: 'Consonant pairing with the 5 vowels.',
      lessons: [
        {
          id: 'sl_ja_k_row',
          title: 'K-Row (Ka, Ki, Ku, Ke, Ko)',
          description: 'Crisp velar stops combined with 5 vowels.',
          characters: [
            { char: 'か', romaji: 'ka', audioText: 'か', strokeCount: 3, mnemonic: 'Blade cutting a line', sampleWord: { word: 'かさ (kasa)', translation: 'umbrella' } },
            { char: 'き', romaji: 'ki', audioText: 'き', strokeCount: 4, mnemonic: 'Old-fashioned key shape', sampleWord: { word: 'き (ki)', translation: 'tree' } },
            { char: 'く', romaji: 'ku', audioText: 'く', strokeCount: 1, mnemonic: 'Bird cuckoo beak pointing left', sampleWord: { word: 'くるま (kuruma)', translation: 'car' } },
            { char: 'け', romaji: 'ke', audioText: 'け', strokeCount: 3, mnemonic: 'Kelp stalk growing', sampleWord: { word: 'けいたい (keitai)', translation: 'mobile phone' } },
            { char: 'こ', romaji: 'ko', audioText: 'こ', strokeCount: 2, mnemonic: 'Two friendly koi fish swimming', sampleWord: { word: 'こころ (kokoro)', translation: 'heart / mind' } },
          ],
        },
        {
          id: 'sl_ja_s_row',
          title: 'S-Row (Sa, Shi, Su, Se, So)',
          description: 'Notice し is pronounced "shi", not "si".',
          characters: [
            { char: 'さ', romaji: 'sa', audioText: 'さ', strokeCount: 3, mnemonic: 'Smiling face with sash', sampleWord: { word: 'さくら (sakura)', translation: 'cherry blossom' } },
            { char: 'し', romaji: 'shi', audioText: 'し', strokeCount: 1, mnemonic: 'Fish hook dipping into the sea', sampleWord: { word: 'しろ (shiro)', translation: 'white' } },
            { char: 'す', romaji: 'su', audioText: 'す', strokeCount: 2, mnemonic: 'Swirl on a straw', sampleWord: { word: 'すし (sushi)', translation: 'sushi' } },
            { char: 'せ', romaji: 'se', audioText: 'せ', strokeCount: 3, mnemonic: 'Setting sun on horizon', sampleWord: { word: 'せんせい (sensei)', translation: 'teacher' } },
            { char: 'そ', romaji: 'so', audioText: 'そ', strokeCount: 1, mnemonic: 'Zig-zag sewing stitch', sampleWord: { word: 'そら (sora)', translation: 'sky' } },
          ],
        },
      ],
    },
    {
      id: 'st_ja_katakana_intro',
      name: 'Stage 3: Katakana Overview & Loanwords (カタカナ)',
      description: 'Angular syllabary used for foreign loanwords, cafe menus, and modern terms.',
      lessons: [
        {
          id: 'sl_ja_katakana_vowels',
          title: 'Katakana Vowels & Common Signs (ア・イ・ウ・エ・オ)',
          description: 'Recognizing geometric loanword characters on menus and signs.',
          characters: [
            { char: 'ア', romaji: 'a', audioText: 'ア', strokeCount: 2, mnemonic: 'Angular axe', sampleWord: { word: 'アメリカ (amerika)', translation: 'America' } },
            { char: 'イ', romaji: 'i', audioText: 'イ', strokeCount: 2, mnemonic: 'Easel leg', sampleWord: { word: 'イタリア (itaria)', translation: 'Italy' } },
            { char: 'ウ', romaji: 'u', audioText: 'ウ', strokeCount: 3, mnemonic: 'Umbrella top hook', sampleWord: { word: 'ウーロンちゃ (ūroncha)', translation: 'oolong tea' } },
            { char: 'エ', romaji: 'e', audioText: 'エ', strokeCount: 3, mnemonic: 'Elevator girders I-beam', sampleWord: { word: 'エアコン (eakon)', translation: 'air conditioner' } },
            { char: 'オ', romaji: 'o', audioText: 'オ', strokeCount: 3, mnemonic: 'Opera singer reaching out', sampleWord: { word: 'オレンジ (orenji)', translation: 'orange' } },
          ],
        },
      ],
    },
  ],
};

// ==========================================
// 2. KOREAN SCRIPT TRACK (Hangul Syllable Blocks & Batchim)
// ==========================================
export const KOREAN_SCRIPT_TRACK: ScriptTrack = {
  id: 'st_ko',
  languageId: 'korean',
  scriptName: 'Hangul Alphabet & Syllable Blocks (한글)',
  nativeScriptName: '한글 창제 원리와 음절 구성',
  description: 'Master King Sejong\'s scientific alphabet: vowels, articulation-based consonants, and 2-to-3 letter block assembly.',
  stages: [
    {
      id: 'st_ko_basic_vowels',
      name: 'Stage 1: Primary Vowels (ㅏ ㅓ ㅗ ㅜ ㅡ ㅣ)',
      description: 'Philosophical roots: Sky (•), Earth (ㅡ), and Human (ㅣ).',
      lessons: [
        {
          id: 'sl_ko_vowels',
          title: 'Primary Vowels',
          description: 'Clear vowel tones essential for building Hangul syllable blocks.',
          characters: [
            { char: 'ㅏ', romaji: 'a', ipa: 'a', audioText: '아', mnemonic: 'Line pointing OUT/Right (Ah)', sampleWord: { word: '아이 (ai)', translation: 'child' } },
            { char: 'ㅓ', romaji: 'eo', ipa: 'ʌ', audioText: '어', mnemonic: 'Line pointing IN/Left (uh/eo)', sampleWord: { word: '어머니 (eomeoni)', translation: 'mother' } },
            { char: 'ㅗ', romaji: 'o', ipa: 'o', audioText: '오', mnemonic: 'Line pointing UP (Oh)', sampleWord: { word: '오이 (oi)', translation: 'cucumber' } },
            { char: 'ㅜ', romaji: 'u', ipa: 'u', audioText: '우', mnemonic: 'Line pointing DOWN (Oo)', sampleWord: { word: '우유 (uyu)', translation: 'milk' } },
            { char: 'ㅡ', romaji: 'eu', ipa: 'ɯ', audioText: '으', mnemonic: 'Flat horizontal line (eu)', sampleWord: { word: '으뜸 (eutteum)', translation: 'the best' } },
            { char: 'ㅣ', romaji: 'i', ipa: 'i', audioText: '이', mnemonic: 'Standing human line (Ee)', sampleWord: { word: '이 (i)', translation: 'two / this / tooth' } },
          ],
        },
      ],
    },
    {
      id: 'st_ko_basic_consonants',
      name: 'Stage 2: Core Consonants (ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ ㅅ ㅇ ㅈ ㅎ)',
      description: 'Shapes reflecting the speech organs (tongue, teeth, lips, throat).',
      lessons: [
        {
          id: 'sl_ko_consonants',
          title: 'First Consonant Family',
          description: 'G/K, N, D/T, M, B/P, S, Placeholder/NG, J, H',
          characters: [
            { char: 'ㄱ', romaji: 'g/k', audioText: '기역', mnemonic: 'Gun shape pointing right (back of tongue)', sampleWord: { word: '가구 (gagu)', translation: 'furniture' } },
            { char: 'ㄴ', romaji: 'n', audioText: '니은', mnemonic: 'Nose / right angle tongue tip touching alveolar ridge', sampleWord: { word: '나무 (namu)', translation: 'tree' } },
            { char: 'ㄷ', romaji: 'd/t', audioText: '디귿', mnemonic: 'Door frame (tongue against roof)', sampleWord: { word: '다리 (dari)', translation: 'leg / bridge' } },
            { char: 'ㄹ', romaji: 'r/l', audioText: '리을', mnemonic: 'Rattlesnake wave (light tap r or liquid l)', sampleWord: { word: '라디오 (radio)', translation: 'radio' } },
            { char: 'ㅁ', romaji: 'm', audioText: '미음', mnemonic: 'Mouth box shape (closed lips)', sampleWord: { word: '모자 (moja)', translation: 'hat' } },
            { char: 'ㅂ', romaji: 'b/p', audioText: '비읍', mnemonic: 'Bucket shape with open top', sampleWord: { word: '바다 (bada)', translation: 'ocean' } },
            { char: 'ㅅ', romaji: 's', audioText: '시옷', mnemonic: 'Standing silhouette / tooth line', sampleWord: { word: '사과 (sagwa)', translation: 'apple' } },
            { char: 'ㅇ', romaji: 'silent / -ng', audioText: '이응', mnemonic: 'Zero placeholder in initial, "ng" in final batchim', sampleWord: { word: '안녕 (annyeong)', translation: 'peace / hello' } },
            { char: 'ㅈ', romaji: 'j/ch', audioText: '지읒', mnemonic: 'Hat on top of ㅅ', sampleWord: { word: '지도 (jido)', translation: 'map' } },
            { char: 'ㅎ', romaji: 'h', audioText: '히읗', mnemonic: 'Person wearing a hat / throat opening', sampleWord: { word: '하늘 (haneul)', translation: 'sky' } },
          ],
        },
      ],
    },
    {
      id: 'st_ko_syllables_batchim',
      name: 'Stage 3: Syllable Assembly & Final Consonants (받침 Batchim)',
      description: 'Combining Initial Consonant + Vowel + Final Batchim into square blocks [가, 간, 한].',
      lessons: [
        {
          id: 'sl_ko_batchim_basics',
          title: 'Block Assembly & Sound Shifts',
          description: 'Understanding how Korean syllables form squares and how final consonants sound.',
          characters: [
            { char: '한', romaji: 'han', audioText: '한', mnemonic: 'ㅎ (h) + ㅏ (a) + ㄴ (n) = 한 (Han)', sampleWord: { word: '한국 (Hanguk)', translation: 'Korea' } },
            { char: '글', romaji: 'geul', audioText: '글', mnemonic: 'ㄱ (g) + ㅡ (eu) + ㄹ (l) = 글 (Geul)', sampleWord: { word: '한글 (Hangul)', translation: 'Korean script' } },
            { char: '감', romaji: 'gam', audioText: '감', mnemonic: 'ㄱ (g) + ㅏ (a) + ㅁ (m) = 감 (Gam)', sampleWord: { word: '감사 (gamsa)', translation: 'gratitude' } },
          ],
        },
      ],
    },
  ],
};

// ==========================================
// 3. ARABIC SCRIPT TRACK (Cursive Connections & Position Shapes)
// ==========================================
export const ARABIC_SCRIPT_TRACK: ScriptTrack = {
  id: 'st_ar',
  languageId: 'arabic-msa',
  scriptName: 'Arabic Writing System (الأبجدية العربية)',
  nativeScriptName: 'الأبجدية العربية والوصل الحرفي',
  description: 'Master right-to-left cursive flow, initial, medial, and final letter shapes, and foundational short vowels.',
  stages: [
    {
      id: 'st_ar_stage1_btt',
      name: 'Stage 1: Alif & The Boat Family (ا ب ت ث)',
      description: 'Right-to-left base strokes, non-connector Alif, and distinguishing dot positions.',
      lessons: [
        {
          id: 'sl_ar_btt',
          title: 'Vertical Alif & The Boat Letters',
          description: 'Alif doesn\'t connect to the left. Baa, Taa, Thaa change shape at start/middle/end.',
          characters: [
            { char: 'ا (ـا)', romaji: 'Alif (ā / a)', audioText: 'ألف', strokeCount: 1, mnemonic: 'Tall straight vertical column. Non-connector (never joins to the left)', sampleWord: { word: 'أب (Ab)', translation: 'father' } },
            { char: 'ب (بـ ـبـ ـب)', romaji: 'Baa (b)', audioText: 'باء', strokeCount: 2, mnemonic: 'Boat with ONE dot BELOW (B = Below). Initial: بـ Medial: ـبـ Final: ـب', sampleWord: { word: 'باب (Bab)', translation: 'door' } },
            { char: 'ت (تـ ـتـ ـت)', romaji: 'Taa (t)', audioText: 'تاء', strokeCount: 2, mnemonic: 'Boat with TWO dots on TOP (T = Two / Top). Initial: تـ Medial: ـتـ', sampleWord: { word: 'تمر (Tamr)', translation: 'dates' } },
            { char: 'ث (ثـ ـثـ ـث)', romaji: 'Thaa (th)', audioText: 'ثاء', strokeCount: 2, mnemonic: 'Boat with THREE dots on TOP (Th = Three). Unvoiced /θ/ sound', sampleWord: { word: 'ثلاثة (Thalatha)', translation: 'three' } },
          ],
        },
      ],
    },
    {
      id: 'st_ar_stage2_vowels',
      name: 'Stage 2: Short Vowels (Harakat) & Long Vowels',
      description: 'Fatha (a), Damma (u), Kasra (i), Sukun (no vowel), and long vowel letters (ا, و, ي).',
      lessons: [
        {
          id: 'sl_ar_harakat',
          title: 'Short Vowels (Harakat)',
          description: 'Diacritical marks written above or below consonants to indicate short vowels.',
          characters: [
            { char: 'َ (Fatha)', romaji: 'short a', audioText: 'بَ', mnemonic: 'Diagonal stroke ABOVE the letter indicating short "a" (e.g. بَ = ba)', sampleWord: { word: 'مَرْحَباً (Marhaban)', translation: 'hello' } },
            { char: 'ُ (Damma)', romaji: 'short u', audioText: 'بُ', mnemonic: 'Tiny loop like a mini waw ABOVE indicating short "u" (e.g. بُ = bu)', sampleWord: { word: 'شُكْراً (Shukran)', translation: 'thank you' } },
            { char: 'ِ (Kasra)', romaji: 'short i', audioText: 'بِ', mnemonic: 'Diagonal stroke BELOW the letter indicating short "i" (e.g. بِ = bi)', sampleWord: { word: 'مِنْ (Min)', translation: 'from' } },
            { char: 'ْ (Sukun)', romaji: 'silent / stop', audioText: 'بْ', mnemonic: 'Small circle ABOVE indicating zero vowel / crisp consonant stop', sampleWord: { word: 'أَهْلاً (Ahlan)', translation: 'welcome' } },
          ],
        },
      ],
    },
  ],
};

// ==========================================
// 4. RUSSIAN SCRIPT TRACK (Cyrillic False Friends & Slavic Letters)
// ==========================================
export const RUSSIAN_SCRIPT_TRACK: ScriptTrack = {
  id: 'st_ru',
  languageId: 'russian',
  scriptName: 'Russian Cyrillic (Кириллица)',
  nativeScriptName: 'Русская кириллица',
  description: 'Systematic breakdown of True Friends, False Friends (looks Latin, sounds different), and unique Slavic letters.',
  stages: [
    {
      id: 'st_ru_true_friends',
      name: 'Stage 1: True Friends (А, К, М, О, Т)',
      description: 'Letters that look like Latin and make the same sound.',
      lessons: [
        {
          id: 'sl_ru_stage1',
          title: 'Identical Latin-Cyrillic Sounds',
          description: 'Instant reading confidence with 5 identical letters.',
          characters: [
            { char: 'А а', romaji: 'a', audioText: 'А', mnemonic: 'Identical to English A (ah)', sampleWord: { word: 'Анна', translation: 'Anna' } },
            { char: 'К к', romaji: 'k', audioText: 'К', mnemonic: 'Identical to English K', sampleWord: { word: 'Кот (Kot)', translation: 'cat' } },
            { char: 'М м', romaji: 'm', audioText: 'М', mnemonic: 'Identical to English M', sampleWord: { word: 'Мама (Mama)', translation: 'mom' } },
            { char: 'О о', romaji: 'o', audioText: 'О', mnemonic: 'Looks like O; pronounced O (stressed) or relaxed A (unstressed)', sampleWord: { word: 'Окно (Okno)', translation: 'window' } },
            { char: 'Т т', romaji: 't', audioText: 'Т', mnemonic: 'Identical to English T', sampleWord: { word: 'Там (Tam)', translation: 'there' } },
          ],
        },
      ],
    },
    {
      id: 'st_ru_false_friends',
      name: 'Stage 2: False Friends (В, Н, Р, С, У, Х)',
      description: '⚠️ CRITICAL: Letters that LOOK like Latin letters but have completely DIFFERENT sounds.',
      lessons: [
        {
          id: 'sl_ru_false_friends',
          title: 'Deconstructing Look-Alikes',
          description: 'Train your brain to recognize Cyrillic sound mappings.',
          characters: [
            { char: 'В в', romaji: 'v', audioText: 'В', mnemonic: '⚠️ Looks like B, but sounds like V (as in Volcano / Vodka)', sampleWord: { word: 'Вода (Voda)', translation: 'water' } },
            { char: 'Н н', romaji: 'n', audioText: 'Н', mnemonic: '⚠️ Looks like H, but sounds like N (as in Net / No)', sampleWord: { word: 'Нет (Net)', translation: 'no' } },
            { char: 'Р р', romaji: 'r (rolled)', audioText: 'Р', mnemonic: '⚠️ Looks like P, but sounds like rolled R (as in Restaurant)', sampleWord: { word: 'Ресторан (Restoran)', translation: 'restaurant' } },
            { char: 'С с', romaji: 's', audioText: 'С', mnemonic: '⚠️ Looks like C, but ALWAYS sounds like S (as in Spasibo)', sampleWord: { word: 'Спасибо (Spasibo)', translation: 'thank you' } },
            { char: 'У у', romaji: 'u (oo)', audioText: 'У', mnemonic: '⚠️ Looks like Y, but sounds like "oo" (as in Moon / Utka)', sampleWord: { word: 'Утро (Utro)', translation: 'morning' } },
            { char: 'Х х', romaji: 'kh (h)', audioText: 'Х', mnemonic: '⚠️ Looks like X, but sounds like raspy H / Kh (as in Khorosho)', sampleWord: { word: 'Хорошо (Khorosho)', translation: 'good / well' } },
          ],
        },
      ],
    },
  ],
};

// ==========================================
// 5. CHINESE CHARACTER TRACK (Radicals & Foundational Hanzi)
// (Note: Pinyin & Tones are located in the Pronunciation Track)
// ==========================================
export const CHINESE_SCRIPT_TRACK: ScriptTrack = {
  id: 'st_zh',
  languageId: 'chinese',
  scriptName: 'High-Frequency Hanzi & Radicals (汉字与部首)',
  nativeScriptName: '基础汉字与核心部首',
  description: 'Foundational Chinese character recognition: visual pictographs, core radicals (Person, Sun, Water), and stroke order logic.',
  stages: [
    {
      id: 'st_zh_pictographs',
      name: 'Stage 1: Pictographic Roots (人, 日, 月, 木, 水)',
      description: 'Characters that originated as direct visual drawings of real-world objects.',
      lessons: [
        {
          id: 'sl_zh_basic_radicals',
          title: 'The Core Building Blocks (Radicals)',
          description: 'Recognizing these 5 radicals allows you to decode hundreds of complex characters.',
          characters: [
            { char: '人 (亻)', romaji: 'rén', audioText: '人', strokeCount: 2, mnemonic: 'A walking person with two legs. Radical form: 亻 (single person radical)', sampleWord: { word: '你好 (Nǐ hǎo)', translation: 'you (亻 + 尔) good' } },
            { char: '日', romaji: 'rì', audioText: '日', strokeCount: 4, mnemonic: 'Sun / Day: a circular sun box with an energy horizon inside', sampleWord: { word: '明天 (míngtiān)', translation: 'tomorrow (日 Sun + 月 Moon)' } },
            { char: '月', romaji: 'yuè', audioText: '月', strokeCount: 4, mnemonic: 'Crescent Moon / Month', sampleWord: { word: '朋友 (péngyou)', translation: 'friend (two moons side by side)' } },
            { char: '木', romaji: 'mù', audioText: '木', strokeCount: 4, mnemonic: 'A tree with branches reaching up and roots stretching down', sampleWord: { word: '本 (běn)', translation: 'book / origin (root marked)' } },
            { char: '口', romaji: 'kǒu', audioText: '口', strokeCount: 3, mnemonic: 'Open mouth box. Common in eating/speaking words (吃, 喝, 叫)', sampleWord: { word: '我叫 (wǒ jiào)', translation: 'my name is (叫 has 口 mouth)' } },
          ],
        },
      ],
    },
    {
      id: 'st_zh_high_frequency_a0',
      name: 'Stage 2: High-Frequency A0 Characters (你, 好, 我, 谢)',
      description: 'Visual character recognition for your core spoken A0 vocabulary.',
      lessons: [
        {
          id: 'sl_zh_greetings_hanzi',
          title: 'Recognizing Core A0 Words',
          description: 'Connect spoken phrases with their visual Hanzi shapes.',
          characters: [
            { char: '你', romaji: 'nǐ', audioText: '你', strokeCount: 7, mnemonic: 'Person radical (亻) + balance: You', sampleWord: { word: '你好 (Nǐ hǎo)', translation: 'hello' } },
            { char: '好', romaji: 'hǎo', audioText: '好', strokeCount: 6, mnemonic: 'Woman (女) + Child (子) together = Good', sampleWord: { word: '很好 (hěn hǎo)', translation: 'very good' } },
            { char: '我', romaji: 'wǒ', audioText: '我', strokeCount: 7, mnemonic: 'Hand holding a spear = I / Me', sampleWord: { word: '我是 (wǒ shì)', translation: 'I am' } },
            { char: '谢', romaji: 'xiè', audioText: '谢', strokeCount: 12, mnemonic: 'Words radical (讠) + shoot (身+寸) = to thank', sampleWord: { word: '谢谢 (xièxie)', translation: 'thank you' } },
          ],
        },
      ],
    },
  ],
};

export const SCRIPT_TRACKS_REGISTRY: Record<string, ScriptTrack> = {
  japanese: JAPANESE_SCRIPT_TRACK,
  korean: KOREAN_SCRIPT_TRACK,
  'arabic-msa': ARABIC_SCRIPT_TRACK,
  arabic: ARABIC_SCRIPT_TRACK,
  russian: RUSSIAN_SCRIPT_TRACK,
  chinese: CHINESE_SCRIPT_TRACK,
};
