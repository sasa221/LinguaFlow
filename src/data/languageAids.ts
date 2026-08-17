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

export const SURVIVAL_PHRASES: Record<string, SurvivalPhrase[]> = {
  spanish: [
    {
      id: 'es-1',
      target: 'Por favor',
      romanization: 'por fah-bor',
      translationAr: 'من فضلك / لو سمحت',
      translationEn: 'Please',
    },
    {
      id: 'es-2',
      target: 'Muchas gracias',
      romanization: 'moo-chas grah-syas',
      translationAr: 'شكراً جزيلاً',
      translationEn: 'Thank you very much',
    },
    {
      id: 'es-3',
      target: '¿Cuánto cuesta?',
      romanization: 'kwan-to kwes-tah',
      translationAr: 'بكم هذا؟ / كم السعر؟',
      translationEn: 'How much does it cost?',
    },
    {
      id: 'es-4',
      target: '¿Dónde está el baño?',
      romanization: 'don-deh es-tah el bah-nyo',
      translationAr: 'أين الحمام؟',
      translationEn: 'Where is the restroom?',
    },
    {
      id: 'es-5',
      target: 'No entiendo, más despacio por favor',
      romanization: 'no en-tyen-do, mas des-pah-syo por fah-bor',
      translationAr: 'مش فاهم، بالراحة لو سمحت',
      translationEn: 'I do not understand, slower please',
    },
    {
      id: 'es-6',
      target: 'La cuenta, por favor',
      romanization: 'lah kwen-tah por fah-bor',
      translationAr: 'الحساب من فضلك',
      translationEn: 'The check / bill, please',
    },
  ],
  french: [
    {
      id: 'fr-1',
      target: 'S\'il vous plaît',
      romanization: 'seel voo pleh',
      translationAr: 'من فضلك',
      translationEn: 'Please',
    },
    {
      id: 'fr-2',
      target: 'Merci beaucoup',
      romanization: 'mair-see boh-koo',
      translationAr: 'شكراً جزيلاً',
      translationEn: 'Thank you very much',
    },
    {
      id: 'fr-3',
      target: 'Combien ça coûte ?',
      romanization: 'kom-byen sah koot',
      translationAr: 'بكام ده؟',
      translationEn: 'How much is it?',
    },
    {
      id: 'fr-4',
      target: 'Où sont les toilettes ?',
      romanization: 'oo sohn lay twah-let',
      translationAr: 'أين دورة المياه؟',
      translationEn: 'Where is the restroom?',
    },
    {
      id: 'fr-5',
      target: 'Pouvez-vous répéter ?',
      romanization: 'poo-vay voo ray-pay-tay',
      translationAr: 'ممكن تكرر من فضلك؟',
      translationEn: 'Could you repeat?',
    },
    {
      id: 'fr-6',
      target: 'L\'addition, s\'il vous plaît',
      romanization: 'lah-dee-syon seel voo pleh',
      translationAr: 'الحساب لو سمحت',
      translationEn: 'The check, please',
    },
  ],
  german: [
    {
      id: 'de-1',
      target: 'Bitte',
      romanization: 'bi-te',
      translationAr: 'من فضلك / عفواً',
      translationEn: 'Please / You are welcome',
    },
    {
      id: 'de-2',
      target: 'Vielen Dank',
      romanization: 'fee-len dank',
      translationAr: 'شكراً جزيلاً',
      translationEn: 'Thank you very much',
    },
    {
      id: 'de-3',
      target: 'Wie viel kostet das?',
      romanization: 'vee feel kos-tet das',
      translationAr: 'بكم هذا؟',
      translationEn: 'How much does that cost?',
    },
  ],
  italian: [
    {
      id: 'it-1',
      target: 'Per favore',
      romanization: 'pehr fah-voh-reh',
      translationAr: 'من فضلك',
      translationEn: 'Please',
    },
    {
      id: 'it-2',
      target: 'Grazie mille',
      romanization: 'graht-syeh meel-leh',
      translationAr: 'شكراً جزيلاً',
      translationEn: 'Thank you very much',
    },
  ],
  japanese: [
    {
      id: 'ja-1',
      target: 'お願いします',
      romanization: 'Onegaishimasu',
      translationAr: 'من فضلك / رجاءً',
      translationEn: 'Please',
    },
    {
      id: 'ja-2',
      target: 'ありがとうございます',
      romanization: 'Arigatō gozaimasu',
      translationAr: 'شكراً جزيلاً لك',
      translationEn: 'Thank you very much',
    },
  ],
};

