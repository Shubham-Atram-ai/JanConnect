import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Plus, Filter } from 'lucide-react';
import challengeService from '../../services/challengeService';
import ChallengeCard from '../../components/ChallengeCard';

type Filter = 'all' | 'DRAFT' | 'SUBMITTED' | 'MATCHING' | 'MATCHED' | 'DISTRIBUTED';

export default function MyProblems() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: challengeService.list,
    refetchInterval: 30000,
  });

  const filtered = filter === 'all' ? challenges : challenges.filter((c) => c.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-4">
          <button
            onClick={() => navigate('/citizen')}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-white font-semibold flex-1">My Problems</h1>
          <button
            onClick={() => navigate('/citizen/problems/new')}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: `All (${challenges.length})` },
            { value: 'SUBMITTED', label: `Submitted (${challenges.filter(c => c.status === 'SUBMITTED').length})` },
            { value: 'DRAFT', label: `Drafts (${challenges.filter(c => c.status === 'DRAFT').length})` },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as Filter)}
              className={`px-4 py-2 text-sm rounded-xl border transition-all ${
                filter === f.value
                  ? 'bg-blue-500/20 border-blue-500/40 text-blue-300 font-medium'
                  : 'border-slate-700/50 text-slate-400 hover:border-slate-600/60 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-800/30 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-white font-medium">No {filter === 'all' ? '' : filter.toLowerCase()} problems</p>
            <button
              onClick={() => navigate('/citizen/problems/new')}
              className="inline-flex items-center gap-2 py-2.5 px-5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-sm rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Report a problem
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
