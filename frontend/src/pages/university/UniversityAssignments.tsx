import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { Mic2, LogOut, LayoutDashboard, FileText, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function UniversityAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    loadAssignments();
    loadSolutions();
  }, []);

  const loadAssignments = async () => {
    try {
      const { data } = await api.get('/university/assignments');
      setAssignments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSolutions = async () => {
    try {
      const { data } = await api.get('/university/solutions');
      setSolutions(data);
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

      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-white">University Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Assignments</h2>
            <div className="bg-slate-800/40 rounded-2xl shadow overflow-hidden border border-slate-700/40">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/40">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Problem Code</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {assignments.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No assignments yet.</td>
                      </tr>
                    ) : assignments.map(a => (
                      <tr key={a.id} className="bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{a.challenge.challengeCode}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">{a.challenge.domain}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border
                            ${a.status === 'SENT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                            ${a.status === 'VIEWED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                            ${a.status === 'ACCEPTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                            ${a.status === 'DECLINED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                          `}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link to={`/university/assignments/${a.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                            View Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-white">Solutions</h2>
            <div className="bg-slate-800/40 rounded-2xl shadow overflow-hidden border border-slate-700/40">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/40">
                  <thead className="bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Problem</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {solutions.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400">No solutions yet.</td>
                      </tr>
                    ) : solutions.map(s => (
                      <tr key={s.id} className="bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                          {s.workspace?.assignment?.challenge?.challengeCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                            s.status === 'SUBMITTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link to={`/university/workspaces/${s.workspaceId}/solution`} className="text-blue-400 hover:text-blue-300 font-medium">
                            {s.status === 'SUBMITTED' ? 'View Solution' : 'Edit Draft'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
