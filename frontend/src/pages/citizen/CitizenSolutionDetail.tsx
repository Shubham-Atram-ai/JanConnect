import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';

export default function CitizenSolutionDetail() {
  const { id } = useParams();
  const [solution, setSolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolution();
  }, [id]);

  const loadSolution = async () => {
    try {
      const { data } = await api.get(`/solutions/${id}`);
      setSolution(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="text-indigo-400">Loading solution...</div>
    </div>;
  }

  if (!solution) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Solution not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pb-16">
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to={`/citizen/problems/${solution.workspace?.assignment?.challengeId}`} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-white font-medium">Solution Proposed</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Submitted
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(solution.submittedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{solution.title}</h1>
            <p className="text-indigo-300 text-sm">By {solution.workspace?.assignment?.university?.organization?.name || 'University'}</p>
          </div>

          <div className="space-y-6 text-slate-300 text-sm">
            <section className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
              <h2 className="text-white font-semibold mb-2">Executive Summary</h2>
              <p className="leading-relaxed">{solution.summary}</p>
            </section>

            <section className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
              <h2 className="text-white font-semibold mb-2">Proposed Approach</h2>
              <p className="leading-relaxed whitespace-pre-wrap">{solution.proposedApproach}</p>
            </section>

            <section className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
              <h2 className="text-white font-semibold mb-2">Implementation Plan</h2>
              <p className="leading-relaxed whitespace-pre-wrap">{solution.implementationPlan}</p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
                <h2 className="text-white font-semibold mb-2">Expected Outcome</h2>
                <p className="leading-relaxed whitespace-pre-wrap">{solution.expectedOutcome || 'Not specified'}</p>
              </section>
              <section className="bg-slate-900/50 p-5 rounded-xl border border-white/5">
                <h2 className="text-white font-semibold mb-2">Expected Impact</h2>
                <p className="leading-relaxed whitespace-pre-wrap">{solution.expectedImpact || 'Not specified'}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
