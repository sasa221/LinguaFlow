export interface SurvivalPhrase {
  id: string;
  target: string;
  romanization?: string;
  translationAr: string;
  translationEn: string;
}

export interface AccentRule {
  title?: string;
  description?: string;
  example?: string;
  letterOrSound: string;
  exampleTarget: string;
  examplePhonetic: string;
  ruleAr: string;
  ruleEn: string;
}

export interface AccentCoachingTip {
  title: string;
  description: string;
  example: string;
}

const p = (
  id: string,
  target: string,
  translationEn: string,
  translationAr: string,
  romanization?: string
): SurvivalPhrase => ({ id, target, translationEn, translationAr, romanization });

export const SURVIVAL_PHRASES: Record<string, SurvivalPhrase[]> = {
  spanish: [
    p('es-1', 'Por favor', 'Please', 'من فضلك', 'por fah-bor'),
    p('es-2', 'Muchas gracias', 'Thank you very much', 'شكراً جزيلاً', 'moo-chas grah-syas'),
    p('es-3', '¿Cuánto cuesta?', 'How much is it?', 'بكام ده؟', 'kwan-to kwes-tah'),
    p('es-4', '¿Dónde está el baño?', 'Where is the restroom?', 'الحمام فين؟', 'don-deh es-tah el bah-nyo'),
    p('es-5', 'No entiendo. Más despacio, por favor.', 'I do not understand. Slower, please.', 'مش فاهم. بالراحة لو سمحت.', 'no en-tyen-do'),
    p('es-6', 'La cuenta, por favor.', 'The bill, please.', 'الحساب لو سمحت.', 'lah kwen-tah'),
  ],
  french: [
    p('fr-1', "S'il vous plaît", 'Please', 'من فضلك', 'seel voo pleh'),
    p('fr-2', 'Merci beaucoup', 'Thank you very much', 'شكراً جزيلاً', 'mair-see boh-koo'),
    p('fr-3', 'Combien ça coûte ?', 'How much is it?', 'بكام ده؟', 'kom-byen sah koot'),
    p('fr-4', 'Où sont les toilettes ?', 'Where is the restroom?', 'الحمام فين؟', 'oo sohn lay twah-let'),
    p('fr-5', 'Pouvez-vous répéter, s’il vous plaît ?', 'Could you repeat, please?', 'ممكن تكرر لو سمحت؟', 'poo-vay voo ray-pay-tay'),
    p('fr-6', "L'addition, s'il vous plaît.", 'The bill, please.', 'الحساب لو سمحت.', 'lah-dee-syon'),
  ],
  german: [
    p('de-1', 'Bitte', 'Please', 'من فضلك', 'bi-te'),
    p('de-2', 'Vielen Dank', 'Thank you very much', 'شكراً جزيلاً', 'fee-len dank'),
    p('de-3', 'Wie viel kostet das?', 'How much is it?', 'بكام ده؟', 'vee feel kos-tet das'),
    p('de-4', 'Wo ist die Toilette?', 'Where is the restroom?', 'الحمام فين؟', 'vo ist dee toy-let-te'),
    p('de-5', 'Bitte langsamer.', 'Slower, please.', 'بالراحة لو سمحت.', 'bi-te lang-zah-mer'),
    p('de-6', 'Ich verstehe nicht.', 'I do not understand.', 'أنا مش فاهم.', 'ikh fer-shtay-eh nikht'),
  ],
  italian: [
    p('it-1', 'Per favore', 'Please', 'من فضلك', 'pehr fah-voh-reh'),
    p('it-2', 'Grazie mille', 'Thank you very much', 'شكراً جزيلاً', 'graht-syeh meel-leh'),
    p('it-3', 'Quanto costa?', 'How much is it?', 'بكام ده؟', 'kwan-to kos-ta'),
    p('it-4', 'Dov’è il bagno?', 'Where is the restroom?', 'الحمام فين؟', 'dov-eh eel ban-yo'),
    p('it-5', 'Più lentamente, per favore.', 'Slower, please.', 'بالراحة لو سمحت.', 'pyoo len-ta-men-te'),
    p('it-6', 'Non capisco.', 'I do not understand.', 'أنا مش فاهم.', 'non ka-pees-ko'),
  ],
  portuguese: [
    p('pt-1', 'Por favor', 'Please', 'من فضلك', 'por fah-vor'),
    p('pt-2', 'Muito obrigado / obrigada', 'Thank you very much', 'شكراً جزيلاً', 'mwee-to oo-bree-gah-do'),
    p('pt-3', 'Quanto custa?', 'How much is it?', 'بكام ده؟', 'kwan-to koos-ta'),
    p('pt-4', 'Onde fica o banheiro?', 'Where is the restroom?', 'الحمام فين؟', 'on-jee fee-ka oo ban-yay-ro'),
    p('pt-5', 'Mais devagar, por favor.', 'Slower, please.', 'بالراحة لو سمحت.', 'mice jee-vah-gar'),
    p('pt-6', 'Não entendo.', 'I do not understand.', 'أنا مش فاهم.', 'now en-ten-do'),
  ],
  english: [
    p('en-1', 'Please', 'Please', 'من فضلك'),
    p('en-2', 'Thank you very much', 'Thank you very much', 'شكراً جزيلاً'),
    p('en-3', 'How much is it?', 'How much is it?', 'بكام ده؟'),
    p('en-4', 'Where is the restroom?', 'Where is the restroom?', 'الحمام فين؟'),
    p('en-5', 'I don’t understand. Could you speak more slowly?', 'I do not understand. Slower, please.', 'مش فاهم. ممكن تتكلم أبطأ؟'),
    p('en-6', 'Could you repeat that, please?', 'Could you repeat that, please?', 'ممكن تكرر لو سمحت؟'),
  ],
  russian: [
    p('ru-1', 'Пожалуйста', 'Please', 'من فضلك', 'pozhaluysta'),
    p('ru-2', 'Большое спасибо', 'Thank you very much', 'شكراً جزيلاً', 'bolshoye spasibo'),
    p('ru-3', 'Сколько это стоит?', 'How much is it?', 'بكام ده؟', 'skolko eto stoit'),
    p('ru-4', 'Где туалет?', 'Where is the restroom?', 'الحمام فين؟', 'gde tualet'),
    p('ru-5', 'Говорите медленнее, пожалуйста.', 'Speak more slowly, please.', 'اتكلم أبطأ لو سمحت.', 'govorite medlenneye'),
    p('ru-6', 'Я не понимаю.', 'I do not understand.', 'أنا مش فاهم.', 'ya ne ponimayu'),
  ],
  japanese: [
    p('ja-1', 'お願いします', 'Please', 'من فضلك', 'onegaishimasu'),
    p('ja-2', 'ありがとうございます', 'Thank you very much', 'شكراً جزيلاً', 'arigatō gozaimasu'),
    p('ja-3', 'いくらですか？', 'How much is it?', 'بكام ده؟', 'ikura desu ka'),
    p('ja-4', 'トイレはどこですか？', 'Where is the restroom?', 'الحمام فين؟', 'toire wa doko desu ka'),
    p('ja-5', 'もう少しゆっくりお願いします。', 'A little slower, please.', 'بالراحة شوية لو سمحت.', 'mō sukoshi yukkuri onegaishimasu'),
    p('ja-6', 'わかりません。', 'I do not understand.', 'أنا مش فاهم.', 'wakarimasen'),
  ],
  korean: [
    p('ko-1', '부탁합니다', 'Please', 'من فضلك', 'butakhamnida'),
    p('ko-2', '감사합니다', 'Thank you', 'شكراً', 'gamsahamnida'),
    p('ko-3', '얼마예요?', 'How much is it?', 'بكام ده؟', 'eolmayeyo'),
    p('ko-4', '화장실이 어디예요?', 'Where is the restroom?', 'الحمام فين؟', 'hwajangsiri eodiyeyo'),
    p('ko-5', '천천히 말해 주세요.', 'Please speak slowly.', 'اتكلم بالراحة لو سمحت.', 'cheoncheonhi malhae juseyo'),
    p('ko-6', '잘 모르겠어요.', 'I do not understand well.', 'أنا مش فاهم كويس.', 'jal moreugesseoyo'),
  ],
  'arabic-msa': [
    p('ar-1', 'من فضلك', 'Please', 'من فضلك', 'min faḍlik'),
    p('ar-2', 'شكراً جزيلاً', 'Thank you very much', 'شكراً جزيلاً', 'shukran jazīlan'),
    p('ar-3', 'كم السعر؟', 'How much is it?', 'بكام ده؟', 'kam as-siʿr'),
    p('ar-4', 'أين دورة المياه؟', 'Where is the restroom?', 'الحمام فين؟', 'ayna dawrat al-miyāh'),
    p('ar-5', 'تكلّم ببطء، من فضلك.', 'Speak slowly, please.', 'اتكلم بالراحة لو سمحت.', 'takallam bi-buṭʾ'),
    p('ar-6', 'لا أفهم.', 'I do not understand.', 'أنا مش فاهم.', 'lā afham'),
  ],
  chinese: [
    p('zh-1', '请', 'Please', 'من فضلك', 'qǐng'),
    p('zh-2', '非常感谢', 'Thank you very much', 'شكراً جزيلاً', 'fēicháng gǎnxiè'),
    p('zh-3', '多少钱？', 'How much is it?', 'بكام ده؟', 'duōshao qián'),
    p('zh-4', '洗手间在哪里？', 'Where is the restroom?', 'الحمام فين؟', 'xǐshǒujiān zài nǎlǐ'),
    p('zh-5', '请说慢一点。', 'Please speak more slowly.', 'اتكلم أبطأ لو سمحت.', 'qǐng shuō màn yìdiǎn'),
    p('zh-6', '我不明白。', 'I do not understand.', 'أنا مش فاهم.', 'wǒ bù míngbai'),
  ],
};

