import React, { useState } from 'react';
import {
  Utensils,
  Compass,
  Briefcase,
  ShoppingBag,
  HeartPulse,
  Coffee,
  Sparkles,
  PlusCircle,
  Search,
  CheckCircle2,
  ChevronRight,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Language, ProficiencyLevel, Scenario } from '../types';
import { SCENARIOS, getDefaultScenarioForLanguageAndLevel } from '../data/scenarios';
import { getSurvivalPhrases } from '../data/languageAids';

interface ScenarioSelectorProps {
  language: Language;
  currentLevel: ProficiencyLevel;
  onSelectScenario: (scenario: Scenario) => void;
  onSelectVoiceRoom: (scenario: Scenario) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  language,
  currentLevel,
  onSelectScenario,
  onSelectVoiceRoom,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const defaultScenario = getDefaultScenarioForLanguageAndLevel(language, currentLevel);
  const rawLanguageScenarios = SCENARIOS[language.id] || [];
  
  const allScenarios = rawLanguageScenarios.length > 0 
    ? rawLanguageScenarios 
    : [defaultScenario];

  const survivalPhrases = getSurvivalPhrases(language.id);

  const categories = ['All', 'Dining', 'Travel', 'Career', 'Daily Life'];
  const levels = ['All', 'A1', 'A2', 'B1', 'B2'];

  const filteredScenarios = allScenarios.filter((sc) => {
    const matchesCategory = selectedCategory === 'All' || sc.category === selectedCategory;
    const matchesLevel = selectedLevelFilter === 'All' || sc.difficultyLevel === selectedLevelFilter;
    const matchesSearch =
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.setting.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Dining':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      case 'Travel':
        return <Compass className="w-5 h-5 text-cyan-400" />;
      case 'Career':
        return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'Shopping':
        return <ShoppingBag className="w-5 h-5 text-emerald-400" />;
      case 'Health':
        return <HeartPulse className="w-5 h-5 text-rose-400" />;
      default:
        return <Coffee className="w-5 h-5 text-purple-400" />;
    }
  };

  const handleGenerateCustomScenario = async () => {
    if (!customPrompt.trim() || isGeneratingCustom) return;
    setIsGeneratingCustom(true);
    setCustomError(null);

    try {
      const res = await fetch('/api/scenario/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: customPrompt,
          language: language.name,
          level: currentLevel,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate custom scenario');
      }

      const generatedScenario: Scenario = await res.json();
      setShowCustomModal(false);
      setCustomPrompt('');
      onSelectScenario(generatedScenario);
    } catch (err: any) {
      console.error('Error generating scenario:', err);
      setCustomError(err.message || 'Failed to generate scenario. Please try again.');
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/60 via-indigo-950/50 to-black/90 border border-white/10 p-8 shadow-2xl mb-8 backdrop-blur-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono font-bold uppercase tracking-wider w-fit mb-3">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target: {language.name} {language.flag} • Current Level: {currentLevel}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Practice Real-Life {language.name} with AI Coach
          </h1>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {currentLevel === 'A1' 
              ? `Welcome beginner! We've prepared ultra-simple, slow-paced A1 roleplays in ${language.name} with phonetic pronunciation, word-by-word guides, and instant explanations.`
              : `Step into authentic roleplay scenarios tailored for your ${currentLevel} level in ${language.name}. Get instant grammar feedback, native voice audio, and pronunciation guidance.`
            }
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectVoiceRoom(defaultScenario)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Start Live Voice ({currentLevel})</span>
            </button>

            <button
              onClick={() => onSelectScenario(defaultScenario)}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Launch {currentLevel} Roleplay</span>
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Custom Scenario</span>
            </button>
          </div>
        </div>
      </div>

      {/* Beginner Quick Phrasebook Preview */}
      {currentLevel === 'A1' && survivalPhrases.length > 0 && (
        <div className="mb-8 p-5 rounded-3xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>A1 Beginner Starter Kit: Essential {language.name} Phrases</span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">Ready to listen and practice</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {survivalPhrases.slice(0, 6).map((phrase) => (
              <div
                key={phrase.id}
                className="p-3 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/30 text-xs flex flex-col justify-between transition-all"
              >
                <div className="font-bold text-white text-sm">{phrase.target}</div>
                {phrase.romanization && (
                  <div className="text-[11px] text-cyan-300/80 font-mono italic mt-0.5">{phrase.romanization}</div>
                )}
                <div className="text-[11px] text-slate-300 mt-1 border-t border-white/5 pt-1">
                  {phrase.translationAr}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-full">
            <span className="text-[10px] font-mono text-slate-500 pl-2 pr-1">LEVEL:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevelFilter(lvl)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedLevelFilter === lvl
                    ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${language.name} scenarios...`}
            className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredScenarios.map((sc) => (
          <div
            key={sc.id}
            className={`bg-black/40 backdrop-blur-xl rounded-3xl border p-6 shadow-2xl transition-all flex flex-col justify-between group ${
              sc.difficultyLevel === currentLevel
                ? 'border-cyan-500/40 bg-cyan-950/10 hover:border-cyan-400 hover:bg-black/50'
                : 'border-white/10 hover:border-cyan-400/40 hover:bg-black/50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                  {getCategoryIcon(sc.category)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    sc.difficultyLevel === currentLevel
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 ring-1 ring-cyan-400/30'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}>
                    {sc.difficultyLevel}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    {sc.category}
                  </span>
                </div>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {sc.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {sc.setting}
              </p>

              <div className="mt-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] space-y-1">
                <div>
                  <span className="text-slate-500 font-semibold font-mono text-[10px]">YOU:</span>{' '}
                  <span className="text-slate-200">{sc.role}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold font-mono text-[10px]">PARTNER:</span>{' '}
                  <span className="text-cyan-300 font-medium">{sc.partnerRole}</span>
                </div>
              </div>

              <div className="mt-3.5 space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Goals to achieve:
                </span>
                {sc.objectives.slice(0, 2).map((obj, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
              <button
                onClick={() => onSelectScenario(sc)}
                className="flex-1 py-2.5 rounded-full bg-white hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Roleplay</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onSelectVoiceRoom(sc)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-cyan-500/20 border border-white/10 text-cyan-400 hover:text-cyan-300 transition-all text-xs font-bold cursor-pointer"
                title="Practice with Live Voice Call"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scenario Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#030712]/95 border border-white/10 backdrop-blur-2xl rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Create Custom Roleplay</h2>
                <p className="text-xs text-slate-400">
                  Target Language: <strong className="text-cyan-300">{language.name}</strong> ({currentLevel})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Describe any situation you want to practice in {language.name} — for example:
              <br />
              <span className="italic text-cyan-300/90">
                "Checking into a traditional hotel or asking directions to the central train station"
              </span>
            </p>

            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`e.g., I want to practice ordering food and asking about the bill in ${language.name}...`}
              rows={4}
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 mb-3"
            />

            {customError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs mb-3">
                {customError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCustomScenario}
                disabled={!customPrompt.trim() || isGeneratingCustom}
                className="px-5 py-2.5 rounded-full bg-white hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isGeneratingCustom && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isGeneratingCustom ? 'Creating Roleplay...' : 'Generate Roleplay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
