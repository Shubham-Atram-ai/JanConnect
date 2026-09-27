import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, Type, CheckCircle2,
  Sparkles, Send, AlertCircle, Loader2, RotateCcw
} from 'lucide-react';
import VoiceRecorder from '../../components/VoiceRecorder';
import LocationPicker from '../../components/LocationPicker';
import MediaUpload from '../../components/MediaUpload';
import AIReviewCard from '../../components/AIReviewCard';
import type { AIEditState } from '../../components/AIReviewCard';
import challengeService from '../../services/challengeService';
import type { Challenge, AiAnalysisResult } from '../../services/challengeService';

// ─── Step definition ────────────────────────────────────────────────────────
type Step = 'input' | 'location-media' | 'analyzing' | 'review' | 'success';

interface LocationData {
  latitude?: number;
  longitude?: number;
  state?: string;
  district?: string;
  block?: string;
  village?: string;
}

export default function NewProblem() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('input');
  const [inputMode, setInputMode] = useState<'voice' | 'text' | null>(null);
  const [textInput, setTextInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [location, setLocation] = useState<LocationData>({});
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [editState, setEditState] = useState<AIEditState>({
    title: '', summary: '', domain: '', subdomain: '', problemType: '',
    requiredSkills: [], tags: [], affectedPopulation: '',
  });
  const [submitResult, setSubmitResult] = useState<{ challengeCode: string; challengeId: string } | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Step 1: Create challenge + process input ────────────────────────────

  const handleTextAnalyze = useCallback(async () => {
    if (!textInput.trim()) {
      setError('Please describe your problem first.');
      return;
    }
    setError('');
    setIsProcessing(true);
    setStep('analyzing');

    try {
      // Create draft challenge
      const newChallenge = await challengeService.create({
        originalTranscript: textInput,
        originalLanguage: language,
        normalizedText: textInput,
      });
      setChallenge(newChallenge);

      // Run AI analysis
      const result = await challengeService.analyzeText(newChallenge.id, textInput, language);
      setAnalysisResult(result);

      // Initialize edit state from AI output
      const out = result.analysis.outputJson;
      setEditState({
        title: out.title || '',
        summary: out.summary || '',
        domain: out.domain || '',
        subdomain: out.subdomain || '',
        problemType: out.problemType || '',
        requiredSkills: out.requiredSkills || [],
        tags: out.tags || [],
        affectedPopulation: out.affectedPopulation || '',
      });

      setStep('review');
    } catch (err) {
      setError('Analysis failed. You can still submit manually.');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  }, [textInput, language]);

  const handleVoiceComplete = useCallback(async (blob: Blob, _duration: number) => {
    setError('');
    setIsProcessing(true);
    setStep('analyzing');

    try {
      // Create draft challenge
      const newChallenge = await challengeService.create({});
      setChallenge(newChallenge);

      // Process voice
      const result = await challengeService.analyzeVoice(newChallenge.id, blob, language === 'en' ? undefined : language);
      setAnalysisResult(result);

      const out = result.analysis.outputJson;
      setEditState({
        title: out.title || '',
        summary: out.summary || '',
        domain: out.domain || '',
        subdomain: out.subdomain || '',
        problemType: out.problemType || '',
        requiredSkills: out.requiredSkills || [],
        tags: out.tags || [],
        affectedPopulation: out.affectedPopulation || '',
      });

      setStep('review');
    } catch (err) {
      setError('Voice processing failed. Please type your problem instead.');
      setStep('input');
      setInputMode('text');
    } finally {
      setIsProcessing(false);
    }
  }, [language]);

  // ─── Step 2: Location + media ────────────────────────────────────────────



  // ─── Review & Submit ─────────────────────────────────────────────────────

  const handleEditChange = useCallback((field: keyof AIEditState, value: string | string[]) => {
    setEditState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!challenge) return;
    setError('');
    setIsProcessing(true);

    try {
      // Save citizen edits
      await challengeService.update(challenge.id, {
        title: editState.title,
        summary: editState.summary,
        domain: editState.domain,
        subdomain: editState.subdomain,
        problemType: editState.problemType,
        requiredSkills: editState.requiredSkills,
        tags: editState.tags,
        affectedPopulation: editState.affectedPopulation || undefined,
      });

      // Submit
      const result = await challengeService.submit(challenge.id);
      setSubmitResult({ challengeCode: result.challengeCode, challengeId: result.challengeId });
      setStep('success');
    } catch (err: unknown) {
      console.error(err);
      setError('Submission failed. Your draft has been saved. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [challenge, editState]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => step === 'success' ? navigate('/citizen') : navigate(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold">
            {step === 'success' ? 'Problem Submitted' : 'Report a Problem'}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ── STEP: input ── */}
        {step === 'input' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">What problem are you facing?</h2>
              <p className="text-slate-400 text-sm mt-1">
                Describe it in your own words — AI will help structure it for you
              </p>
            </div>

            {/* Language selector */}
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी' },
                { code: 'hi', label: 'Hinglish' },
              ].map((l, i) => (
                <button
                  key={i}
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                    language === l.code
                      ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                      : 'border-slate-700/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>

            {/* Mode selector */}
            {!inputMode && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setInputMode('voice')}
                  id="voice-mode-btn"
                  className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 border border-blue-500/30 hover:border-blue-500/60 rounded-2xl transition-all group"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">🎙 Speak</p>
                    <p className="text-slate-400 text-xs mt-1">Record your problem</p>
                  </div>
                </button>

                <button
                  onClick={() => setInputMode('text')}
                  id="text-mode-btn"
                  className="flex flex-col items-center gap-4 p-8 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/60 rounded-2xl transition-all group"
                >
                  <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Type className="w-7 h-7 text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-bold">✍ Type</p>
                    <p className="text-slate-400 text-xs mt-1">Write your problem</p>
                  </div>
                </button>
              </div>
            )}

            {/* Voice mode */}
            {inputMode === 'voice' && (
              <div className="space-y-4">
                <button
                  onClick={() => setInputMode(null)}
                  className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Change input method
                </button>
                <VoiceRecorder
                  onRecordingComplete={handleVoiceComplete}
                  onFallbackToText={() => setInputMode('text')}
                  disabled={isProcessing}
                />
              </div>
            )}

            {/* Text mode */}
            {inputMode === 'text' && (
              <div className="space-y-4">
                <button
                  onClick={() => setInputMode(null)}
                  className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Change input method
                </button>

                <div>
                  <label htmlFor="problem-text" className="block text-sm font-medium text-slate-300 mb-2">
                    Describe your problem
                  </label>
                  <textarea
                    id="problem-text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={6}
                    placeholder="Every year heavy rainfall causes waterlogging in our fields and crops are destroyed. We need a solution to prevent waterlogging and improve drainage in our village..."
                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none transition-all"
                    autoFocus
                  />
                  <p className="text-slate-500 text-xs mt-1 text-right">{textInput.length} characters</p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleTextAnalyze}
                  disabled={isProcessing || !textInput.trim()}
                  id="analyze-btn"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Problem with AI
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP: analyzing ── */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <Loader2 className="absolute inset-0 w-20 h-20 text-blue-500/40 animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-white font-bold text-xl">AI is analyzing your problem…</h3>
              <p className="text-slate-400 text-sm">This takes a few seconds</p>

            </div>
          </div>
        )}

        {/* ── STEP: review ── */}
        {step === 'review' && analysisResult && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Review AI Analysis</h2>
              <p className="text-slate-400 text-sm mt-1">
                Your problem has been understood as shown below. Review and edit any field before submitting.
              </p>
            </div>

            {/* Original input preview */}
            {analysisResult.aiResult.originalTranscript && (
              <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Your original description</p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {analysisResult.aiResult.originalTranscript}
                </p>
                {analysisResult.aiResult.detectedLanguage !== 'en' && (
                  <p className="text-slate-500 text-xs mt-2">
                    Detected language: {analysisResult.aiResult.detectedLanguage} · Translated for analysis
                  </p>
                )}
              </div>
            )}

            {/* AI Review Card */}
            <AIReviewCard
              analysis={analysisResult.analysis}
              editedValues={editState}
              onChange={handleEditChange}
            />

            {/* Location */}
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4">📍 Where is this problem?</h3>
              <LocationPicker value={location} onChange={setLocation} />
            </div>

            {/* Media */}
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-2">📎 Evidence (optional)</h3>
              <p className="text-slate-500 text-xs mb-4">Photos, videos, or documents that show the problem</p>
              <MediaUpload
                onUpload={async (file) => {
                  if (challenge) await challengeService.uploadMedia(challenge.id, file);
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="space-y-3 pb-8">
              <button
                onClick={handleSubmit}
                disabled={isProcessing || !editState.title.trim()}
                id="submit-problem-btn"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-blue-500/25"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                {isProcessing ? 'Submitting…' : 'Submit Problem'}
              </button>
              <p className="text-slate-500 text-xs text-center">
                After submission, AI will match your problem with up to 5 specialized universities
              </p>
            </div>
          </div>
        )}

        {/* ── STEP: success ── */}
        {step === 'success' && submitResult && (
          <div className="flex flex-col items-center text-center py-12 space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Problem submitted successfully!</h2>
              <p className="text-slate-400">Your problem has been recorded in the JanConnect system</p>
            </div>

            {/* Challenge ID */}
            <div className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-2">
              <p className="text-slate-400 text-sm">Your Challenge ID</p>
              <p className="text-4xl font-mono font-bold text-blue-400">{submitResult.challengeCode}</p>
              <p className="text-slate-500 text-xs">Save this ID to track your problem</p>
            </div>

            {/* Status timeline preview */}
            <div className="w-full space-y-3">
              {[
                { label: 'Problem submitted', done: true },
                { label: 'AI university matching', done: false, next: true },
                { label: 'University responses', done: false },
                { label: 'Research solutions', done: false },
              ].map((s) => (
                <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl ${
                  s.done ? 'bg-green-500/10 border border-green-500/20' :
                  s.next ? 'bg-blue-500/10 border border-blue-500/20' :
                  'bg-slate-800/30 border border-slate-700/20'
                }`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    s.done ? 'bg-green-500 text-white' :
                    s.next ? 'border-2 border-blue-500/50 text-blue-400' :
                    'border-2 border-slate-700/50 text-slate-600'
                  }`}>
                    {s.done ? '✓' : '○'}
                  </span>
                  <span className={`text-sm ${
                    s.done ? 'text-green-300 font-medium' :
                    s.next ? 'text-blue-300' : 'text-slate-600'
                  }`}>
                    {s.label}
                    {s.next && <span className="text-xs text-blue-500/60 ml-2">— next stage</span>}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate(`/citizen/problems/${submitResult.challengeId}`)}
                className="py-3 px-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white text-sm rounded-xl transition-all"
              >
                View Problem
              </button>
              <button
                onClick={() => navigate('/citizen')}
                className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
