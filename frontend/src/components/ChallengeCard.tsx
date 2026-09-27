
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag, MapPin, ChevronRight } from 'lucide-react';
import type { Challenge } from '../services/challengeService';

interface ChallengeCardProps {
  challenge: Challenge;
}

const STATUS_STYLES = {
  DRAFT: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  SUBMITTED: 'bg-green-500/10 text-green-400 border-green-500/30',
  MATCHING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  MATCHED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  DISTRIBUTED: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  WITHDRAWN: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  MATCHING: 'AI Matching',
  MATCHED: 'Matched',
  DISTRIBUTED: 'In Research',
  WITHDRAWN: 'Withdrawn',
};

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const navigate = useNavigate();
  const location = [challenge.village, challenge.district, challenge.state].filter(Boolean).join(', ');

  return (
    <button
      onClick={() => navigate(`/citizen/problems/${challenge.id}`)}
      className="w-full text-left bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 hover:border-slate-600/60 rounded-2xl p-5 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Code + status */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-blue-400 text-xs font-mono font-bold bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {challenge.challengeCode}
            </span>
            <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${(STATUS_STYLES as any)[challenge.status]}`}>
              {(STATUS_LABELS as any)[challenge.status]}
            </span>
            {challenge.status === 'SUBMITTED' && (
              <span className="text-xs text-blue-300/60 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded-full">
                🎓 Awaiting university matching
              </span>
            )}
            {(challenge.status === 'MATCHING' || challenge.status === 'MATCHED') && (
              <span className="text-xs text-blue-300/60 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded-full">
                🎓 Universities matched
              </span>
            )}
            {challenge.status === 'DISTRIBUTED' && (
              <span className="text-xs text-blue-300/60 bg-blue-500/5 border border-blue-500/20 px-2 py-0.5 rounded-full">
                🔬 Research in progress
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-2">
            {challenge.title || challenge.normalizedText?.slice(0, 80) || 'Untitled problem'}
          </h3>

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            {challenge.domain && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {challenge.domain}
                {challenge.subdomain && ` · ${challenge.subdomain}`}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(challenge.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}
