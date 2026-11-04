import { LanguageCode } from '../types';

// Web Audio API Context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Synthesized UI sound effects using Web Audio API
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';

    // Major third chime: E5 -> A5
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    osc2.frequency.setValueAtTime(880, now);
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.12);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.debug('Audio synth sound error:', e);
  }
}

export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    console.debug('Audio synth error:', e);
  }
}

export function playCelebrationSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  } catch (e) {
    console.debug('Audio celebration error:', e);
  }
}

export function playMicTone(start: boolean = true) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const f1 = start ? 440 : 660;
    const f2 = start ? 660 : 440;

    osc.frequency.setValueAtTime(f1, now);
    osc.frequency.exponentialRampToValueAtTime(f2, now + 0.09);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  } catch (e) {
    console.debug('Audio mic tone error:', e);
  }
}

// Current active HTMLAudioElement or SpeechUtterance
let currentAudioElement: HTMLAudioElement | null = null;

export function stopCurrentPlayback() {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export interface PlaybackOptions {
  rate?: number;
  useStudioAI?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

/**
 * Intelligent Text-to-Speech:
 * 1. If useStudioAI is true, requests high-definition Gemini 3.8 Flash Lite TTS audio from /api/tts.
 * 2. If Gemini audio is received, plays the WAV data.
 * 3. Seamlessly falls back to browser SpeechSynthesis API.
 */
export async function playLanguageAudio(
  text: string,
  language: LanguageCode,
  options: PlaybackOptions = {}
): Promise<void> {
  stopCurrentPlayback();

  const { rate = 1.0, useStudioAI = true, onStart, onEnd, onError } = options;

  if (useStudioAI) {
    try {
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.playbackRate = rate;
          currentAudioElement = audio;

          audio.onplay = () => onStart?.();
          audio.onended = () => {
            currentAudioElement = null;
            onEnd?.();
          };
          audio.onerror = (e) => {
            console.warn('WAV playback failed, falling back to Web Speech API', e);
            speakWithBrowserSynth(text, language, rate, onStart, onEnd, onError);
          };

          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Studio AI TTS endpoint failed, using client SpeechSynthesis', e);
    }
  }

  // Fallback to browser SpeechSynthesis
  speakWithBrowserSynth(text, language, rate, onStart, onEnd, onError);
}

function speakWithBrowserSynth(
  text: string,
  language: LanguageCode,
  rate: number = 1.0,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (!('speechSynthesis' in window)) {
    onError?.('Tu navegador no soporta síntesis de voz.');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langCodes: Record<LanguageCode, string> = {
    de: 'de-DE',
    en: 'en-US',
    zh: 'zh-CN',
  };
  utterance.lang = langCodes[language] || 'en-US';
  utterance.rate = Math.min(1.5, Math.max(0.6, rate));

  // Find preferred voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.startsWith(langCodes[language].split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    console.debug('SpeechSynthesis error:', e);
    onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}
