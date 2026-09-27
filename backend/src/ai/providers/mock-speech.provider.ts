import { Injectable } from '@nestjs/common';
import { AudioRef, SpeechProvider, Transcript } from './speech.provider.interface';

// ─── Mock Speech Provider ─────────────────────────────────────────────────────
// Uses deterministic fixtures. Clearly marked as mock/development.

const FIXTURES: Record<string, Transcript> = {
  default_hi: {
    text: 'हर साल बहुत ज्यादा बारिश होने के कारण हमारे खेत में पानी भर जाता है और फसल खराब हो जाती है।',
    detectedLanguage: 'hi',
    provider: 'mock-speech',
    confidence: 0.94,
  },
  default_en: {
    text: 'Every year heavy rainfall causes waterlogging in our fields and reduces crop production.',
    detectedLanguage: 'en',
    provider: 'mock-speech',
    confidence: 0.97,
  },
  default_hinglish: {
    text: 'Har saal heavy rain ki wajah se field mein paani bhar jata hai aur crop kharab ho jaati hai.',
    detectedLanguage: 'hi',
    provider: 'mock-speech',
    confidence: 0.89,
  },
  water_en: {
    text: 'The water supply in our village has been contaminated and people are falling sick.',
    detectedLanguage: 'en',
    provider: 'mock-speech',
    confidence: 0.95,
  },
  road_hi: {
    text: 'हमारे गांव की सड़क बहुत खराब है। बारिश में पानी भर जाता है और यातायात रुक जाता है।',
    detectedLanguage: 'hi',
    provider: 'mock-speech',
    confidence: 0.91,
  },
};

@Injectable()
export class MockSpeechProvider extends SpeechProvider {
  /**
   * Returns a deterministic transcript fixture based on the audio key.
   * In production, this would call a real STT service.
   *
   * [DEV/MOCK] — Not real speech recognition.
   */
  async transcribe(audioRef: AudioRef): Promise<Transcript> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 200));

    // Pick fixture based on key hints
    const key = audioRef.key.toLowerCase();
    if (key.includes('water')) return FIXTURES.water_en;
    if (key.includes('road')) return FIXTURES.road_hi;
    if (key.includes('hinglish')) return FIXTURES.default_hinglish;
    if (key.includes('_en')) return FIXTURES.default_en;
    if (key.includes('_hi')) return FIXTURES.default_hi;

    // Default fixture
    return FIXTURES.default_hi;
  }
}
