import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Volume2,
  Mic,
  Square,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award,
  Zap,
  HelpCircle,
  Lightbulb,
  Check
} from 'lucide-react';
import { DAILY_EXERCISES, LANGUAGES } from '../data/languages';
import {
  LanguageCode,
  DailyExercise,
  SyntaxExercise,
  FillExercise,
  VocabularyExercise,
  PronunciationExercise,
  ListeningExercise,
  FluencyEvaluation
} from '../types';
import { playLanguageAudio, playCorrectSound, playWrongSound, playCelebrationSound, playMicTone } from '../utils/audio';
import { createSpeechSession } from '../utils/speechRecognition';
import { AudioSettings } from '../utils/storage';

interface DailyMissionProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onEarnXP: (xp: number) => void;
  onCompleteMission: () => void;
}

export const DailyMission: React.FC<DailyMissionProps> = ({
  language,
  audioSettings,
  onEarnXP,
  onCompleteMission,
}) => {
  const exercises = DAILY_EXERCISES[language] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scrambledSelected, setScrambledSelected] = useState<string[]>([]);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isMissionComplete, setIsMissionComplete] = useState(false);

  // Pronunciation step state
  const [isRecording, setIsRecording] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [fluencyEval, setFluencyEval] = useState<FluencyEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const currentEx = exercises[currentIndex];
  const progressPercent = Math.round(((currentIndex) / exercises.length) * 100);

  const resetCurrentStep = () => {
    setSelectedOption(null);
    setScrambledSelected([]);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setIsRecording(false);
    setSpokenTranscript('');
    setFluencyEval(null);
  };

  const handlePlayAudio = (text: string, rate: number = 1.0) => {
    playLanguageAudio(text, language, {
      rate: rate * audioSettings.playbackSpeed,
      useStudioAI: audioSettings.useStudioAI,
    });
  };

  // Check Multiple Choice / Fill / Vocabulary
  const handleCheckAnswer = () => {
    if (!currentEx) return;
    setIsAnswerChecked(true);

    let correct = false;
    if (currentEx.type === 'grammar_syntax') {
      const syntaxEx = currentEx as SyntaxExercise;
      correct = JSON.stringify(scrambledSelected) === JSON.stringify(syntaxEx.correctOrder);
    } else if (currentEx.type === 'vocabulary') {
      const vocabEx = currentEx as VocabularyExercise;
      correct = selectedOption === vocabEx.correctAnswer;
    } else if (currentEx.type === 'grammar_fill') {
      const fillEx = currentEx as FillExercise;
      correct = selectedOption === fillEx.correctAnswer;
    } else if (currentEx.type === 'listening_quiz') {
      const listenEx = currentEx as ListeningExercise;
      correct = selectedOption === listenEx.correctAnswer;
    }

    setIsCorrect(correct);
    if (correct) {
      playCorrectSound();
      onEarnXP(15);
    } else {
      playWrongSound();
    }
  };

  // Pronunciation Recording
  const handleStartPronunciation = async () => {
    setSpokenTranscript('');
    setFluencyEval(null);
    playMicTone(true);
    setIsRecording(true);

    const session = createSpeechSession({
      language,
      onTranscriptChange: (text) => setSpokenTranscript(text),
      onError: (err) => {
        alert(err);
        setIsRecording(false);
      },
    });

    (window as any)._dailySpeechSession = session;
    await session.start();
  };

  const handleStopPronunciation = async () => {
    const session = (window as any)._dailySpeechSession;
    if (!session) return;
    playMicTone(false);
    setIsRecording(false);

    const { transcript, audioBase64 } = await session.stop();
    (window as any)._dailySpeechSession = null;

    const finalText = transcript || spokenTranscript;
    setSpokenTranscript(finalText);

    // Call evaluate fluency
    setIsEvaluating(true);
    try {
      const resp = await fetch('/api/evaluate-fluency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          transcript: finalText,
          targetPhrase: currentEx.targetText,
          targetLanguage: language,
        }),
      });
      if (resp.ok) {
        const data: FluencyEvaluation = await resp.json();
        setFluencyEval(data);
        setIsAnswerChecked(true);
        const passed = data.overallScore >= 65;
        setIsCorrect(passed);
        if (passed) {
          playCorrectSound();
          onEarnXP(25);
        } else {
          playWrongSound();
        }
      }
    } catch (e) {
      console.error('Pronunciation eval error:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      resetCurrentStep();
    } else {
      // Mission Complete!
      setIsMissionComplete(true);
      playCelebrationSound();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
      onEarnXP(50);
      onCompleteMission();
    }
  };

  const handleRestartMission = () => {
    setCurrentIndex(0);
    setIsMissionComplete(false);
    resetCurrentStep();
  };

  if (isMissionComplete) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-amber-500/20 ring-4 ring-amber-400/20">
          <Award className="w-12 h-12 text-white" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            ¡Misión Diaria Completada!
          </span>
          <h2 className="text-3xl font-black text-white">¡Gran Trabajo!</h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Has entrenado gramática, vocabulario y pronunciación en {LANGUAGES[language].name}. Tu racha de estudio se mantiene activa.
          </p>
        </div>

        {/* Reward Badges */}
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-2xl font-black text-emerald-400">+50 XP</div>
            <span className="text-xs text-slate-400">Experiencia ganada</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="text-2xl font-black text-amber-400">🔥 +1 Día</div>
            <span className="text-xs text-slate-400">Racha aumentada</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleRestartMission}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition flex items-center justify-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Repasar ejercicios</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentEx) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Step Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-indigo-400 uppercase tracking-wider">
            Misión Diaria • Paso {currentIndex + 1} de {exercises.length}
          </span>
          <span className="text-slate-400">{progressPercent}% completado</span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-xl">
        {/* Exercise Category Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {currentEx.type === 'grammar_syntax' && 'Gramática • Orden de Palabras'}
              {currentEx.type === 'vocabulary' && 'Vocabulario Clave'}
              {currentEx.type === 'pronunciation' && 'Reconocimiento de Voz & Fluidez'}
              {currentEx.type === 'grammar_fill' && 'Gramática • Completar Espacio'}
              {currentEx.type === 'listening_quiz' && 'Comprensión Auditiva'}
            </span>
          </div>

          <span className="text-xs font-bold text-slate-400">
            Nivel {currentEx.level}
          </span>
        </div>

        {/* Instruction */}
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {currentEx.title}
          </h2>
          <p className="text-sm text-slate-300">{currentEx.instruction}</p>
        </div>

        {/* TYPE 1: GRAMMAR SYNTAX ORDERING */}
        {currentEx.type === 'grammar_syntax' && (
          <div className="space-y-6">
            {/* Target Assembly Area */}
            <div className="min-h-[70px] p-4 rounded-2xl bg-slate-800/60 border-2 border-dashed border-slate-700 flex flex-wrap items-center gap-2">
              {scrambledSelected.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  Haz clic en las palabras de abajo para ordenarlas aquí...
                </span>
              ) : (
                scrambledSelected.map((word, idx) => (
                  <button
                    key={idx}
                    disabled={isAnswerChecked}
                    onClick={() => {
                      setScrambledSelected((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md transition hover:bg-indigo-500 active:scale-95"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word Chips Options */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {(currentEx as SyntaxExercise).scrambledWords.map((word, idx) => {
                const isUsed = scrambledSelected.includes(word);
                return (
                  <button
                    key={idx}
                    disabled={isUsed || isAnswerChecked}
                    onClick={() => setScrambledSelected((prev) => [...prev, word])}
                    className={`px-4 py-2.5 rounded-xl font-bold text-sm transition border ${
                      isUsed
                        ? 'opacity-30 bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 hover:border-indigo-500 active:scale-95 shadow-sm'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TYPE 2: VOCABULARY */}
        {currentEx.type === 'vocabulary' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400">Traducción requerida:</span>
              <p className="text-xl sm:text-2xl font-black text-amber-400">
                "{currentEx.translation}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentEx as VocabularyExercise).options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                return (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => !isAnswerChecked && setSelectedOption(opt)}
                    onKeyDown={(e) => {
                      if (!isAnswerChecked && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedOption(opt);
                      }
                    }}
                    className={`p-4 rounded-2xl text-left font-semibold text-sm transition border flex items-center justify-between cursor-pointer select-none ${
                      isAnswerChecked ? 'cursor-default' : ''
                    } ${
                      isSelected
                        ? 'bg-indigo-600/30 text-white border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(opt);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 transition"
                      title="Escuchar pronunciación"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TYPE 3: FILL IN THE BLANK */}
        {currentEx.type === 'grammar_fill' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 text-center space-y-2">
              <p className="text-xl sm:text-2xl font-extrabold text-white">
                {(currentEx as FillExercise).sentenceWithBlank.replace('___', '______')}
              </p>
              <p className="text-xs text-slate-400 italic">
                {currentEx.translation}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(currentEx as FillExercise).options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={i}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-3.5 rounded-2xl font-bold text-sm transition border text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TYPE 4: PRONUNCIATION RECORDING */}
        {currentEx.type === 'pronunciation' && (
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2">
              {currentEx.pinyin && (
                <p className="text-sm font-mono text-amber-400">{currentEx.pinyin}</p>
              )}
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                {currentEx.targetText}
              </p>
              <p className="text-xs text-slate-400 italic">"{currentEx.translation}"</p>

              <div className="pt-2">
                <button
                  onClick={() => handlePlayAudio(currentEx.targetText)}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-indigo-300 text-xs font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Escuchar pronunciación nativa</span>
                </button>
              </div>
            </div>

            {/* Recording Controls */}
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={isRecording ? handleStopPronunciation : handleStartPronunciation}
                disabled={isEvaluating}
                className={`w-18 h-18 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-xl transition-all active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 animate-pulse shadow-red-500/40'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
                }`}
              >
                {isRecording ? <Square className="w-6 h-6 fill-white" /> : <Mic className="w-6 h-6" />}
              </button>
              <span className="text-xs text-slate-400">
                {isRecording ? '🎙️ Habla ahora... Presiona para evaluar' : 'Toca el micrófono y pronuncia la frase'}
              </span>

              {spokenTranscript && (
                <p className="text-xs text-slate-300 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  Transcripción detectada: <span className="font-bold text-white">"{spokenTranscript}"</span>
                </p>
              )}

              {isEvaluating && (
                <div className="text-xs text-indigo-400 font-semibold animate-pulse flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Evaluando pronunciación y fluidez con IA...</span>
                </div>
              )}
            </div>

            {/* Fluency Result Card inside Pronunciation Step */}
            {fluencyEval && (
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-left space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-sm text-white">Puntuación de Fluidez:</span>
                  <span className="text-lg font-black text-emerald-400">{fluencyEval.overallScore}%</span>
                </div>
                <p className="text-xs text-slate-200">{fluencyEval.feedbackInSpanish}</p>
              </div>
            )}
          </div>
        )}

        {/* TYPE 5: LISTENING COMPREHENSION */}
        {currentEx.type === 'listening_quiz' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 text-center space-y-4">
              <button
                onClick={() => handlePlayAudio((currentEx as ListeningExercise).audioPrompt)}
                className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 active:scale-95 transition"
              >
                <Volume2 className="w-8 h-8" />
              </button>
              <p className="text-xs text-slate-400 font-medium">
                Toca para reproducir el audio del nativo
              </p>
              <p className="text-base sm:text-lg font-bold text-white pt-2">
                {(currentEx as ListeningExercise).question}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentEx as ListeningExercise).options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={i}
                    disabled={isAnswerChecked}
                    onClick={() => setSelectedOption(opt)}
                    className={`p-3.5 rounded-2xl font-semibold text-sm transition border text-left ${
                      isSelected
                        ? 'bg-indigo-600/30 text-white border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback / Result Banner after checking */}
        {isAnswerChecked && (
          <div
            className={`p-4 rounded-2xl border space-y-2 animate-in fade-in duration-200 ${
              isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center space-x-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>¡Excelente! Respuesta correcta (+15 XP)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>No del todo exacto. ¡Sigue adelante!</span>
                </>
              )}
            </div>

            {currentEx.grammarNote && (
              <p className="text-xs opacity-90 leading-relaxed">
                💡 <span className="font-semibold">Regla explicativa:</span> {currentEx.grammarNote}
              </p>
            )}
          </div>
        )}

        {/* Action Button: Check vs Next */}
        <div className="pt-2 flex items-center justify-end">
          {!isAnswerChecked ? (
            <button
              onClick={handleCheckAnswer}
              disabled={
                currentEx.type === 'grammar_syntax'
                  ? scrambledSelected.length === 0
                  : currentEx.type === 'pronunciation'
                  ? !fluencyEval
                  : !selectedOption
              }
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              Comprobar Respuesta
            </button>
          ) : (
            <button
              onClick={handleNextExercise}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center space-x-2"
            >
              <span>{currentIndex < exercises.length - 1 ? 'Siguiente Ejercicio' : 'Finalizar Misión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
