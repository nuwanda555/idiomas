import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { LanguageCode } from '../types';
import { playCorrectSound, playWrongSound } from '../utils/audio';

interface GrammarLesson {
  id: string;
  title: string;
  level: string;
  summary: string;
  rules: { title: string; desc: string; example: string; exampleTrans: string }[];
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

const GRAMMAR_CATALOG: Record<LanguageCode, GrammarLesson[]> = {
  de: [
    {
      id: 'de_g_1',
      title: 'El Verbo en Segunda Posición (V2)',
      level: 'A1 - Imprescindible',
      summary: 'En las oraciones principales alemanas, el verbo conjugado ocupa SIEMPRE la 2ª posición sintáctica.',
      rules: [
        {
          title: 'Posición estándar (Sujeto primero)',
          desc: 'Ich trinke heute Kaffee.',
          example: 'Ich (1) trinke (2) heute Kaffee.',
          exampleTrans: 'Yo bebo hoy café.'
        },
        {
          title: 'Inversión (Elemento temporal o de lugar primero)',
          desc: 'Si comienzas con tiempo ("Heute"), el sujeto pasa detrás del verbo.',
          example: 'Heute (1) trinke (2) ich (3) Kaffee.',
          exampleTrans: 'Hoy bebo yo café.'
        }
      ],
      quiz: {
        question: '¿Cuál es la forma correcta si empezamos la oración con "Morgen"?',
        options: [
          'Morgen fahre ich nach Hamburg.',
          'Morgen ich fahre nach Hamburg.',
          'Morgen fahre nach Hamburg ich.',
          'Morgen ich nach Hamburg fahre.'
        ],
        correctAnswer: 'Morgen fahre ich nach Hamburg.',
        explanation: 'Al colocar el adverbio "Morgen" en la posición 1, el verbo conjugado "fahre" ocupa obligatoriamente la posición 2, seguido del sujeto "ich".'
      }
    },
    {
      id: 'de_g_2',
      title: 'Acusativo vs. Dativo con Preposiciones Wechselpräpositionen',
      level: 'A2 - Intermedio',
      summary: 'Preposiciones como in, an, auf, unter llevan Acusativo si hay movimiento/destino (Wohin?), y Dativo si es ubicación fija (Wo?).',
      rules: [
        {
          title: 'Movimiento / Destino (Wohin? → Acusativo)',
          desc: 'Ich gehe in den Park (der Park → den Park).',
          example: 'Ich lege das Buch auf den Tisch.',
          exampleTrans: 'Pongo el libro sobre la mesa (acción de mover).'
        },
        {
          title: 'Ubicación fija (Wo? → Dativo)',
          desc: 'Das Buch liegt auf dem Tisch (der Tisch → dem Tisch).',
          example: 'Ich bin in dem (im) Supermarkt.',
          exampleTrans: 'Estoy dentro del supermercado (estático).'
        }
      ],
      quiz: {
        question: 'Completa: "Der Junge springt ___ Wasser." (Acción de saltar hacia el agua)',
        options: ['in das (ins)', 'in dem (im)', 'in der', 'nach dem'],
        correctAnswer: 'in das (ins)',
        explanation: 'Saltar hacia el agua es una dirección/movimiento (Wohin?), por lo que rige Acusativo neutro: in + das = ins Wasser.'
      }
    }
  ],
  en: [
    {
      id: 'en_g_1',
      title: 'Present Perfect vs. Past Simple',
      level: 'A2/B1 - Crucial',
      summary: 'Past Simple describe acciones completas en un tiempo cerrado (yesterday, in 2020). Present Perfect conecta el pasado con el presente o experiencias sin fecha fija.',
      rules: [
        {
          title: 'Past Simple (Tiempo específico cerrado)',
          desc: 'I visited Rome last year.',
          example: 'Did you see Peter yesterday?',
          exampleTrans: '¿Viste a Peter ayer?'
        },
        {
          title: 'Present Perfect (Experiencia vital / efecto actual)',
          desc: 'I have visited Rome three times.',
          example: 'Have you ever eaten sushi before?',
          exampleTrans: '¿Has comido sushi alguna vez antes?'
        }
      ],
      quiz: {
        question: 'Elige la opción gramaticalmente correcta: "I ___ to Berlin in 2022."',
        options: ['went', 'have gone', 'have been going', 'was gone'],
        correctAnswer: 'went',
        explanation: '"In 2022" es un marcador de tiempo pasado concluido y específico, por lo que exige Past Simple ("went"), nunca Present Perfect.'
      }
    },
    {
      id: 'en_g_2',
      title: 'Second Conditional (Situaciones Hipotéticas)',
      level: 'B1 - Intermedio',
      summary: 'Se utiliza para hablar de situaciones imaginarias o irreales en el presente o futuro.',
      rules: [
        {
          title: 'Estructura',
          desc: 'If + Past Simple, ... would + Verbo en infinitivo.',
          example: 'If I won the lottery, I would travel around the world.',
          exampleTrans: 'Si ganara la lotería, viajaría por todo el mundo.'
        }
      ],
      quiz: {
        question: 'Completa: "If I ___ you, I would accept the job offer."',
        options: ['were', 'am', 'will be', 'had been'],
        correctAnswer: 'were',
        explanation: 'En el inglés formal y estándar condicional, se prefiere "were" para todas las personas: "If I were you...".'
      }
    }
  ],
  zh: [
    {
      id: 'zh_g_1',
      title: 'Estructura Sintáctica Básica y el Tiempo',
      level: 'A1 - Base Elemental',
      summary: 'En chino mandarín no hay conjugaciones de verbos, pero el orden es estricto: Sujeto + Tiempo + Lugar + Verbo + Objeto.',
      rules: [
        {
          title: 'Regla del Tiempo',
          desc: 'Las expresiones temporales van SIEMPRE antes del verbo.',
          example: '我明天去北京。 (Wǒ míngtiān qù Běijīng.)',
          exampleTrans: 'Yo mañana voy a Pekín.'
        }
      ],
      quiz: {
        question: '¿Cuál es el orden natural en chino para: "Ella hoy come fideos"?',
        options: [
          '她今天吃面条。 (Tā jīntiān chī miàntiáo.)',
          '她吃面条今天。 (Tā chī miàntiáo jīntiān.)',
          '吃面条她今天。 (Chī miàntiáo tā jīntiān.)',
          '今天面条她吃。 (Jīntiān miàntiáo tā chī.)'
        ],
        correctAnswer: '她今天吃面条。 (Tā jīntiān chī miàntiáo.)',
        explanation: 'El tiempo "今天" (hoy) se ubica justo antes del verbo "吃" (comer).'
      }
    },
    {
      id: 'zh_g_2',
      title: 'La Partícula "了" (le) y el Cambio de Estado',
      level: 'A2 - Intermedio',
      summary: '“了” no es simplemente el tiempo pasado; indica principalmente culminación de una acción o un cambio de situación.',
      rules: [
        {
          title: 'Acción completada',
          desc: '我吃早饭了。 (Wǒ chī zǎofàn le: Ya desayuné).',
          example: '下雨了！ (Xià yǔ le!)',
          exampleTrans: '¡Ha empezado a llover! (Cambio de estado).'
        }
      ],
      quiz: {
        question: '¿Qué expresa la frase: "我已经买票了" (Wǒ yǐjīng mǎi piào le)?',
        options: [
          'Ya he comprado el billete (acción culminada).',
          'Voy a comprar el billete mañana.',
          'Quiero comprar el billete.',
          'No pude comprar el billete.'
        ],
        correctAnswer: 'Ya he comprado el billete (acción culminada).',
        explanation: '“已经...了” (yǐjīng... le) es la fórmula estándar para indicar que una acción "ya" ha sido realizada y finalizada.'
      }
    }
  ]
};

interface GrammarDrillsProps {
  language: LanguageCode;
  onEarnXP: (xp: number) => void;
}

export const GrammarDrills: React.FC<GrammarDrillsProps> = ({ language, onEarnXP }) => {
  const lessons = GRAMMAR_CATALOG[language] || [];
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentLesson = lessons[activeLessonIndex] || lessons[0];

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
  };

