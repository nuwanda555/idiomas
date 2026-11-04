import { LanguageCode } from '../types';

export interface SpeechRecorderState {
  isRecording: boolean;
  transcript: string;
  interimTranscript: string;
  audioBlob: Blob | null;
  audioUrl: string | null;
  volumeLevel: number; // 0 to 1
  error: string | null;
}

export interface SpeechRecorderController {
  start: () => Promise<void>;
  stop: () => Promise<{ transcript: string; audioBase64?: string; audioUrl?: string }>;
  cancel: () => void;
  isSupported: boolean;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window
  );
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result as string;
      // strip "data:audio/...;base64,"
      const base64 = res.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function createSpeechSession({
  language,
  onVolumeChange,
  onTranscriptChange,
  onError
}: {
  language: LanguageCode;
  onVolumeChange?: (vol: number) => void;
  onTranscriptChange?: (text: string, isFinal: boolean) => void;
  onError?: (err: string) => void;
}) {
  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let recognitionInstance: any = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let animFrameId: number | null = null;
  let audioChunks: Blob[] = [];
  let fullTranscript = '';

  const langMap: Record<LanguageCode, string> = {
    de: 'de-DE',
    en: 'en-US',
    zh: 'zh-CN',
  };

  const start = async () => {
    fullTranscript = '';
    audioChunks = [];

    // 1. Get audio stream for volume visualization and recording
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Volume analyzer via Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(mediaStream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 80);
        onVolumeChange?.(normalized);
        animFrameId = requestAnimationFrame(checkVolume);
      };
      checkVolume();

      // MediaRecorder for audio playback & analysis
      try {
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
          } else {
            mimeType = '';
          }
        }
        mediaRecorder = mimeType ? new MediaRecorder(mediaStream, { mimeType }) : new MediaRecorder(mediaStream);
        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunks.push(e.data);
          }
        };
        mediaRecorder.start(100);
      } catch (recErr) {
        console.warn('MediaRecorder not available or failed', recErr);
      }
    } catch (micErr: any) {
      console.warn('Microphone permission not granted or device not found', micErr);
      onError?.(
        micErr.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador.'
          : 'No se pudo acceder al micrófono del dispositivo.'
      );
    }

    // 2. Start browser SpeechRecognition
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        recognitionInstance = new SpeechRec();
        recognitionInstance.lang = langMap[language];
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              fullTranscript += (fullTranscript ? ' ' : '') + piece;
            } else {
              interim += piece;
            }
          }
          const display = fullTranscript + (interim ? ' ' + interim : '');
          onTranscriptChange?.(display.trim(), false);
        };

        recognitionInstance.onerror = (e: any) => {
          // ignore 'no-speech' or 'aborted' as standard non-fatal conditions
          if (e.error !== 'no-speech' && e.error !== 'aborted') {
            console.debug('Speech recognition event error:', e.error);
          }
        };

        recognitionInstance.start();
      } catch (recErr) {
        console.warn('SpeechRecognition failed to start', recErr);
      }
    }
  };

  const stop = async (): Promise<{ transcript: string; audioBase64?: string; audioUrl?: string }> => {
    // Stop animation frame
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    onVolumeChange?.(0);

    // Stop recognition
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch {}
      recognitionInstance = null;
    }

    // Stop recording and create blob
    let audioBlob: Blob | null = null;
    let audioBase64: string | undefined = undefined;
    let audioUrl: string | undefined = undefined;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        mediaRecorder!.onstop = () => resolve();
        mediaRecorder!.stop();
      });

      if (audioChunks.length > 0) {
        const type = audioChunks[0]?.type || 'audio/webm';
        audioBlob = new Blob(audioChunks, { type });
        audioUrl = URL.createObjectURL(audioBlob);
        try {
          audioBase64 = await blobToBase64(audioBlob);
        } catch (e) {
          console.warn('Failed to convert recorded blob to base64', e);
        }
      }
    }

    // Stop audio context
    if (audioContext && audioContext.state !== 'closed') {
      try {
        await audioContext.close();
      } catch {}
      audioContext = null;
    }

    // Stop tracks
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    return {
      transcript: fullTranscript.trim(),
      audioBase64,
      audioUrl
    };
  };

  const cancel = () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (recognitionInstance) {
      try { recognitionInstance.abort(); } catch {}
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try { mediaRecorder.stop(); } catch {}
    }
    if (audioContext && audioContext.state !== 'closed') {
      try { audioContext.close(); } catch {}
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
    }
    onVolumeChange?.(0);
  };

  return { start, stop, cancel };
}
