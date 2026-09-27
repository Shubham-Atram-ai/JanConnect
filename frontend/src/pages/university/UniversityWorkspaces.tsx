import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { FlaskConical, Users, Clock, ArrowRight } from 'lucide-react';

export default function UniversityWorkspaces() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const { data } = await api.get('/university/workspaces');
      setWorkspaces(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-slate-500">Loading workspaces...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-indigo-600" />
            Research Workspaces
          </h1>
          <p className="text-slate-600 mt-1">Collaborative spaces for accepted societal innovation challenges</p>
        </div>
      </div>

      {workspaces.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <FlaskConical className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800">No active research workspaces</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Once a university assignment is accepted, a collaborative research workspace can be launched from the assignment detail page.
          </p>
          <Link
            to="/university/assignments"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors"
          >
            View Assignments
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workspaces.map((ws) => {
            const completedTasks = ws.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
            const totalTasks = ws.tasks?.length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const isReady = ws.status === 'READY_FOR_SOLUTION';

            return (
              <div
                key={ws.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {ws.assignment?.challenge?.challengeCode || 'CHALLENGE'}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        isReady
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {ws.status}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2">{ws.title}</h2>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{ws.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                      <span>Research Progress</span>
                      <span>{progress}% ({completedTasks}/{totalTasks} tasks)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isReady ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" />
                      {ws.team?.members?.length || 1} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(ws.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/university/workspaces/${ws.id}`}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    Open Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
