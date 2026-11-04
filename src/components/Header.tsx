import React, { useState } from 'react';
import {
  Flame,
  Zap,
  Volume2,
  Settings2,
  ChevronDown,
  Sparkles,
  Headphones,
  Check
} from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { LanguageCode, UserStats } from '../types';
import { AudioSettings } from '../utils/storage';

interface HeaderProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  stats: UserStats;
  audioSettings: AudioSettings;
  onUpdateAudioSettings: (settings: AudioSettings) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onSelectLang,
  stats,
  audioSettings,
  onUpdateAudioSettings,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const langInfo = LANGUAGES[currentLang];
  const progressPercent = Math.min(100, Math.round((stats.todayXP / stats.dailyGoalXP) * 100));

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Polyglot<span className="text-amber-400">Pulse</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  IA Vocal
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Alemán • Inglés • Chino con Fluidez Automática
              </p>
            </div>
          </div>

          {/* Center: Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition shadow-sm text-sm font-semibold"
            >
              <span className="text-xl leading-none">{langInfo.flag}</span>
              <span className="hidden md:inline text-slate-200">{langInfo.name}</span>
              <span className="text-xs text-slate-400 font-normal">({langInfo.nativeName})</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showLangMenu && (
              <div
                className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                  Selecciona idioma de práctica
                </div>
                {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
                  const item = LANGUAGES[code];
                  const isSelected = code === currentLang;
                  return (
                    <button
                      key={code}
                      onClick={() => {
                        onSelectLang(code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition ${
                        isSelected
                          ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                          : 'text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl leading-none">{item.flag}</span>
                        <div>
                          <p className="text-sm font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.nativeName}</p>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Stats, Streak & Audio Settings */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Streak */}
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold"
              title="Días consecutivos de práctica"
            >
              <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
              <span>{stats.streak} {stats.streak === 1 ? 'día' : 'días'}</span>
            </div>

            {/* Daily XP Progress */}
            <div
              className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-xs"
              title={`Meta diaria: ${stats.todayXP}/${stats.dailyGoalXP} XP`}
            >
              <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <div className="w-20 bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-slate-300 font-semibold">{stats.todayXP}/{stats.dailyGoalXP} XP</span>
            </div>

            {/* Total XP */}
            <div className="flex items-center space-x-1 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-xl">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{stats.xp} XP</span>
            </div>

            {/* Audio Settings Toggle Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Ajustes de audio y voz IA"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Audio Settings Modal */}
      {showSettingsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowSettingsModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Ajustes de Voz y Audio IA</h3>
                  <p className="text-xs text-slate-400">Personaliza la síntesis y el reconocimiento</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Studio AI TTS vs Web Speech */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="space-y-0.5 pr-2">
                  <p className="text-sm font-semibold text-slate-200">Audio Estudio IA (Gemini 3.8 TTS)</p>
                  <p className="text-xs text-slate-400">
                    Voz nativa de alta definición con entonación realista. Si se desactiva, usa la voz local del navegador.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateAudioSettings({
                      ...audioSettings,
                      useStudioAI: !audioSettings.useStudioAI,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    audioSettings.useStudioAI ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      audioSettings.useStudioAI ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Playback speed */}
              <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">Velocidad de reproducción</span>
                  <span className="text-xs font-mono font-bold text-indigo-400">{audioSettings.playbackSpeed}x</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[0.8, 1.0, 1.2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() =>
                        onUpdateAudioSettings({
                          ...audioSettings,
                          playbackSpeed: spd,
                        })
                      }
                      className={`py-1.5 rounded-lg text-xs font-semibold transition border ${
                        audioSettings.playbackSpeed === spd
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {spd === 0.8 ? '0.8x (Lento)' : spd === 1.0 ? '1.0x (Normal)' : '1.2x (Rápido)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-slate-200">Efectos sonoros de gamificación</p>
                  <p className="text-xs text-slate-400">Chimes de acierto, error y fanfarria de nivel</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateAudioSettings({
                      ...audioSettings,
                      soundEffects: !audioSettings.soundEffects,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    audioSettings.soundEffects ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      audioSettings.soundEffects ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
