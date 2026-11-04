import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Sparkles,
  Award,
  TrendingUp,
  Clock,
  RotateCcw,
  Volume2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { FREE_SPEECH_PROMPTS, LANGUAGES } from '../data/languages';
import { LanguageCode, FluencyEvaluation } from '../types';
import { playCorrectSound, playWrongSound, playMicTone } from '../utils/audio';
import { createSpeechSession } from '../utils/speechRecognition';

interface FreeSpeechTestProps {
  language: LanguageCode;
  onEarnXP: (xp: number) => void;
}

export const FreeSpeechTest: React.FC<FreeSpeechTestProps> = ({
  language,
  onEarnXP,
}) => {
  const prompts = FREE_SPEECH_PROMPTS[language] || [];
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const currentPrompt = prompts[selectedPromptIndex] || prompts[0];

  const [isRecording, setIsRecording] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<FluencyEvaluation | null>(null);

  const sessionRef = useRef<ReturnType<typeof createSpeechSession> | null>(null);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      sessionRef.current?.cancel();
    };
  }, []);

  const handleStart = async () => {
    setEvaluation(null);
    setTranscript('');
    setTimerSeconds(0);
    playMicTone(true);
    setIsRecording(true);

    const session = createSpeechSession({
      language,
      onTranscriptChange: (text) => setTranscript(text),
      onError: (err) => {
        alert(err);
        setIsRecording(false);
      },
    });

    sessionRef.current = session;
    await session.start();

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    if (!sessionRef.current) return;
    playMicTone(false);
    setIsRecording(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const { transcript: finalTrans, audioBase64 } = await sessionRef.current.stop();
    sessionRef.current = null;

    const fullSpoken = finalTrans || transcript;
    setTranscript(fullSpoken);

    if (!fullSpoken.trim()) {
      alert('No se detectó audio ni palabras. Intenta hablar más cerca del micrófono.');
      return;
    }

    // Call AI evaluator
    setIsEvaluating(true);
    try {
      const resp = await fetch('/api/evaluate-fluency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          transcript: fullSpoken,
          targetLanguage: language,
          isFreeSpeech: true,
          context: `Tema libre: ${currentPrompt.prompt}`,
        }),
      });

      if (resp.ok) {
        const data: FluencyEvaluation = await resp.json();
        setEvaluation(data);
        playCorrectSound();
        onEarnXP(35);
      }
    } catch (e) {
      console.error('Free speech eval error:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
  const wpm = timerSeconds > 0 ? Math.round((wordCount / timerSeconds) * 60) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Test de Fluidez Espontánea</h2>
              <p className="text-xs text-slate-400">
                Habla sin interrupciones sobre el tema propuesto. La IA medirá tu velocidad, fonética y gramática.
              </p>
            </div>
          </div>
        </div>

        {/* Prompt Card */}
        {currentPrompt && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-850 to-slate-800 border border-slate-700/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Tema de Habla Sugerido:
            </span>
            <p className="text-xl sm:text-2xl font-black text-white leading-snug">
              {currentPrompt.prompt}
            </p>
            <p className="text-xs text-slate-400 italic">
              "{currentPrompt.translation}"
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Palabras clave útiles:</span>
              {currentPrompt.suggestedKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Live Recording Area */}
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {/* Timer Display */}
          <div className="flex items-center space-x-2 text-slate-300 text-sm font-mono font-bold bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}</span>
            {timerSeconds > 0 && <span className="text-slate-400 font-sans font-normal">• {wpm} PPM (palabras por min)</span>}
          </div>

          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-red-500/40 animate-ping pointer-events-none" />
            )}
            <button
              onClick={isRecording ? handleStop : handleStart}
              disabled={isEvaluating}
              className={`relative w-22 h-22 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-2xl transition-all duration-200 active:scale-95 ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-500 shadow-red-500/40'
                  : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-8 h-8 fill-white" />
                  <span className="text-[10px] mt-1 font-bold">TERMINAR</span>
                </>
              ) : (
                <>
                  <Mic className="w-8 h-8" />
                  <span className="text-[10px] mt-1 font-bold">COMENZAR</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center max-w-sm">
            {isRecording
              ? '🎙️ Habla continuamente durante 20 a 45 segundos. Presiona "TERMINAR" para evaluar.'
              : 'Presiona COMENZAR y comparte tus ideas en voz alta.'}
          </p>

          {/* Transcript preview */}
          {transcript && (
            <div className="w-full p-4 rounded-2xl bg-slate-850 border border-slate-700/80 text-left space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Transcripción registrada:</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">"{transcript}"</p>
            </div>
          )}

          {isEvaluating && (
            <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold animate-pulse py-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Calculando métricas de fluidez global con IA...</span>
            </div>
          )}
        </div>

        {/* Detailed AI Fluency Report Card */}
        {evaluation && (
          <div className="p-6 rounded-2xl bg-slate-800/95 border border-slate-700 space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Informe Diagnóstico de Fluidez</h3>
                  <p className="text-xs text-slate-400">Nivel Marco Común Europeo: <span className="font-bold text-indigo-400">{evaluation.estimatedCEFR}</span></p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-400">{evaluation.overallScore}%</div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Fluidez Global</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-black text-indigo-400">{evaluation.pronunciationScore}%</div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Pronunciación</span>
                </div>
                <div className="h-8 w-px bg-slate-700" />
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{wpm}</div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">PPM (Velocidad)</span>
                </div>
              </div>
            </div>

            {/* Pedagogical Commentary */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Dictamen del Evaluador IA:
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
                {evaluation.feedbackInSpanish}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Puntos Fuertes Identificados:
                  </h4>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((str, i) => (
                      <li key={i} className="text-xs text-emerald-200 flex items-start space-x-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.areasForImprovement && evaluation.areasForImprovement.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Áreas de Mejora para el Próximo Nivel:
                  </h4>
                  <ul className="space-y-1">
                    {evaluation.areasForImprovement.map((area, i) => (
                      <li key={i} className="text-xs text-amber-200 flex items-start space-x-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleStart}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Realizar otra prueba de habla</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
