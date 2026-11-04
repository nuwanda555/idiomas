import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Mic,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Award,
  Globe2,
  Volume2,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Radio
} from 'lucide-react';
import { Header } from './components/Header';
import { DailyMission } from './components/DailyMission';
import { PronunciationLab } from './components/PronunciationLab';
import { ConversationTutor } from './components/ConversationTutor';
import { GrammarDrills } from './components/GrammarDrills';
import { VocabularyDeck } from './components/VocabularyDeck';
import { FreeSpeechTest } from './components/FreeSpeechTest';
import { LANGUAGES } from './data/languages';
import { LanguageCode, UserStats } from './types';
import {
  loadUserStats,
  saveUserStats,
  addXP,
  loadActiveLanguage,
  saveActiveLanguage,
  loadAudioSettings,
  saveAudioSettings,
  AudioSettings
} from './utils/storage';

type AppTab =
  | 'daily_mission'
  | 'pronunciation_lab'
  | 'tutor_chat'
  | 'grammar'
  | 'vocabulary'
  | 'free_speech';

export default function App() {
  const [currentLang, setCurrentLang] = useState<LanguageCode>('de');
  const [activeTab, setActiveTab] = useState<AppTab>('daily_mission');
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(loadAudioSettings);
  const [xpBanner, setXpBanner] = useState<number | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedLang = loadActiveLanguage();
    setCurrentLang(savedLang);
    setStats(loadUserStats());
    setAudioSettings(loadAudioSettings());
  }, []);

  const handleSelectLanguage = (lang: LanguageCode) => {
    setCurrentLang(lang);
    saveActiveLanguage(lang);
  };

  const handleUpdateAudioSettings = (newSettings: AudioSettings) => {
    setAudioSettings(newSettings);
    saveAudioSettings(newSettings);
  };

  const handleEarnXP = (amount: number) => {
    const updated = addXP(amount);
    setStats(updated);
    setXpBanner(amount);
    setTimeout(() => {
      setXpBanner(null);
    }, 2200);
  };

  const currentLangInfo = LANGUAGES[currentLang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* XP Floating Toast */}
      {xpBanner && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-black text-sm shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <Zap className="w-4 h-4 fill-white" />
          <span>+{xpBanner} XP Ganados</span>
        </div>
      )}

      {/* Top Navbar */}
      <Header
        currentLang={currentLang}
        onSelectLang={handleSelectLanguage}
        stats={stats}
        audioSettings={audioSettings}
        onUpdateAudioSettings={handleUpdateAudioSettings}
      />

      {/* Language Overview Sub-Header */}
      <div className="border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950/90 py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-4xl sm:text-5xl drop-shadow-md select-none">{currentLangInfo.flag}</span>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentLangInfo.name} <span className="text-slate-400 font-semibold text-lg">({currentLangInfo.nativeName})</span>
                </h1>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Nivel {stats.levelByLanguage[currentLang]}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentLangInfo.description}
              </p>
            </div>
          </div>

          {/* Quick phonetic tip snippet */}
          <div className="hidden lg:flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-slate-800/60 border border-slate-700/60 max-w-md text-xs text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              <span className="font-bold text-amber-300">Fonética:</span> {currentLangInfo.phoneticHighlights[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
            {[
              {
                id: 'daily_mission',
                label: 'Misión Diaria',
                icon: <Zap className="w-4 h-4" />,
                badge: 'Diario',
              },
              {
                id: 'pronunciation_lab',
                label: 'Pronunciación & Fluidez',
                icon: <Mic className="w-4 h-4" />,
                badge: 'Voz IA',
              },
              {
                id: 'tutor_chat',
                label: 'Tutor Conversacional',
                icon: <MessageSquare className="w-4 h-4" />,
                badge: 'Diálogo',
              },
              {
                id: 'grammar',
                label: 'Gramática',
                icon: <GraduationCap className="w-4 h-4" />,
              },
              {
                id: 'vocabulary',
                label: 'Vocabulario SRS',
                icon: <BookOpen className="w-4 h-4" />,
              },
              {
                id: 'free_speech',
                label: 'Test de Fluidez Libre',
                icon: <Radio className="w-4 h-4" />,
              },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AppTab)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Tab View Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'daily_mission' && (
          <DailyMission
            language={currentLang}
            audioSettings={audioSettings}
            onEarnXP={handleEarnXP}
            onCompleteMission={() => {}}
          />
        )}

        {activeTab === 'pronunciation_lab' && (
          <PronunciationLab
            language={currentLang}
            audioSettings={audioSettings}
            onEarnXP={handleEarnXP}
          />
        )}

        {activeTab === 'tutor_chat' && (
          <ConversationTutor
            language={currentLang}
            audioSettings={audioSettings}
            onEarnXP={handleEarnXP}
          />
        )}

        {activeTab === 'grammar' && (
          <GrammarDrills
            language={currentLang}
            onEarnXP={handleEarnXP}
          />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyDeck
            language={currentLang}
            audioSettings={audioSettings}
            onEarnXP={handleEarnXP}
          />
        )}

        {activeTab === 'free_speech' && (
          <FreeSpeechTest
            language={currentLang}
            onEarnXP={handleEarnXP}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p className="max-w-md mx-auto">
          PolyglotPulse • Entrena tu oído, voz y gramática en Alemán (Deutsch), Inglés y Chino Mandarín (中文) con inteligencia artificial.
        </p>
      </footer>
    </div>
  );
}
