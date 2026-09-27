import api from '../lib/api';

export interface Challenge {
  id: string;
  challengeCode: string;
  citizenId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'MATCHING' | 'MATCHED' | 'DISTRIBUTED' | 'WITHDRAWN';
  title?: string;
  summary?: string;
  domain?: string;
  subdomain?: string;
  problemType?: string;
  requiredSkills: string[];
  tags: string[];
  affectedPopulation?: string;
  originalTranscript?: string;
  originalLanguage?: string;
  normalizedText?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  createdAt: string;
  updatedAt: string;
  media?: ChallengeMedia[];
  analyses?: ChallengeAnalysis[];
  auditLogs?: AuditLog[];
  _count?: { media: number; analyses: number };
}

export interface ChallengeMedia {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface ChallengeAnalysis {
  id: string;
  provider: string;
  confidence: number;
  isFallback: boolean;
  outputJson: {
    title: string;
    summary: string;
    domain: string;
    subdomain: string;
    problemType: string;
    requiredSkills: string[];
    tags: string[];
    affectedPopulation?: string | null;
    confidence: number;
  };
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
}

export interface SubmitResult {
  challengeId: string;
  challengeCode: string;
  status: string;
}

export interface AiAnalysisResult {
  challenge: Challenge;
  analysis: ChallengeAnalysis;
  aiResult: {
    originalTranscript: string;
    detectedLanguage: string;
    normalizedText: string;
    analysis: ChallengeAnalysis['outputJson'];
    provider: string;
    isFallback: boolean;
  };
}

const challengeService = {
  create: (data: Partial<Challenge>): Promise<Challenge> =>
    api.post('/challenges', data).then((r) => r.data),

  list: (): Promise<Challenge[]> =>
    api.get('/challenges').then((r) => r.data),

  get: (id: string): Promise<Challenge> =>
    api.get(`/challenges/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<Challenge>): Promise<Challenge> =>
    api.patch(`/challenges/${id}`, data).then((r) => r.data),

  analyzeText: (id: string, text: string, language = 'en'): Promise<AiAnalysisResult> => {
    // First save the text to the challenge, then analyze
    return api
      .patch(`/challenges/${id}`, { normalizedText: text, originalLanguage: language })
      .then(() => api.post(`/challenges/${id}/analyze`, { language }))
      .then((r) => r.data);
  },

  analyzeVoice: (id: string, audioBlob: Blob, language?: string): Promise<AiAnalysisResult> => {
    const form = new FormData();
    form.append('audio', audioBlob, `recording-${Date.now()}.webm`);
    if (language) form.append('language', language);
    return api
      .post(`/challenges/${id}/voice`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  uploadMedia: (id: string, file: File): Promise<ChallengeMedia> => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post(`/challenges/${id}/media`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  submit: (id: string): Promise<SubmitResult> =>
    api.post(`/challenges/${id}/submit`).then((r) => r.data),

  getSolutions: (id: string): Promise<any[]> =>
    api.get(`/challenges/${id}/solutions`).then((r) => r.data),

  getSolution: (solutionId: string): Promise<any> =>
    api.get(`/solutions/${solutionId}`).then((r) => r.data),
};

export default challengeService;
