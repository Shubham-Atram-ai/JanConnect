import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { ArrowLeft, CheckCircle, Clock, Mic2, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminSolutionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [solution, setSolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadSolution();
  }, [id]);

  const loadSolution = async () => {
    try {
      const { data } = await api.get(`/admin/solutions/${id}`);
      setSolution(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="text-slate-400">Loading solution...</div>
    </div>;
  }

  if (!solution) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-slate-300">Solution not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 pb-16">
      {/* Top Nav */}
      <nav className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">JanConnect Admin</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link to="/admin/dashboard" className="text-slate-400 flex items-center gap-2 hover:text-white transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/admin/solutions" className="text-slate-400 flex items-center gap-2 hover:text-white transition-colors">
                <FileText className="w-4 h-4" /> Solutions
              </Link>
            </div>
            <div className="h-6 w-px bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm hidden sm:block">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/admin/solutions" className="p-2 bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl border border-slate-700/40 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Solution Details</h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 shadow-xl space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Submitted
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {new Date(solution.submittedAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{solution.title}</h1>
            <p className="text-blue-400 text-sm font-medium">By {solution.workspace?.assignment?.university?.organization?.name || 'University'}</p>
            <p className="text-slate-400 text-sm mt-1">Problem Code: {solution.workspace?.assignment?.challenge?.challengeCode}</p>
          </div>

          <div className="space-y-6 text-slate-300 text-sm">
            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h2 className="text-white font-semibold mb-3 text-base">Executive Summary</h2>
              <p className="leading-relaxed">{solution.summary}</p>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h2 className="text-white font-semibold mb-3 text-base">Problem Understanding</h2>
              <p className="leading-relaxed whitespace-pre-wrap">{solution.problemStatement || 'Not specified'}</p>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h2 className="text-white font-semibold mb-3 text-base">Proposed Approach</h2>
              <p className="leading-relaxed whitespace-pre-wrap">{solution.proposedApproach}</p>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h2 className="text-white font-semibold mb-3 text-base">Methodology</h2>
              <p className="leading-relaxed whitespace-pre-wrap">{solution.methodology}</p>
            </section>

            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h2 className="text-white font-semibold mb-3 text-base">Implementation Plan</h2>
              <p className="leading-relaxed whitespace-pre-wrap">{solution.implementationPlan}</p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <h2 className="text-white font-semibold mb-3 text-base">Expected Outcome</h2>
                <p className="leading-relaxed whitespace-pre-wrap">{solution.expectedOutcome || 'Not specified'}</p>
              </section>
              <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <h2 className="text-white font-semibold mb-3 text-base">Expected Impact</h2>
                <p className="leading-relaxed whitespace-pre-wrap">{solution.expectedImpact || 'Not specified'}</p>
              </section>
            </div>
            
            <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                <h2 className="text-white font-semibold mb-3 text-base">Research Findings</h2>
                {solution.workspace?.findings?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {solution.workspace.findings.map((f: any) => (
                      <li key={f.id}>{f.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400">No confirmed findings.</p>
                )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