export const ACCENT_RULES: Record<string, AccentRule[]> = {
  spanish: [
    {
      title: 'Alveolar Tap & Trill (R / RR)',
      description: 'Single R is a quick tap against the gum ridge; double RR is an energetic vibrant trill.',
      example: 'pero [ˈpe.ɾo] vs perro [ˈpe.ro]',
      letterOrSound: 'Letra R / RR',
      exampleTarget: 'Pero vs Perro',
      examplePhonetic: '[ˈpe.ɾo] vs [ˈpe.ro]',
      ruleAr: 'حرف R المفرد ينطق بنقرة واحدة سريعة على سقف الحلق، بينما RR ينطق باهتزازة قوية متعددة.',
      ruleEn: 'Single R is a quick tap against the alveolar ridge; double RR is an energetic multi-tap trill.',
    },
    {
      title: 'Soft G / J Sound',
      description: 'The Spanish J is pronounced as a soft velar /h/ or /x/ sound without harsh throat friction.',
      example: 'jalapeño [xa.la.ˈpe.ɲo]',
      letterOrSound: 'Letra J / G',
      exampleTarget: 'Jalapeño / Gente',
      examplePhonetic: '[xa.la.ˈpe.ɲo] / [ˈxen.te]',
      ruleAr: 'تنطق الـ J مثل الخاء الخفيفة جداً في العربية أو الهاء المفخمة [x].',
      ruleEn: 'The letter J is pronounced as a soft velar /h/ or /x/ sound.',
    },
    {
      title: 'Pure Open Vowels',
      description: 'Spanish vowels (A, E, I, O, U) never glide into diphthongs. Keep them crisp and short.',
      example: 'mesa [ˈme.sa], no [no]',
      letterOrSound: 'Pure Vowels',
      exampleTarget: 'Mesa / No',
      examplePhonetic: '[ˈme.sa] / [no]',
      ruleAr: 'الحركات الإسبانية نقية وقصيرة ولا تتحول إلى مدود مركبة.',
      ruleEn: 'Vowels are short, crisp, and pure without gliding.',
    },
  ],
  french: [
    {
      title: 'Nasal Vowels (AN, ON, IN)',
      description: 'Air resonates through the nasal cavity without pressing lips or pronouncing an explicit "N".',
      example: 'pain [pɛ̃], bon [bɔ̃]',
      letterOrSound: 'Voyelles Nasales',
      exampleTarget: 'Pain / Bon / Enfant',
      examplePhonetic: '[pɛ̃] / [bɔ̃] / [ɑ̃.fɑ̃]',
      ruleAr: 'الحروف الأنفية يمر فيها الهواء جزئياً من الأنف دون إطباق الشفاه.',
      ruleEn: 'Air flows through the nasal cavity without closing lips.',
    },
    {
      title: 'The French R [ʁ]',
      description: 'Articulated gently in the back of the throat at the uvula, like a delicate Arabic Ghain.',
      example: 'bonjour [bɔ̃.ʒuʁ]',
      letterOrSound: 'Le R Français',
      exampleTarget: 'Bonjour / Merci',
      examplePhonetic: '[bɔ̃.ʒuʁ] / [mɛʁ.si]',
      ruleAr: 'تنطق الراء الفرنسية من أقصى اللهاة مثل حرف الغين الخفيف [ʁ].',
      ruleEn: 'The French R is articulated uvularly.',
    },
  ],
};

export function getSurvivalPhrases(languageId: string): SurvivalPhrase[] {
  return SURVIVAL_PHRASES[languageId] || SURVIVAL_PHRASES.spanish;
}

export function getAccentRules(languageId: string): AccentRule[] {
  return ACCENT_RULES[languageId] || ACCENT_RULES.spanish;
}

export function getAccentCoachingTips(languageId: string, nativeLanguageId?: string): AccentCoachingTip[] {
  const rules = getAccentRules(languageId);
  return rules.map((r) => ({
    title: r.title || r.letterOrSound,
    description: r.description || r.ruleEn || r.ruleAr,
    example: r.example || r.exampleTarget,
  }));
}
