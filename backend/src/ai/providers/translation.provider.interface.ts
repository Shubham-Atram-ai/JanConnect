// ─── Translation Provider Interface ─────────────────────────────────────────

export interface Translation {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
  isAvailable: boolean;
}

export abstract class TranslationProvider {
  abstract translate(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<Translation>;
}

export const TRANSLATION_PROVIDER = Symbol('TRANSLATION_PROVIDER');
