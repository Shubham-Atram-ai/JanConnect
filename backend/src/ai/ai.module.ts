import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MockSpeechProvider } from './providers/mock-speech.provider';
import { MockTranslationProvider } from './providers/mock-translation.provider';
import { MockIntelligenceProvider } from './providers/mock-intelligence.provider';
import { MockEmbeddingProvider } from './providers/mock-embedding.provider';

@Module({
  providers: [
    AiService,
    MockSpeechProvider,
    MockTranslationProvider,
    MockIntelligenceProvider,
    MockEmbeddingProvider,
  ],
  exports: [AiService],
})
export class AiModule {}
