import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mic2, LogOut, LayoutDashboard, FileText, Briefcase, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [assignment, setAssignment] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const { data } = await api.get(`/university/assignments/${id}`);
      setAssignment(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAccept = async () => {
    try {
      await api.post(`/university/assignments/${id}/accept`);
      alert('Accepted successfully');
      loadAssignment();
    } catch (e) {
      console.error(e);
      alert('Error accepting');
    }
  };

  const handleDecline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReason) return;
    try {
      await api.post(`/university/assignments/${id}/decline`, { reason: declineReason });
      alert('Declined successfully');
      loadAssignment();
    } catch (e) {
      console.error(e);
      alert('Error declining');
    }
  };

  if (!assignment) return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white">Loading...</div>;

  const ch = assignment.challenge;
  const isResponded = assignment.status === 'ACCEPTED' || assignment.status === 'DECLINED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Top Nav */}
      <nav className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">JanConnect</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link to="/university/assignments" className="text-white flex items-center gap-2 hover:text-blue-400 transition-colors">
                <FileText className="w-4 h-4" /> Assignments
              </Link>
              <Link to="/university/workspaces" className="text-slate-400 flex items-center gap-2 hover:text-white transition-colors">
                <Briefcase className="w-4 h-4" /> Workspaces
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
          <Link to="/university/assignments" className="p-2 bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl border border-slate-700/40 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Assignment Detail</h1>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/40 p-8 rounded-2xl shadow-xl">
          <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{ch.title}</h1>
              <p className="text-slate-400 mt-1">{ch.challengeCode} • {ch.district}, {ch.state}</p>
            </div>
            <span className={`px-4 py-2 rounded-full font-bold text-sm border
                ${assignment.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                ${assignment.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                ${!isResponded ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
            `}>
              {assignment.status}
            </span>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-lg mb-3 text-white">Problem Summary</h3>
            <p className="text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 leading-relaxed">{ch.summary}</p>
          </div>

          {assignment.status === 'ACCEPTED' && (
            <div className="mb-8 p-6 bg-emerald-900/20 rounded-xl border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-emerald-400 text-lg">Research Workspace</h3>
                <p className="text-sm text-emerald-300 mt-1">Collaborative space for faculty, researchers, PhDs, and students.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const { data } = await api.post(`/university/assignments/${id}/workspace`);
                    window.location.href = `/university/workspaces/${data.id}`;
                  } catch (e: any) {
                    alert(e.response?.data?.message || 'Error launching workspace');
                  }
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all whitespace-nowrap"
              >
                Open Research Workspace →
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
              <h4 className="font-bold text-sm text-slate-400 mb-1">Domain</h4>
              <p className="text-white font-medium">{ch.domain}</p>
            </div>
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
              <h4 className="font-bold text-sm text-slate-400 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {ch.requiredSkills?.map((skill: string) => (
                  <span key={skill} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8 p-5 bg-blue-900/20 rounded-xl border border-blue-500/20">
            <h3 className="font-bold text-blue-400 mb-2 text-lg">Why were you matched?</h3>
            <p className="text-sm text-blue-200/80 whitespace-pre-wrap leading-relaxed">{assignment.matchExplanation}</p>
          </div>

          {!isResponded && !showDeclineForm && (
            <div className="flex gap-4 border-t border-slate-700/50 pt-6">
              <button
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                Accept Assignment
              </button>
              <button
                onClick={() => setShowDeclineForm(true)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-red-400 border border-slate-700 hover:border-red-500/50 font-bold py-3.5 rounded-xl transition-all"
              >
                Decline
              </button>
            </div>
          )}

          {showDeclineForm && !isResponded && (
            <form onSubmit={handleDecline} className="border-t border-slate-700/50 pt-6">
              <h3 className="font-bold mb-3 text-red-400">Provide Decline Reason</h3>
              <textarea
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl mb-4 text-white focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                rows={3}
                placeholder="E.g., Lack of current capacity, missing specialized equipment..."
                required
              />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-600/20 transition-all">
                  Confirm Decline
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeclineForm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-xl border border-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
