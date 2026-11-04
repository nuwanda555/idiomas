import React, { useState } from 'react';
import {
  Volume2,
  RotateCw,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { VOCABULARY_DECKS, LANGUAGES } from '../data/languages';
import { LanguageCode, VocabularyCard } from '../types';
import { playLanguageAudio, playCorrectSound } from '../utils/audio';
import { AudioSettings } from '../utils/storage';

interface VocabularyDeckProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onEarnXP: (xp: number) => void;
}

export const VocabularyDeck: React.FC<VocabularyDeckProps> = ({
  language,
  audioSettings,
  onEarnXP,
}) => {
  const cards = VOCABULARY_DECKS[language] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentCard = cards[currentIndex] || cards[0];

  const handlePlayAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentCard) return;
    playLanguageAudio(currentCard.word, language, {
      useStudioAI: audioSettings.useStudioAI,
      rate: audioSettings.playbackSpeed,
    });
  };

  const handleRateCard = (rating: 'hard' | 'good' | 'easy') => {
    setIsFlipped(false);
    setReviewedCount((prev) => prev + 1);

    const xpEarned = rating === 'easy' ? 10 : rating === 'good' ? 8 : 5;
    onEarnXP(xpEarned);
    playCorrectSound();

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0); // loop back
      }
    }, 200);
  };

  if (!currentCard) return null;

  // Gender color styling for German
  const genderColor =
    currentCard.gender === 'der'
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
      : currentCard.gender === 'die'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : currentCard.gender === 'das'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : '';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Deck Stats Header */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-bold text-slate-200">
            Tarjeta {currentIndex + 1} de {cards.length}
          </span>
          <span className="text-xs text-slate-400">• Categoría: {currentCard.category}</span>
        </div>

        <div className="text-xs text-emerald-400 font-semibold">
          {reviewedCount} repasadas hoy
        </div>
      </div>

      {/* Flip Card Arena */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="cursor-pointer min-h-[360px] rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl relative flex flex-col justify-between items-center text-center transition-all duration-300 hover:border-slate-700 backdrop-blur-xl group"
      >
        {/* Top Badges */}
        <div className="w-full flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Nivel {currentCard.level}
          </span>

          {currentCard.gender && (
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${genderColor}`}>
              Artículo: {currentCard.gender}
            </span>
          )}

          <button
            onClick={handlePlayAudio}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition"
            title="Escuchar audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content */}
        <div className="space-y-3 py-6">
          {!isFlipped ? (
            <>
              {/* Pinyin if Chinese */}
              {currentCard.pinyin && (
                <p className="text-lg font-mono font-medium text-amber-400 tracking-wider">
                  {currentCard.pinyin}
                </p>
              )}

              {/* Main Word */}
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {currentCard.word}
              </h2>

              {currentCard.ipa && (
                <p className="text-xs font-mono text-slate-400">
                  {currentCard.ipa}
                </p>
              )}

              <p className="text-xs text-slate-400 pt-4 flex items-center justify-center space-x-1.5 opacity-80 group-hover:opacity-100 transition">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Haz clic para voltear y ver traducción y ejemplo</span>
              </p>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Significado en Español:
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-400">
                {currentCard.translation}
              </h3>

              {/* Example sentence */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left space-y-1">
                <p className="text-sm font-semibold text-slate-100">{currentCard.example}</p>
                <p className="text-xs text-slate-400 italic">{currentCard.exampleTranslation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Cue */}
        <div className="w-full text-center text-xs text-slate-400">
          {!isFlipped ? 'Pulsa en la tarjeta para revelar respuesta' : 'Selecciona cómo recuerdas esta palabra abajo:'}
        </div>
      </div>

      {/* Spaced Repetition SRS Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => handleRateCard('hard')}
            className="p-3.5 rounded-2xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-200 text-xs sm:text-sm font-bold transition text-center shadow-lg"
          >
            <div>Difícil</div>
            <span className="text-[10px] opacity-75 font-normal">Repasar hoy (+5 XP)</span>
          </button>
          <button
            onClick={() => handleRateCard('good')}
            className="p-3.5 rounded-2xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm font-bold transition text-center shadow-lg"
          >
            <div>Bien</div>
            <span className="text-[10px] opacity-75 font-normal">En 3 días (+8 XP)</span>
          </button>
          <button
            onClick={() => handleRateCard('easy')}
            className="p-3.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm font-bold transition text-center shadow-lg"
          >
            <div>Fácil</div>
            <span className="text-[10px] opacity-75 font-normal">En 7 días (+10 XP)</span>
          </button>
        </div>
      )}
    </div>
  );
};
