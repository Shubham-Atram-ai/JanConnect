import { Injectable } from '@nestjs/common';
import {
  ChallengeAnalysisOutput,
  IntelligenceProvider,
} from './intelligence.provider.interface';

// ─── Allowed Domain Vocabulary ───────────────────────────────────────────────
const ALLOWED_DOMAINS = [
  'Education',
  'Healthcare',
  'Agriculture',
  'Water',
  'Sanitation',
  'Environment',
  'Accessibility',
  'Infrastructure',
  'Public Services',
  'Energy',
];

// ─── Scenario Fixtures ────────────────────────────────────────────────────────
type Scenario = 'rainfall' | 'water' | 'road' | 'education' | 'health' | 'default';

const FIXTURES: Record<Scenario, ChallengeAnalysisOutput> = {
  rainfall: {
    title: 'Annual rainfall causes crop yield reduction',
    summary:
      'Heavy rainfall causes waterlogging in agricultural fields every year, reducing crop production and causing significant economic losses to farmers.',
    domain: 'Agriculture',
    subdomain: 'Crop Resilience',
    problemType: 'Climate-related agricultural impact',
    requiredSkills: [
      'Agricultural Engineering',
      'Hydrology',
      'Soil Science',
      'Climate Science',
      'Data Science',
    ],
    locationEntities: [],
    affectedPopulation: 'Farmers in flood-prone agricultural zones',
    tags: ['rainfall', 'waterlogging', 'agriculture', 'crop-loss', 'flooding'],
    confidence: 0.91,
    provider: 'mock-intelligence',
  },
  water: {
    title: 'Contaminated water supply causing illness in rural village',
    summary:
      'Village water supply has been contaminated, causing residents to fall ill. Access to clean drinking water is a critical issue requiring urgent intervention.',
    domain: 'Water',
    subdomain: 'Drinking Water Quality',
    problemType: 'Water contamination and public health crisis',
    requiredSkills: [
      'Water Engineering',
      'Public Health',
      'Environmental Science',
      'Chemistry',
    ],
    locationEntities: [],
    affectedPopulation: 'Rural village residents',
    tags: ['water-contamination', 'drinking-water', 'public-health', 'rural'],
    confidence: 0.93,
    provider: 'mock-intelligence',
  },
  road: {
    title: 'Deteriorating village road causing traffic disruption during rains',
    summary:
      'The village road is in poor condition and becomes flooded during monsoon season, blocking access for residents, emergency vehicles, and supply chains.',
    domain: 'Infrastructure',
    subdomain: 'Rural Road Infrastructure',
    problemType: 'Transportation and connectivity failure',
    requiredSkills: [
      'Civil Engineering',
      'Road Design',
      'Drainage Engineering',
      'Urban Planning',
    ],
    locationEntities: [],
    affectedPopulation: 'Village residents and supply chains',
    tags: ['road', 'infrastructure', 'flooding', 'rural-connectivity'],
    confidence: 0.88,
    provider: 'mock-intelligence',
  },
  education: {
    title: 'Lack of access to quality education in remote areas',
    summary:
      'Students in remote areas lack access to quality teachers and educational resources, leading to poor academic outcomes and high dropout rates.',
    domain: 'Education',
    subdomain: 'Rural Education Access',
    problemType: 'Education accessibility and quality gap',
    requiredSkills: [
      'Education Technology',
      'Curriculum Design',
      'Instructional Design',
      'Distance Learning',
    ],
    locationEntities: [],
    affectedPopulation: 'Students in remote rural areas',
    tags: ['education', 'rural', 'access', 'learning', 'digital-divide'],
    confidence: 0.85,
    provider: 'mock-intelligence',
  },
  health: {
    title: 'Inadequate healthcare facilities in rural community',
    summary:
      'The rural community lacks adequate healthcare facilities and medical staff, resulting in poor health outcomes and high travel burdens for medical care.',
    domain: 'Healthcare',
    subdomain: 'Rural Health Infrastructure',
    problemType: 'Healthcare accessibility and infrastructure gap',
    requiredSkills: [
      'Public Health',
      'Medicine',
      'Healthcare Management',
      'Telemedicine',
    ],
    locationEntities: [],
    affectedPopulation: 'Rural community residents',
    tags: ['healthcare', 'rural', 'medical-access', 'infrastructure'],
    confidence: 0.87,
    provider: 'mock-intelligence',
  },
  default: {
    title: 'Societal challenge requiring community-driven solution',
    summary:
      'A societal problem has been reported that affects the local community. Further details are needed to provide a comprehensive analysis and solution pathway.',
    domain: 'Public Services',
    subdomain: 'Community Services',
    problemType: 'General societal challenge',
    requiredSkills: ['Social Work', 'Community Development', 'Policy Analysis'],
    locationEntities: [],
    affectedPopulation: null,
    tags: ['community', 'public-services'],
    confidence: 0.62,
    provider: 'mock-intelligence',
  },
};

/**
 * Security: Detect prompt injection attempts.
 * Citizen text is ALWAYS treated as challenge content, never as instructions.
 */
function detectPromptInjection(text: string): boolean {
  const injectionPatterns = [
    /ignore (previous|your|all) instructions/i,
    /you are now/i,
    /forget everything/i,
    /act as/i,
    /change my role/i,
    /make me (admin|platform|superuser)/i,
    /system prompt/i,
    /jailbreak/i,
  ];
  return injectionPatterns.some((p) => p.test(text));
}

@Injectable()
export class MockIntelligenceProvider extends IntelligenceProvider {
  /**
   * Returns structured challenge analysis from deterministic fixtures.
   * Detects and safely handles prompt injection attempts.
   *
   * [DEV/MOCK] — Not real AI analysis.
   */
  async analyzeChallenge(input: {
    text: string;
    language: string;
  }): Promise<ChallengeAnalysisOutput> {
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 500));

    const lower = input.text.toLowerCase();

    // Security: If injection detected, classify as challenge content, not instruction
    if (detectPromptInjection(input.text)) {
      return {
        ...FIXTURES.default,
        title: 'Report flagged for security review',
        summary:
          'This submission contains text patterns that could not be processed by the AI analysis system. Please resubmit with a clear description of the problem you are facing.',
        confidence: 0.3,
        tags: ['security-flag', 'requires-review'],
      };
    }

    // Keyword-based fixture selection
    if (lower.includes('rain') || lower.includes('baarish') || lower.includes('paani') || lower.includes('crop') || lower.includes('fasal') || lower.includes('khet') || lower.includes('waterlog')) {
      return FIXTURES.rainfall;
    }
    if (lower.includes('water') || lower.includes('contamina') || lower.includes('pani') || lower.includes('paani') || lower.includes('peeye')) {
      return FIXTURES.water;
    }
    if (lower.includes('road') || lower.includes('sadak') || lower.includes('transport') || lower.includes('traffic')) {
      return FIXTURES.road;
    }
    if (lower.includes('school') || lower.includes('education') || lower.includes('student') || lower.includes('teacher') || lower.includes('vidya')) {
      return FIXTURES.education;
    }
    if (lower.includes('health') || lower.includes('hospital') || lower.includes('doctor') || lower.includes('medical') || lower.includes('swasthya')) {
      return FIXTURES.health;
    }

    return FIXTURES.default;
  }

  getAllowedDomains(): string[] {
    return ALLOWED_DOMAINS;
  }
}
