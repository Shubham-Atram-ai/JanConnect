
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Tag, MapPin, Calendar, Bot, Image, Video, Volume2
} from 'lucide-react';
import challengeService from '../../services/challengeService';
import ChallengeTimeline from '../../components/ChallengeTimeline';

const STATUS_STYLES = {
  DRAFT: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  SUBMITTED: 'bg-green-500/10 text-green-400 border-green-500/30',
  WITHDRAWN: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function ProblemDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: challenge, isLoading, error } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => challengeService.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white font-medium">Challenge not found</p>
        <button onClick={() => navigate('/citizen')} className="text-blue-400 text-sm hover:text-blue-300">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const location = [challenge.village, challenge.block, challenge.district, challenge.state]
    .filter(Boolean).join(', ');
  const latestAnalysis = challenge.analyses?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-blue-400 text-sm font-mono font-bold">{challenge.challengeCode}</span>
              <span className={`text-xs border px-2 py-0.5 rounded-full ${STATUS_STYLES[challenge.status]}`}>
                {challenge.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-16">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white leading-snug">
            {challenge.title || 'Untitled Problem'}
          </h1>
          {challenge.summary && (
            <p className="text-slate-300 text-sm leading-relaxed">{challenge.summary}</p>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {challenge.domain && (
            <span className="flex items-center gap-1.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
              <Tag className="w-3 h-3" /> {challenge.domain}
              {challenge.subdomain && ` · ${challenge.subdomain}`}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5 text-xs bg-slate-700/50 border border-slate-600/50 text-slate-300 px-3 py-1 rounded-full">
              <MapPin className="w-3 h-3" /> {location}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs bg-slate-700/50 border border-slate-600/50 text-slate-300 px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3" />
            {new Date(challenge.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Tags */}
        {challenge.tags && challenge.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {challenge.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-800/50 border border-slate-700/30 text-slate-400 px-2.5 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Required Skills */}
        {challenge.requiredSkills && challenge.requiredSkills.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-3">
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Required Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {challenge.requiredSkills.map((skill) => (
                <span key={skill} className="text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Original Input */}
        {(challenge.originalTranscript || challenge.normalizedText) && (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-2">
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Original Submission</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {challenge.originalTranscript || challenge.normalizedText}
            </p>
            {challenge.originalLanguage && challenge.originalLanguage !== 'en' && (
              <p className="text-slate-500 text-xs">Language: {challenge.originalLanguage}</p>
            )}
          </div>
        )}

        {/* AI Analysis Summary */}
        {latestAnalysis && (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-3.5 h-3.5" /> AI Analysis
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {Math.round(latestAnalysis.confidence * 100)}% confidence
              </span>
            </div>
            <p className="text-xs text-slate-500">Provider: {latestAnalysis.provider}</p>
          </div>
        )}

        {/* Media */}
        {challenge.media && challenge.media.length > 0 && (
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 space-y-3">
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Evidence</h3>
            <div className="space-y-2">
              {challenge.media.map((m) => {
                const Icon = m.type === 'IMAGE' ? Image : m.type === 'VIDEO' ? Video : Volume2;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-2 bg-slate-700/20 rounded-lg">
                    <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-slate-300 text-xs truncate">{m.storageKey.split('/').pop()}</span>
                    <span className="text-slate-500 text-xs ml-auto">
                      {(m.sizeBytes / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* University Matching Note */}
        {challenge.status === 'SUBMITTED' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-blue-300 text-sm font-medium">🎓 AI University Matching</p>
            <p className="text-blue-300/60 text-xs mt-1">
              Your problem will be matched with up to 5 universities in the next phase.
              This feature is coming soon.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">Progress Timeline</h3>
          <ChallengeTimeline
            auditLogs={challenge.auditLogs}
            status={challenge.status}
          />
        </div>
      </div>
    </div>
  );
}