const rule = (
  title: string, letterOrSound: string, exampleTarget: string,
  examplePhonetic: string, ruleEn: string, ruleAr: string
): AccentRule => ({
  title, description: ruleEn, example: exampleTarget, letterOrSound,
  exampleTarget, examplePhonetic, ruleEn, ruleAr
});

export const ACCENT_RULES: Record<string, AccentRule[]> = {
  spanish: [
    rule('Tap vs trill R', 'R / RR', 'pero / perro', '/ɾ/ vs /r/', 'Use one quick tongue tap for R and repeated vibration for RR.', 'R نقرة سريعة، وRR اهتزاز أقوى ومتكرر.'),
    rule('Pure vowels', 'A E I O U', 'mesa / no', '/a e i o u/', 'Keep vowels short and pure without English-style glides.', 'خلّي الحركات قصيرة ونقية من غير مد إنجليزي.'),
  ],
  french: [
    rule('French R', 'R', 'bonjour', '/ʁ/', 'Produce R gently at the back of the throat.', 'الـR الفرنسية من آخر الحلق بشكل خفيف.'),
    rule('Nasal vowels', 'AN / ON / IN', 'bon / pain', '/bɔ̃/ /pɛ̃/', 'Let air resonate through the nose without pronouncing a final N.', 'سيب جزء من الهوا يطلع من الأنف من غير نطق N واضحة.'),
  ],
  german: [
    rule('Ich sound', 'CH', 'ich', '/ɪç/', 'Keep the tongue high and make a soft friction sound.', 'ارفع اللسان واعمل احتكاك خفيف لصوت ch في ich.'),
    rule('Rounded vowels', 'Ü / Ö', 'fünf / schön', '/y/ /øː/', 'Round the lips while keeping the tongue forward.', 'دوّر الشفايف مع بقاء اللسان لقدّام.'),
  ],
  italian: [
    rule('Double consonants', 'Gemination', 'pala / palla', 'short vs long consonant', 'Hold doubled consonants noticeably longer.', 'طوّل الحرف المشدد أو المزدوج بوضوح.'),
    rule('Pure vowels', 'Vowels', 'casa', '/ˈka.za/', 'Avoid turning simple vowels into English-style diphthongs.', 'متخليش الحركة تتحول لصوتين زي الإنجليزي.'),
  ],
  portuguese: [
    rule('Nasal vowels', 'ÃO / EM', 'não / bem', '/nɐ̃w̃/ /bẽj̃/', 'Keep nasal resonance smooth without adding a hard final consonant.', 'خلي الرنين أنفي من غير قفل قوي في آخر الكلمة.'),
    rule('Brazilian T/D before I', 'TI / DI', 'tia / dia', '/tʃi/ /dʒi/', 'In many Brazilian accents, T and D before i become affricates.', 'في نطق برازيلي شائع، ti وdi يقربوا من تشي وجي.'),
  ],
  english: [
    rule('TH sounds', 'TH', 'think / this', '/θ/ /ð/', 'Place the tongue lightly between the teeth; use voice for /ð/.', 'حط طرف اللسان بين الأسنان بخفة، ومع this شغّل الصوت.'),
    rule('Word stress', 'Stress', 'PREsent / preSENT', 'stress contrast', 'Make the stressed syllable longer, clearer, and slightly stronger.', 'المقطع المشدد يبقى أوضح وأطول وأقوى شوية.'),
  ],
  russian: [
    rule('Hard vs soft consonants', 'Palatalization', 'мат / мать', 'hard vs soft', 'For soft consonants, raise the middle of the tongue toward the palate.', 'في الحرف الناعم ارفع منتصف اللسان ناحية سقف الفم.'),
    rule('Unstressed O', 'Vowel reduction', 'молоко', 'o → a-like when unstressed', 'Reduce unstressed O toward an A-like sound in common speech.', 'الـO غير المشددة غالباً تقرب من صوت A.'),
  ],
  japanese: [
    rule('Mora timing', 'Rhythm', 'こんにちは', 'ko-n-ni-chi-wa', 'Keep each mora roughly even in duration.', 'خلي كل وحدة صوتية تقريباً بنفس الطول.'),
    rule('Japanese R', 'R', 'ありがとう', '/ɾ/', 'Use a light tongue tap between English R and L.', 'اعمل نقرة خفيفة باللسان بين R وL الإنجليزي.'),
  ],
  korean: [
    rule('Three-way stops', 'ㄱ / ㅋ / ㄲ', '가 / 카 / 까', 'plain / aspirated / tense', 'Contrast relaxed, strongly aspirated, and tense consonants.', 'فرّق بين العادي والمنفوخ والمشدود.'),
    rule('Batchim', 'Final consonants', '한국', 'han-guk', 'Release final consonants very lightly unless linking to a following vowel.', 'الحرف النهائي يتقفل بخفة إلا لو بيتوصل بحركة بعده.'),
  ],
  'arabic-msa': [
    rule('Emphatic consonants', 'ص ض ط ظ', 'صَبر / طَريق', 'emphatic', 'Retract the tongue slightly to create a darker resonance.', 'ارجع اللسان شوية لورا عشان التفخيم يبقى واضح.'),
    rule('Ayn and Haa', 'ع / ح', 'عربي / حب', '/ʕ/ /ħ/', 'Use controlled throat constriction without forcing or coughing.', 'استخدم تضييق خفيف في الحلق من غير ضغط مبالغ.'),
  ],
  chinese: [
    rule('Four tones', 'Tones', 'mā / má / mǎ / mà', '55 / 35 / 214 / 51', 'Treat pitch contour as part of the word, not optional intonation.', 'اعتبر النغمة جزء من الكلمة نفسها، مش مجرد طريقة كلام.'),
    rule('Retroflex initials', 'zh / ch / sh', '中文 / 吃 / 是', 'retroflex', 'Curl the tongue tip slightly back; contrast with z/c/s.', 'ارجع طرف اللسان شوية وميّزهم عن z/c/s.'),
  ],
};

export function getSurvivalPhrases(languageId: string): SurvivalPhrase[] {
  return SURVIVAL_PHRASES[languageId] || [];
}

export function getAccentRules(languageId: string): AccentRule[] {
  return ACCENT_RULES[languageId] || [];
}

export function getAccentCoachingTips(languageId: string, nativeLanguageId?: string): AccentCoachingTip[] {
  return getAccentRules(languageId).map((r) => ({
    title: r.title || r.letterOrSound,
    description: r.description || r.ruleEn || r.ruleAr,
    example: r.example || r.exampleTarget,
  }));
}
