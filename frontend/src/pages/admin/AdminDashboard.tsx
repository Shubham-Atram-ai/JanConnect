import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { Mic2, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminDashboard() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data } = await api.get('/admin/challenges');
      setChallenges(data);
    } catch (e) {
      console.error(e);
    }
  };

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
              <Link to="/admin/dashboard" className="text-white flex items-center gap-2 hover:text-blue-400 transition-colors">
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
        <h1 className="text-3xl font-bold mb-6 text-white">Platform Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/40 p-6 rounded-2xl shadow border border-slate-700/40">
            <h3 className="text-slate-400 text-sm font-medium">Total Problems</h3>
            <p className="text-3xl font-bold mt-2 text-white">{challenges.length}</p>
          </div>
          <div className="bg-slate-800/40 p-6 rounded-2xl shadow border border-slate-700/40">
            <h3 className="text-slate-400 text-sm font-medium">Matched</h3>
            <p className="text-3xl font-bold mt-2 text-blue-400">
              {challenges.filter(c => c.status === 'MATCHED' || c.status === 'DISTRIBUTED').length}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/40 rounded-2xl shadow overflow-hidden border border-slate-700/40">
          <table className="min-w-full divide-y divide-slate-700/40">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {challenges.map(c => (
                <tr key={c.id} className="bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{c.challengeCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-300">{c.domain || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${c.status === 'SUBMITTED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                      ${c.status === 'MATCHED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : ''}
                      ${c.status === 'DISTRIBUTED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                    `}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/admin/challenges/${c.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                      Review & Distribute
                    </Link>
                  </td>
                </tr>
              ))}
              {challenges.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No problems found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
