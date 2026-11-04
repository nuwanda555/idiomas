export type LanguageCode = 'de' | 'en' | 'zh';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface LanguageInfo {
  id: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  accentColor: string;
  voiceLang: string; // e.g. 'de-DE', 'en-US', 'zh-CN'
  greeting: string;
  description: string;
  phoneticHighlights: string[];
}

export type ExerciseType =
  | 'grammar_syntax'
  | 'grammar_fill'
  | 'vocabulary'
  | 'pronunciation'
  | 'listening_quiz';

export interface BaseExercise {
  id: string;
  language: LanguageCode;
  level: CEFRLevel;
  type: ExerciseType;
  title: string;
  instruction: string;
  targetText: string;
  pinyin?: string;
  translation: string;
  grammarNote?: string;
  phoneticFocus?: string;
}

export interface SyntaxExercise extends BaseExercise {
  type: 'grammar_syntax';
  scrambledWords: string[];
  correctOrder: string[];
}

export interface FillExercise extends BaseExercise {
  type: 'grammar_fill';
  sentenceWithBlank: string;
  options: string[];
  correctAnswer: string;
}

export interface VocabularyExercise extends BaseExercise {
  type: 'vocabulary';
  gender?: 'der' | 'die' | 'das';
  options: string[];
  correctAnswer: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface PronunciationExercise extends BaseExercise {
  type: 'pronunciation';
  phoneticGuide?: string;
  category: 'daily' | 'travel' | 'business' | 'tongue_twister';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ListeningExercise extends BaseExercise {
  type: 'listening_quiz';
  audioPrompt: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export type DailyExercise =
  | SyntaxExercise
  | FillExercise
  | VocabularyExercise
  | PronunciationExercise
  | ListeningExercise;

export interface WordFluency {
  word: string;
  status: 'perfect' | 'good' | 'needs_work' | 'missed';
  pinyinOrIPA?: string;
  phoneticTip?: string;
}

export interface FluencyEvaluation {
  recognizedText: string;
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  accuracyScore: number;
  estimatedCEFR: string;
  words: WordFluency[];
  phoneticHighlights: string[];
  strengths: string[];
  areasForImprovement: string[];
  feedbackInSpanish: string;
}

export interface TutorScenario {
  id: string;
  title: string;
  role: string;
  userRole: string;
  setting: string;
  icon: string;
  initialMessage: string;
  initialPinyin?: string;
  initialTranslation: string;
}

export interface TutorCorrection {
  original: string;
  correction: string;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pinyin?: string;
  translation?: string;
  audioBase64?: string;
  corrections?: TutorCorrection[];
  suggestedAnswers?: string[];
  fluencyTip?: string;
  timestamp: Date;
}

export interface VocabularyCard {
  id: string;
  language: LanguageCode;
  word: string;
  pinyin?: string;
  gender?: 'der' | 'die' | 'das'; // German articles
  translation: string;
  category: string;
  ipa?: string;
  example: string;
  exampleTranslation: string;
  tones?: number[]; // for Chinese: [1, 4] etc
  radical?: string;
  level: CEFRLevel;
  nextReviewDays?: number;
}

export interface UserStats {
  streak: number;
  lastPracticeDate: string;
  xp: number;
  dailyGoalXP: number;
  todayXP: number;
  completedExercisesCount: number;
  wordsLearned: number;
  recordedSpeechMinutes: number;
  levelByLanguage: Record<LanguageCode, CEFRLevel>;
}
