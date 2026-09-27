import { Injectable } from '@nestjs/common';
import { EmbeddingProvider } from './embedding.provider.interface';

// ─── Mock Embedding Provider ──────────────────────────────────────────────────

@Injectable()
export class MockEmbeddingProvider extends EmbeddingProvider {
  /**
   * Returns a deterministic 384-dim mock embedding vector.
   * Real providers would call an embedding model.
   *
   * [DEV/MOCK] — Not real embeddings.
   */
  async embed(text: string): Promise<number[]> {
    // Generate a deterministic vector from text hash
    const dim = 384;
    const seed = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array.from({ length: dim }, (_, i) =>
      Math.sin(seed + i) * 0.5 + Math.cos(seed * i + 1) * 0.5,
    );
  }
}
