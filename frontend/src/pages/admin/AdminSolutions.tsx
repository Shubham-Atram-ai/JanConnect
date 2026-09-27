import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic2, LogOut, LayoutDashboard, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function AdminSolutions() {
  const [solutions, setSolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    try {
      const { data } = await api.get('/admin/solutions');
      setSolutions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8 text-white">Loading solutions...</div>;

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
              <Link to="/admin/solutions" className="text-white flex items-center gap-2 hover:text-blue-400 transition-colors">
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

      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/admin/dashboard" className="p-2 bg-slate-800/40 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl border border-slate-700/40 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Platform Admin - Submitted Solutions</h1>
        </div>
        
        <div className="bg-slate-800/40 rounded-2xl shadow overflow-hidden border border-slate-700/40">
          <table className="min-w-full divide-y divide-slate-700/40">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Problem</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">University</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Submitted At</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/40">
              {solutions.map(s => (
                <tr key={s.id} className="bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-sm text-white">
                    {s.workspace?.assignment?.challenge?.challengeCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {s.workspace?.assignment?.university?.organization?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {new Date(s.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/admin/solutions/${s.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                      View Solution
                    </Link>
                  </td>
                </tr>
              ))}
              {solutions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No solutions submitted yet.
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
