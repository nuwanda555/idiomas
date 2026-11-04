import { LanguageCode, UserStats, CEFRLevel } from '../types';

const STATS_KEY = 'polyglot_user_stats';
const ACTIVE_LANG_KEY = 'polyglot_active_language';
const AUDIO_SETTINGS_KEY = 'polyglot_audio_settings';

export interface AudioSettings {
  useStudioAI: boolean;
  playbackSpeed: number; // 0.8, 1.0, 1.2
  autoPlayAudio: boolean;
  soundEffects: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  useStudioAI: true,
  playbackSpeed: 1.0,
  autoPlayAudio: true,
  soundEffects: true,
};

export const DEFAULT_STATS: UserStats = {
  streak: 3,
  lastPracticeDate: new Date().toISOString().split('T')[0],
  xp: 320,
  dailyGoalXP: 50,
  todayXP: 25,
  completedExercisesCount: 14,
  wordsLearned: 48,
  recordedSpeechMinutes: 12,
  levelByLanguage: {
    de: 'A1',
    en: 'A2',
    zh: 'A1',
  },
};

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);

    // Check streak date
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastPracticeDate) {
      const last = new Date(parsed.lastPracticeDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        parsed.streak = 1; // streak broke
        parsed.todayXP = 0;
      } else if (diffDays === 1) {
        parsed.todayXP = 0; // new day!
      }
    }
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.debug('Failed to save user stats', e);
  }
}

export function addXP(amount: number): UserStats {
  const current = loadUserStats();
  const today = new Date().toISOString().split('T')[0];
  const isNewDay = current.lastPracticeDate !== today;

  const newStats: UserStats = {
    ...current,
    xp: current.xp + amount,
    todayXP: (isNewDay ? 0 : current.todayXP) + amount,
    streak: isNewDay ? current.streak + 1 : current.streak,
    lastPracticeDate: today,
    completedExercisesCount: current.completedExercisesCount + 1,
  };
  saveUserStats(newStats);
  return newStats;
}

export function loadActiveLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(ACTIVE_LANG_KEY);
    if (saved === 'de' || saved === 'en' || saved === 'zh') return saved;
  } catch {}
  return 'de';
}

export function saveActiveLanguage(lang: LanguageCode): void {
  try {
    localStorage.setItem(ACTIVE_LANG_KEY, lang);
  } catch {}
}

export function loadAudioSettings(): AudioSettings {
  try {
    const saved = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (saved) return { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_AUDIO_SETTINGS;
}

export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
