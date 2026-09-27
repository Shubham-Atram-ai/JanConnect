import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Mic2, LogOut, LayoutDashboard, FileText, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [challenge, setChallenge] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedUnis, setSelectedUnis] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadChallenge();
    loadMatches();
  }, [id]);

  const loadChallenge = async () => {
    try {
      const { data } = await api.get(`/admin/challenges/${id}`);
      setChallenge(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadMatches = async () => {
    try {
      const { data } = await api.get(`/challenges/${id}/matches`);
      setMatches(data);
      // Pre-select top 5
      setSelectedUnis(data.slice(0, 5).map((m: any) => m.universityId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await api.post(`/challenges/${id}/matches`);
      await loadChallenge();
      await loadMatches();
    } catch (e) {
      console.error(e);
      alert('Error generating matches');
    }
    setIsGenerating(false);
  };

  const handleDistribute = async () => {
    if (selectedUnis.length === 0) return alert('Select at least one university');
    if (selectedUnis.length > 5) return alert('Cannot select more than 5');

    setIsDistributing(true);
    try {
      await api.post(`/admin/challenges/${id}/distribute`, { universityIds: selectedUnis });
      alert('Successfully distributed');
      navigate('/admin/dashboard');
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Error distributing');
    }
    setIsDistributing(false);
  };

  const toggleSelect = (uniId: string) => {
    if (selectedUnis.includes(uniId)) {
      setSelectedUnis(prev => prev.filter(id => id !== uniId));
    } else {
      if (selectedUnis.length >= 5) {
        alert('Maximum 5 universities can be selected');
        return;
      }
      setSelectedUnis(prev => [...prev, uniId]);
    }
  };

  if (!challenge) return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white">Loading...</div>;

  const alreadyDistributed = challenge.status === 'DISTRIBUTED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Top Nav */}
      <nav className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl border border-slate-700/40 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Problem Distribution: {challenge.challengeCode}</h1>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${
            challenge.status === 'DISTRIBUTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            challenge.status === 'MATCHED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            {challenge.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-lg mb-4 text-white">AI Extracted Requirements</h3>
              <p className="text-sm text-slate-300 mb-3"><strong className="text-slate-400">Domain:</strong> {challenge.domain}</p>
              <p className="text-sm text-slate-300 mb-3"><strong className="text-slate-400">Skills:</strong> {challenge.requiredSkills?.join(', ')}</p>
              <p className="text-sm text-slate-300 mb-2"><strong className="text-slate-400">Location:</strong> {challenge.district}, {challenge.state}</p>
            </div>
            
            {!alreadyDistributed && (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-6 shadow-xl">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                >
                  {isGenerating ? 'Analyzing Capabilities...' : 'Generate AI Matches'}
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {matches.length > 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold mb-6 text-white">Recommended Universities</h2>
                <div className="space-y-4">
                  {matches.map(match => (
                    <div key={match.id} className="border border-slate-700/50 bg-slate-800/30 rounded-xl p-5 flex gap-4 transition-all hover:bg-slate-800/50">
                      {!alreadyDistributed && (
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            className="w-5 h-5 text-blue-500 rounded border-slate-600 bg-slate-900 focus:ring-blue-500 focus:ring-offset-slate-900"
                            checked={selectedUnis.includes(match.universityId)}
                            onChange={() => toggleSelect(match.universityId)}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg text-white">{match.university.organization.name}</h4>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-full text-sm">
                            {Math.round(match.matchScore * 100)}% Match
                          </span>
                        </div>
                        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {match.matchExplanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {!alreadyDistributed && (
                  <div className="mt-8 pt-6 border-t border-slate-700/50">
                    <button
                      onClick={handleDistribute}
                      disabled={isDistributing || selectedUnis.length === 0}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      Distribute to {selectedUnis.length} Universities
                    </button>
                    <p className="text-center text-sm text-slate-400 mt-3">Maximum 5 allowed.</p>
                  </div>
                )}
              </div>
            ) : (
               <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl shadow-xl p-8 text-center text-slate-400">
                 {alreadyDistributed ? 'No active matches found.' : 'Click "Generate AI Matches" to find the best universities for this problem.'}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
