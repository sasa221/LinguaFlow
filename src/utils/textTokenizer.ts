/**
 * Language-aware Tokenizer using Intl.Segmenter with multilingual fallback
 */

export interface WordToken {
  text: string;
  cleanWord: string;
  isWord: boolean;
}

export function tokenizeSentence(sentence: string, languageId: string): WordToken[] {
  if (!sentence) return [];

  // Check if Intl.Segmenter is supported
  if (typeof Intl !== 'undefined' && (Intl as any).Segmenter) {
    try {
      const locale = mapLanguageIdToLocale(languageId);
      const segmenter = new (Intl as any).Segmenter(locale, { granularity: 'word' });
      const segments = Array.from(segmenter.segment(sentence)) as any[];

      return segments.map((seg) => {
        const clean = seg.segment.replace(/[¿?¡!.,;:()"']/g, '').trim();
        return {
          text: seg.segment,
          cleanWord: clean,
          isWord: seg.isWordLike && clean.length > 0,
        };
      });
    } catch (e) {
      // fallback to regex
    }
  }

  // Regex-based fallback for standard spacing & punctuation separation
  const regex = /([\p{L}\p{N}_\-]+|[^\s\p{L}\p{N}_\-]+|\s+)/gu;
  const matches = sentence.match(regex) || [sentence];

  return matches.map((token) => {
    const isWord = /[\p{L}\p{N}]/u.test(token);
    const clean = token.replace(/[¿?¡!.,;:()"']/gu, '').trim();
    return {
      text: token,
      cleanWord: clean,
      isWord: isWord && clean.length > 0,
    };
  });
}

function mapLanguageIdToLocale(languageId: string): string {
  switch (languageId) {
    case 'spanish':
      return 'es-ES';
    case 'french':
      return 'fr-FR';
    case 'german':
      return 'de-DE';
    case 'italian':
      return 'it-IT';
    case 'japanese':
      return 'ja-JP';
    case 'chinese':
      return 'zh-CN';
    case 'russian':
      return 'ru-RU';
    case 'portuguese':
      return 'pt-BR';
    case 'arabic-msa':
    case 'arabic-eg':
      return 'ar';
    default:
      return 'en-US';
  }
}
