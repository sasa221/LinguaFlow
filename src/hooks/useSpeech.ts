/**
2:  * Speech Synthesis Utility for pronunciation and audio playback
3:  */
export function speakText(text: string, speechCode = 'es-ES'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = speechCode;
    utterance.rate = 0.88; // clear beginner speed
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

export function useSpeech() {
  const speak = (text: string, speechCode = 'es-ES') => {
    speakText(text, speechCode);
  };

  return { speak };
}
