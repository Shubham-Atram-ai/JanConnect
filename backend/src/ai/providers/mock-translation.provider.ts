import { Injectable } from '@nestjs/common';
import { Translation, TranslationProvider } from './translation.provider.interface';

// ─── Mock Translation Provider ────────────────────────────────────────────────

type FixtureKey = string;
const FIXTURES: Record<FixtureKey, string> = {
  'हर साल बहुत ज्यादा बारिश होने के कारण हमारे खेत में पानी भर जाता है और फसल खराब हो जाती है।':
    'Every year heavy rainfall causes waterlogging in our fields and the crops are damaged.',
  'हमारे गांव की सड़क बहुत खराब है। बारिश में पानी भर जाता है और यातायात रुक जाता है।':
    'The road in our village is very bad. During rains, water accumulates and traffic comes to a halt.',
  'हमारे गांव में पीने का साफ पानी नहीं है।':
    'There is no clean drinking water in our village.',
};

@Injectable()
export class MockTranslationProvider extends TranslationProvider {
  /**
   * Returns deterministic translation fixtures.
   * Falls back to original text if no fixture exists.
   *
   * [DEV/MOCK] — Not real machine translation.
   */
  async translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<Translation> {
    // No translation needed for same language
    if (sourceLang === targetLang) {
      return {
        translatedText: text,
        sourceLang,
        targetLang,
        provider: 'mock-translation',
        isAvailable: true,
      };
    }

    // Lookup fixture
    const translated = FIXTURES[text.trim()];
    if (translated) {
      return {
        translatedText: translated,
        sourceLang,
        targetLang,
        provider: 'mock-translation',
        isAvailable: true,
      };
    }

    // No fixture found — return original text, mark unavailable
    return {
      translatedText: text,
      sourceLang,
      targetLang,
      provider: 'mock-translation',
      isAvailable: false,
    };
  }
}
