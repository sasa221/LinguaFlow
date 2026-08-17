import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Award, Sparkles } from 'lucide-react';
import { CurriculumUnit, Language } from '../../types';

interface TestOutModalProps {
  unit: CurriculumUnit;
  language: Language;
  onPassed: () => void;
  onClose: () => void;
}

export const TestOutModal: React.FC<TestOutModalProps> = ({
  unit,
  language,
  onPassed,
  onClose,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Generate 3 sample test-out questions from unit vocabulary
  const questions = unit.vocabularyTargets.slice(0, 3).map((vocab, idx) => {
    const distractors = unit.vocabularyTargets
      .filter((v) => v.id !== vocab.id)
      .map((v) => v.translation)
      .slice(0, 2);

    const options = [vocab.translation, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(vocab.translation);

    return {
      prompt: `What is the meaning of "${vocab.word}"?`,
      options,
      correctIndex,
      word: vocab.word,
    };
  });

  const currentQ = questions[currentIdx] || questions[0];

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
      if (correctCount + (selectedOption === currentQ.correctIndex ? 1 : 0) >= 2) {
        onPassed();
      }
    }
  };

  const passed = correctCount >= 2;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Test Out • {unit.title}
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isCompleted ? (
          <div>
            <p className="text-xs text-slate-400 mb-6">
              Demonstrate prerequisite mastery of {unit.title} to skip directly forward. (Question {currentIdx + 1} of {questions.length})
            </p>

            <h3 className="text-lg font-bold text-white mb-4 text-center">
              {currentQ.prompt}
            </h3>

            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = 'bg-slate-950/60 border-white/10 hover:border-cyan-500/40 text-slate-200';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-100';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-100';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={`w-full p-4 rounded-2xl border text-left font-semibold text-sm transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <span>{currentIdx < questions.length - 1 ? 'Next Question' : 'View Result'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            {passed ? (
              <div>
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Mastery Confirmed!</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6">
                  You successfully verified proficiency in {unit.title}. The unit and subsequent lessons are now unlocked!
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                >
                  Continue Course
                </button>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Almost Ready</h3>
                <p className="text-xs sm:text-sm text-slate-300 mb-6">
                  We recommend completing the structured lessons in {unit.title} to build a solid foundation.
                </p>
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
                >
                  Return to Lessons
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
