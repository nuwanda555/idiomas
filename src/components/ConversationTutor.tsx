import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Languages,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Radio,
  Coffee,
  Briefcase,
  Train,
  Hotel,
  Utensils,
  ShoppingBag,
  Smile
} from 'lucide-react';
import { TUTOR_SCENARIOS, LANGUAGES } from '../data/languages';
import { LanguageCode, TutorScenario, ChatMessage } from '../types';
import { playLanguageAudio, playCorrectSound, playMicTone } from '../utils/audio';
import { createSpeechSession } from '../utils/speechRecognition';
import { AudioSettings } from '../utils/storage';

interface ConversationTutorProps {
  language: LanguageCode;
  audioSettings: AudioSettings;
  onEarnXP: (xp: number) => void;
}

const SCENARIO_ICONS: Record<string, React.ReactNode> = {
  Coffee: <Coffee className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Train: <Train className="w-4 h-4" />,
  Hotel: <Hotel className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  ShoppingBag: <ShoppingBag className="w-4 h-4" />,
  Smile: <Smile className="w-4 h-4" />,
};

export const ConversationTutor: React.FC<ConversationTutorProps> = ({
  language,
  audioSettings,
  onEarnXP,
}) => {
  const scenarios = TUTOR_SCENARIOS[language] || [];
  const [activeScenario, setActiveScenario] = useState<TutorScenario>(scenarios[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [showTranslations, setShowTranslations] = useState(true);

  // Speech recording
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const speechSessionRef = useRef<ReturnType<typeof createSpeechSession> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Initialize scenario conversation
  useEffect(() => {
    if (scenarios.length > 0) {
      const initial = scenarios[0];
      setActiveScenario(initial);
      resetConversation(initial);
    }
  }, [language]);

  const resetConversation = (scenario: TutorScenario) => {
    const firstMsg: ChatMessage = {
      id: 'init_1',
      role: 'assistant',
      content: scenario.initialMessage,
      pinyin: scenario.initialPinyin,
      translation: scenario.initialTranslation,
      timestamp: new Date(),
      suggestedAnswers:
        language === 'de'
          ? ['Hallo! Ich möchte einen Kaffee bestellen.', 'Guten Tag, was können Sie mir empfehlen?']
          : language === 'zh'
          ? ['你好！我想看一下菜单。 (Nǐ hǎo! Wǒ xiǎng kàn yíxià càidān.)', '请问有什么招牌菜？ (Qǐngwèn yǒu shénme zhāopái cài?)']
          : ['Hello! Could I see the menu, please?', 'Hi! What would you recommend today?']
    };
    setMessages([firstMsg]);

    // Optionally play welcome audio
    if (audioSettings.autoPlayAudio) {
      playLanguageAudio(scenario.initialMessage, language, {
        useStudioAI: audioSettings.useStudioAI,
        rate: audioSettings.playbackSpeed,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiReplying]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isAiReplying) return;

    setInputVal('');

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsAiReplying(true);

    try {
      const resp = await fetch('/api/conversation-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          scenario: activeScenario,
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        const assistantMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: data.replyText,
          pinyin: data.pinyin,
          translation: data.translationSpanish,
          corrections: data.corrections,
          suggestedAnswers: data.suggestedAnswers,
          fluencyTip: data.fluencyTip,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        onEarnXP(15);
        playCorrectSound();

        // Autoplay tutor audio
        if (audioSettings.autoPlayAudio) {
          playLanguageAudio(data.replyText, language, {
            useStudioAI: audioSettings.useStudioAI,
            rate: audioSettings.playbackSpeed,
          });
        }
      }
    } catch (e) {
      console.error('Conversation tutor request error:', e);
    } finally {
      setIsAiReplying(false);
    }
  };

  const handleStartRecording = async () => {
    playMicTone(true);
    setIsRecording(true);

    const session = createSpeechSession({
      language,
      onVolumeChange: (vol) => setVolumeLevel(vol),
      onTranscriptChange: (text) => setInputVal(text),
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

    const { transcript } = await speechSessionRef.current.stop();
    speechSessionRef.current = null;

    if (transcript || inputVal) {
      const finalMsg = transcript || inputVal;
      setInputVal(finalMsg);
      // Auto send spoken reply
      handleSendMessage(finalMsg);
    }
  };

  const handlePlayMessageAudio = (text: string) => {
    playLanguageAudio(text, language, {
      useStudioAI: audioSettings.useStudioAI,
      rate: audioSettings.playbackSpeed,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Scenario Selector */}
      <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Escenario:</span>
          <div className="flex flex-wrap gap-1.5">
            {scenarios.map((sc) => {
              const isSelected = sc.id === activeScenario.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenario(sc);
                    resetConversation(sc);
                  }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80'
                  }`}
                >
                  {SCENARIO_ICONS[sc.icon] || <Coffee className="w-3.5 h-3.5" />}
                  <span>{sc.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Translation Toggle & Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              showTranslations
                ? 'bg-slate-800 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{showTranslations ? 'Traducciones ON' : 'Traducciones OFF'}</span>
          </button>

          <button
            onClick={() => resetConversation(activeScenario)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Reiniciar diálogo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chat Timeline Arena */}
      <div className="h-[520px] rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl flex flex-col justify-between overflow-hidden backdrop-blur-xl">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in duration-200`}
              >
                <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-1">
                  {isUser ? (
                    <>
                      <span>Tú</span>
                      <User className="w-3 h-3 text-indigo-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-amber-400" />
                      <span>{activeScenario.role} (Tutor IA)</span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-xl rounded-2xl p-4 shadow-md ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Pinyin if Chinese */}
                  {!isUser && m.pinyin && (
                    <p className="text-xs font-mono text-amber-400 font-medium mb-1">
                      {m.pinyin}
                    </p>
                  )}

                  {/* Message Main Text */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-base leading-relaxed font-medium">
                      {m.content}
                    </p>
                    {!isUser && (
                      <button
                        onClick={() => handlePlayMessageAudio(m.content)}
                        className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-indigo-300 transition shrink-0 active:scale-95"
                        title="Escuchar audio nativo"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Translation in Spanish */}
                  {!isUser && showTranslations && m.translation && (
                    <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700/60 italic">
                      "{m.translation}"
                    </p>
                  )}

                  {/* Corrections on user errors */}
                  {!isUser && m.corrections && m.corrections.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                      <div className="font-bold flex items-center space-x-1.5 text-amber-300">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Consejo de corrección gramatical:</span>
                      </div>
                      {m.corrections.map((corr, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div>
                            <span className="line-through opacity-70 text-rose-300">{corr.original}</span>
                            {' → '}
                            <span className="font-bold text-emerald-300">{corr.correction}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{corr.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fluency tip */}
                  {!isUser && m.fluencyTip && (
                    <div className="mt-2 text-[11px] text-indigo-300 flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{m.fluencyTip}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isAiReplying && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs py-2 px-1 animate-pulse">
              <Bot className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>El tutor está respondiendo en voz y texto...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Replies */}
        {messages.length > 0 &&
          messages[messages.length - 1].role === 'assistant' &&
          messages[messages.length - 1].suggestedAnswers &&
          messages[messages.length - 1].suggestedAnswers!.length > 0 && (
            <div className="py-2 flex flex-wrap gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center mr-1">
                Respuestas sugeridas:
              </span>
              {messages[messages.length - 1].suggestedAnswers!.map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(sugg)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition active:scale-95"
                >
                  {sugg}
                </button>
              ))}
            </div>
          )}

        {/* Input Bar with Speech Mic and Send */}
        <div className="pt-3 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            {/* Live Recording Mic */}
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`p-3 rounded-2xl font-bold transition-all duration-200 active:scale-95 ${
                isRecording
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700'
              }`}
              title={isRecording ? 'Parar grabación' : 'Hablar al micrófono'}
            >
              {isRecording ? <Square className="w-5 h-5 fill-white" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input field */}
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={
                isRecording
                  ? '🎙️ Escuchando tu voz...'
                  : `Escribe o habla en ${LANGUAGES[language].name}...`
              }
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputVal.trim() || isAiReplying}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold transition shadow-lg shadow-indigo-600/30 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
