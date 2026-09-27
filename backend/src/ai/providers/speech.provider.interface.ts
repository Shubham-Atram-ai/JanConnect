// ─── Speech Provider Interface ──────────────────────────────────────────────

export interface Transcript {
  text: string;
  detectedLanguage: string;
  provider: string;
  confidence: number;
}

export interface AudioRef {
  bucket: string;
  key: string;
}

export abstract class SpeechProvider {
  abstract transcribe(audioRef: AudioRef): Promise<Transcript>;
}

export const SPEECH_PROVIDER = Symbol('SPEECH_PROVIDER');
