import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Flame,
  Radio,
  Sliders,
  Play,
  Pause
} from 'lucide-react';
import { PRONUNCIATION_DRILLS, LANGUAGES } from '../data/languages';
import { LanguageCode, PronunciationExercise, FluencyEvaluation, WordFluency } from '../types';
import { playLanguageAudio, playCorrectSound, playWrongSound, playMicTone } from '../utils/audio';
import { createSpeechSession, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { AudioSettings } from '../utils/storage';

interface PronunciationLabProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onEarnXP: (xp: number) => void;
}

export const PronunciationLab: React.FC<PronunciationLabProps> = ({
  language,
  audioSettings,
  onEarnXP,
}) => {
  const drills = PRONUNCIATION_DRILLS[language] || [];
  const [selectedDrillIndex, setSelectedDrillIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'daily' | 'travel' | 'business' | 'tongue_twister'>('all');

  const filteredDrills = drills.filter(
    (d) => categoryFilter === 'all' || d.category === categoryFilter
  );

  const currentDrill: PronunciationExercise | undefined =
    filteredDrills[selectedDrillIndex] || filteredDrills[0] || drills[0];

  // Speech recording state
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [recognizedTranscript, setRecognizedTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<FluencyEvaluation | null>(null);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<'prompt' | 'user' | null>(null);
  const [selectedWordTip, setSelectedWordTip] = useState<WordFluency | null>(null);

  const speechSessionRef = useRef<ReturnType<typeof createSpeechSession> | null>(null);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Reset drill state when switching drill or language
  useEffect(() => {
    setEvaluation(null);
    setRecognizedTranscript('');
    setUserAudioUrl(null);
    setRecordedBase64(null);
    setSelectedWordTip(null);
    if (isRecording) {
      speechSessionRef.current?.cancel();
      setIsRecording(false);
    }
  }, [currentDrill?.id, language]);

  const handleStartRecording = async () => {
    setEvaluation(null);
    setRecognizedTranscript('');
    setUserAudioUrl(null);
    setRecordedBase64(null);
    setSelectedWordTip(null);

    playMicTone(true);
    setIsRecording(true);

    const session = createSpeechSession({
      language,
      onVolumeChange: (vol) => setVolumeLevel(vol),
      onTranscriptChange: (text) => setRecognizedTranscript(text),
      onError: (err) => {
        alert(err);
        setIsRecording(false);
      },
    });

    speechSessionRef.current = session;
    await session.start();
  };

  const handleStopRecording = async () => {
    if (!speechSessionRef.current) return;
    playMicTone(false);
    setIsRecording(false);
    setVolumeLevel(0);

    const { transcript, audioBase64, audioUrl } = await speechSessionRef.current.stop();
    speechSessionRef.current = null;

    if (audioUrl) {
      setUserAudioUrl(audioUrl);
    }
    if (audioBase64) {
      setRecordedBase64(audioBase64);
    }

    const finalTranscript = transcript || recognizedTranscript;
    setRecognizedTranscript(finalTranscript);

    // Trigger AI evaluation
    await evaluatePronunciation(finalTranscript, audioBase64);
  };

  const evaluatePronunciation = async (transcriptText: string, audioData?: string) => {
    if (!currentDrill) return;
    setIsEvaluating(true);

    try {
      const resp = await fetch('/api/evaluate-fluency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: audioData || recordedBase64,
          transcript: transcriptText,
          targetPhrase: currentDrill.targetText,
          targetLanguage: language,
          context: currentDrill.title,
        }),
      });

      if (resp.ok) {
        const evalData: FluencyEvaluation = await resp.json();
        setEvaluation(evalData);

        if (evalData.overallScore >= 70) {
          playCorrectSound();
          onEarnXP(20);
        } else {
          playWrongSound();
          onEarnXP(5);
        }
      }
    } catch (e) {
      console.error('Error evaluating speech:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePlayPromptAudio = (rate: number = 1.0) => {
    if (!currentDrill) return;
    setActiveAudioPlaying('prompt');
    playLanguageAudio(currentDrill.targetText, language, {
      rate: rate * audioSettings.playbackSpeed,
      useStudioAI: audioSettings.useStudioAI,
      onEnd: () => setActiveAudioPlaying(null),
      onError: () => setActiveAudioPlaying(null),
    });
  };

  const handlePlayUserAudio = () => {
    if (!userAudioUrl) return;
    if (activeAudioPlaying === 'user') {
      userAudioPlayerRef.current?.pause();
      setActiveAudioPlaying(null);
      return;
    }

    const audio = new Audio(userAudioUrl);
    userAudioPlayerRef.current = audio;
    setActiveAudioPlaying('user');
    audio.onended = () => setActiveAudioPlaying(null);
    audio.play();
  };

  const playIsolatedWord = (wordText: string) => {
    playLanguageAudio(wordText, language, {
      rate: 0.85,
      useStudioAI: audioSettings.useStudioAI,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'daily', label: 'Cotidiano' },
            { id: 'travel', label: 'Viajes' },
            { id: 'business', label: 'Negocios' },
            { id: 'tongue_twister', label: 'Trabalenguas 🔥' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id as any);
                setSelectedDrillIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 px-3">
          Frase {selectedDrillIndex + 1} de {filteredDrills.length}
        </div>
      </div>

      {/* Main Pronunciation Card */}
      {currentDrill && (
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Drill Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                {currentDrill.level} • {currentDrill.category === 'tongue_twister' ? 'Reto Fonético' : currentDrill.category}
              </span>
              <h2 className="text-lg font-bold text-slate-100">{currentDrill.title}</h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={selectedDrillIndex === 0}
                onClick={() => setSelectedDrillIndex((prev) => Math.max(0, prev - 1))}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium"
              >
                Anterior
              </button>
              <button
                disabled={selectedDrillIndex >= filteredDrills.length - 1}
                onClick={() => setSelectedDrillIndex((prev) => Math.min(filteredDrills.length - 1, prev + 1))}
                className="px-2.5 py-1 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium flex items-center space-x-1"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Target Phrase Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-850 border border-slate-700/80 text-center space-y-3 relative group">
            {/* Pinyin if Chinese */}
            {currentDrill.pinyin && (
              <p className="text-base sm:text-lg font-mono font-medium text-amber-400 tracking-wide">
                {currentDrill.pinyin}
              </p>
            )}

            {/* Target text */}
            <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {currentDrill.targetText}
            </p>

            {/* Translation */}
            <p className="text-sm sm:text-base text-slate-400 italic">
              "{currentDrill.translation}"
            </p>

            {/* Phonetic advice chip */}
            {currentDrill.phoneticFocus && (
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left max-w-xl mx-auto">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>{currentDrill.phoneticFocus}</span>
              </div>
            )}

            {/* Audio Listen Buttons */}
            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                onClick={() => handlePlayPromptAudio(1.0)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition shadow-md active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Escuchar Nativo (1.0x)</span>
              </button>
              <button
                onClick={() => handlePlayPromptAudio(0.75)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition active:scale-95"
                title="Escuchar a velocidad pausada"
              >
                <span>🐢 Lento (0.75x)</span>
              </button>
            </div>
          </div>

          {/* Interactive Speech & Recording Arena */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col items-center justify-center space-y-4">
            {/* Live Audio Visualizer Wave */}
            {isRecording && (
              <div className="flex items-center justify-center space-x-1 h-12 w-full max-w-xs">
                {Array.from({ length: 16 }).map((_, i) => {
                  const h = Math.max(8, Math.min(48, Math.random() * volumeLevel * 70 + 8));
                  return (
                    <div
                      key={i}
                      className="w-1.5 rounded-full bg-gradient-to-t from-red-500 to-amber-400 transition-all duration-75"
                      style={{ height: `${h}px` }}
                    />
                  );
                })}
              </div>
            )}

            {/* Record / Stop Button */}
            <div className="relative">
              {isRecording && (
                <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
              )}
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isEvaluating}
                className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-white shadow-2xl transition-all duration-200 active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/40'
                    : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-500/40 ring-4 ring-indigo-500/20'
                }`}
              >
                {isRecording ? (
                  <>
                    <Square className="w-7 h-7 fill-white" />
                    <span className="text-[10px] mt-1 font-bold">PARAR</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-7 h-7" />
                    <span className="text-[10px] mt-1 font-bold">HABLAR</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center max-w-sm">
              {isRecording
                ? '🎙️ Te estamos escuchando... Presiona "PARAR" al terminar de hablar.'
                : 'Presiona el micrófono y pronuncia la frase. La IA evaluará tu fluidez automáticamente.'}
            </p>

            {/* Live recognized transcript preview */}
            {(recognizedTranscript || isRecording) && (
              <div className="w-full max-w-lg p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Reconocimiento en vivo:
                </span>
                <p className="text-sm font-medium text-slate-200">
                  {recognizedTranscript || 'Escuchando tu voz...'}
                </p>
              </div>
            )}

            {/* Evaluating spinner */}
            {isEvaluating && (
              <div className="flex items-center space-x-2 text-indigo-400 text-sm font-semibold animate-pulse py-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Analizando fonética, acento y fluidez con IA...</span>
              </div>
            )}
          </div>

          {/* Automatic Fluency Evaluation Card */}
          {evaluation && (
            <div className="mt-8 p-6 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Evaluación Automática de Fluidez</h3>
                    <p className="text-xs text-slate-400">Nivel estimado CEFR: <span className="font-bold text-indigo-400">{evaluation.estimatedCEFR}</span></p>
                  </div>
                </div>

                {/* Score Meters */}
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">{evaluation.overallScore}%</div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Fluidez</span>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <div className="text-xl font-black text-indigo-400">{evaluation.pronunciationScore}%</div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Pronunciación</span>
                  </div>
                  <div className="h-8 w-px bg-slate-700" />
                  <div className="text-center">
                    <div className="text-xl font-black text-amber-400">{evaluation.accuracyScore}%</div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400">Precisión</span>
                  </div>
                </div>
              </div>

              {/* Word by Word Analysis */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Desglose palabra por palabra (toca para escuchar o ver consejo):
                  </span>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /><span>Perfecto</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span>Aceptable</span></span>
                    <span className="flex items-center space-x-1"><span className="w-2 h-2 rounded-full bg-rose-400" /><span>Mejorar</span></span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-700/60">
                  {evaluation.words.map((item, idx) => {
                    const isSelected = selectedWordTip?.word === item.word;
                    const colorClass =
                      item.status === 'perfect'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                        : item.status === 'good'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30';

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedWordTip(item);
                          playIsolatedWord(item.word);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition flex items-center space-x-1.5 ${colorClass} ${
                          isSelected ? 'ring-2 ring-white' : ''
                        }`}
                      >
                        <span>{item.word}</span>
                        <Volume2 className="w-3 h-3 opacity-60" />
                      </button>
                    );
                  })}
                </div>

                {/* Selected word tip modal / box */}
                {selectedWordTip && (
                  <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-start space-x-2 animate-in fade-in">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">{selectedWordTip.word}: </span>
                      {selectedWordTip.phoneticTip || '¡Pronunciación impecable! Se reconoció con alta nitidez fonética.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback In Spanish */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/80 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Consejos Pedagógicos de la IA:</span>
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {evaluation.feedbackInSpanish}
                </p>

                {evaluation.phoneticHighlights && evaluation.phoneticHighlights.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {evaluation.phoneticHighlights.map((hl, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start space-x-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* A/B Audio Comparison: User voice vs Native */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700/80">
                <div className="flex items-center space-x-3">
                  {userAudioUrl && (
                    <button
                      onClick={handlePlayUserAudio}
                      className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
                    >
                      {activeAudioPlaying === 'user' ? (
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Escuchar mi grabación</span>
                    </button>
                  )}

                  <button
                    onClick={() => handlePlayPromptAudio(1.0)}
                    className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Escuchar voz nativa</span>
                  </button>
                </div>

                <button
                  onClick={handleStartRecording}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Intentar de nuevo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