  const handleCheck = () => {
    if (!selectedAnswer || isAnswerChecked) return;
    const correct = selectedAnswer === currentLesson.quiz.correctAnswer;
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      playCorrectSound();
      onEarnXP(20);
    } else {
      playWrongSound();
    }
  };

  const handleNextLesson = () => {
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setActiveLessonIndex((prev) => (prev + 1) % lessons.length);
  };

  if (!currentLesson) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Lesson Selector Chips */}
      <div className="flex flex-wrap gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 backdrop-blur-md">
        {lessons.map((les, idx) => (
          <button
            key={les.id}
            onClick={() => {
              setActiveLessonIndex(idx);
              setSelectedAnswer(null);
              setIsAnswerChecked(false);
              setIsCorrect(false);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              activeLessonIndex === idx
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {les.title}
          </button>
        ))}
      </div>

      {/* Lesson Content Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
              <span className="text-xs text-indigo-400 font-semibold">{currentLesson.level}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
          {currentLesson.summary}
        </p>

        {/* Rules Breakdown */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Reglas Clave y Ejemplos:
          </span>
          <div className="grid grid-cols-1 gap-3">
            {currentLesson.rules.map((rule, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-850 border border-slate-750 space-y-1.5">
                <h4 className="text-sm font-bold text-amber-400">{rule.title}</h4>
                <p className="text-xs text-slate-300">{rule.desc}</p>
                <div className="pt-1 text-xs font-mono text-emerald-300 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  {rule.example} <span className="text-slate-400 italic font-sans font-normal ml-2">({rule.exampleTrans})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Practice Quiz */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Ponte a prueba con este ejercicio de gramática:</span>
          </div>

          <p className="text-base font-semibold text-white">
            {currentLesson.quiz.question}
          </p>

          <div className="space-y-2">
            {currentLesson.quiz.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              return (
                <button
                  key={i}
                  disabled={isAnswerChecked}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-4 rounded-2xl text-left font-medium text-sm transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/30 text-white border-indigo-500 ring-2 ring-indigo-500/50'
                      : 'bg-slate-800/70 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Result Banner */}
          {isAnswerChecked && (
            <div
              className={`p-4 rounded-2xl border space-y-2 animate-in fade-in ${
                isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>¡Correcto! Has ganado +20 XP</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>No es correcto. Revisa la explicación:</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{currentLesson.quiz.explanation}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            {!isAnswerChecked ? (
              <button
                onClick={handleCheck}
                disabled={!selectedAnswer}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm transition shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                Comprobar
              </button>
            ) : (
              <button
                onClick={handleNextLesson}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center space-x-2"
              >
                <span>Siguiente lección</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
