import { Injectable, Logger } from '@nestjs/common';
import { MockSpeechProvider } from './providers/mock-speech.provider';
import { MockTranslationProvider } from './providers/mock-translation.provider';
import { MockIntelligenceProvider } from './providers/mock-intelligence.provider';
import { MockEmbeddingProvider } from './providers/mock-embedding.provider';
import { AudioRef } from './providers/speech.provider.interface';
import { ChallengeAnalysisOutput } from './providers/intelligence.provider.interface';
import { validateAiOutput } from './ai-output.validator';

export interface AiPipelineResult {
  originalTranscript: string;
  detectedLanguage: string;
  normalizedText: string;
  analysis: ChallengeAnalysisOutput;
  provider: string;
  isFallback: boolean;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly speech: MockSpeechProvider,
    private readonly translation: MockTranslationProvider,
    private readonly intelligence: MockIntelligenceProvider,
    private readonly embedding: MockEmbeddingProvider,
  ) {}

  /**
   * Full audio pipeline:
   * Audio → Transcript → Translation → Intelligence → Validated Analysis
   */
  async processAudio(audioRef: AudioRef): Promise<AiPipelineResult> {
    this.logger.log(`Processing audio: ${audioRef.key}`);

    const transcript = await this.speech.transcribe(audioRef);
    this.logger.log(`Transcript: lang=${transcript.detectedLanguage}, conf=${transcript.confidence}`);

    let normalizedText = transcript.text;
    if (transcript.detectedLanguage !== 'en') {
      const t = await this.translation.translate(transcript.text, transcript.detectedLanguage, 'en');
      if (t.isAvailable) normalizedText = t.translatedText;
    }

    return this.runIntelligence(normalizedText, transcript.text, transcript.detectedLanguage);
  }

  /**
   * Text-only pipeline:
   * Text → (optional translation) → Intelligence → Validated Analysis
   */
  async processText(text: string, language = 'en'): Promise<AiPipelineResult> {
    this.logger.log(`Processing text input (lang=${language})`);

    let normalizedText = text;
    if (language !== 'en') {
      const t = await this.translation.translate(text, language, 'en');
      if (t.isAvailable) normalizedText = t.translatedText;
    }

    return this.runIntelligence(normalizedText, text, language);
  }

  private async runIntelligence(
    normalizedText: string,
    originalText: string,
    language: string,
  ): Promise<AiPipelineResult> {
    let rawAnalysis: ChallengeAnalysisOutput;
    let isFallback = false;

    try {
      rawAnalysis = await this.intelligence.analyzeChallenge({
        text: normalizedText,
        language,
      });
      // Validate and sanitize
      rawAnalysis = validateAiOutput(rawAnalysis) as ChallengeAnalysisOutput;
    } catch (err: unknown) {
      this.logger.warn('Intelligence provider failed, using fallback', err);
      isFallback = true;
      rawAnalysis = {
        title: 'Problem description submitted',
        summary: normalizedText.substring(0, 500),
        domain: 'Public Services',
        subdomain: '',
        problemType: 'General',
        requiredSkills: [],
        locationEntities: [],
        affectedPopulation: null,
        tags: [],
        confidence: 0.3,
        provider: 'fallback',
      };
    }

    return {
      originalTranscript: originalText,
      detectedLanguage: language,
      normalizedText,
      analysis: rawAnalysis,
      provider: rawAnalysis.provider,
      isFallback,
    };
  }

  async embed(text: string): Promise<number[]> {
    return this.embedding.embed(text);
  }
}
