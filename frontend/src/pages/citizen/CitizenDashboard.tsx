
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText, CheckCircle, Clock, Mic2, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import challengeService from '../../services/challengeService';
import notificationService from '../../services/notificationService';
import ChallengeCard from '../../components/ChallengeCard';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: challenges = [], isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: challengeService.list,
    refetchInterval: 30000,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
    refetchInterval: 20000,
  });

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;
  const submitted = challenges.filter((c) => c.status === 'SUBMITTED').length;
  const drafts = challenges.filter((c) => c.status === 'DRAFT').length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Top Nav */}
      <nav className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">JanConnect</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => document.getElementById('notifications-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back 👋
          </h1>
          <p className="text-slate-400 text-sm">
            {user?.email} · {user?.role}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/citizen/problems/new')}
          id="report-problem-btn"
          className="w-full flex items-center gap-4 p-6 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 rounded-2xl shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all group"
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Mic2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-lg">Report a Problem</p>
            <p className="text-blue-200/70 text-sm">Speak or type — AI will help structure it</p>
          </div>
          <Plus className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: 'Total', value: challenges.length, icon: FileText, color: 'text-slate-300' },
            { label: 'Submitted', value: submitted, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Drafts', value: drafts, icon: Clock, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* My Problems */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">My Problems</h2>
            <button
              onClick={() => navigate('/citizen/problems')}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              View all
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-800/30 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <p className="text-white font-medium">No problems reported yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Use the button above to report your first problem
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.slice(0, 5).map((c) => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          )}
        </div>

        {/* Notifications preview */}
        {notifications.filter((n) => n.status === 'UNREAD').length > 0 && (
          <div id="notifications-section" className="space-y-3">
            <h2 className="text-white font-semibold">Recent Notifications</h2>
            <div className="space-y-2">
              {notifications.filter((n) => n.status === 'UNREAD').slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{n.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
