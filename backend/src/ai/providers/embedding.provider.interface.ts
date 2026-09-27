// ─── Embedding Provider Interface ───────────────────────────────────────────

export abstract class EmbeddingProvider {
  abstract embed(text: string): Promise<number[]>;
}

export const EMBEDDING_PROVIDER = Symbol('EMBEDDING_PROVIDER');
