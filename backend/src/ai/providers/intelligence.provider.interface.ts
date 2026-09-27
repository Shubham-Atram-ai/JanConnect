// ─── Intelligence Provider Interface ────────────────────────────────────────

export interface ChallengeAnalysisOutput {
  title: string;
  summary: string;
  domain: string;
  subdomain: string;
  problemType: string;
  requiredSkills: string[];
  locationEntities: string[];
  affectedPopulation: string | null;
  tags: string[];
  confidence: number;
  provider: string;
}

export abstract class IntelligenceProvider {
  abstract analyzeChallenge(input: {
    text: string;
    language: string;
  }): Promise<ChallengeAnalysisOutput>;
}

export const INTELLIGENCE_PROVIDER = Symbol('INTELLIGENCE_PROVIDER');
