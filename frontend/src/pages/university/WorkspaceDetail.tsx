import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  FlaskConical,
  Users,
  CheckSquare,
  FileText,
  FileCode,
  Bookmark,
  Lightbulb,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [ws, setWs] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'notes' | 'evidence' | 'references' | 'findings' | 'discussion'>('overview');
  const [loading, setLoading] = useState(true);

  // Form states
  const [eligibleMembers, setEligibleMembers] = useState<any[]>([]);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');
  const [selectedRoleToAdd, setSelectedRoleToAdd] = useState('STUDENT');

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState('OBSERVATION');

  const [newEvidenceTitle, setNewEvidenceTitle] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');
  const [newEvidenceStorageKey, setNewEvidenceStorageKey] = useState('');

  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefUrl, setNewRefUrl] = useState('');
  const [newRefCitation, setNewRefCitation] = useState('');

  const [newFindingTitle, setNewFindingTitle] = useState('');
  const [newFindingDesc, setNewFindingDesc] = useState('');

  const [newDiscussionContent, setNewDiscussionContent] = useState('');

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  const loadWorkspace = async () => {
    try {
      const { data } = await api.get(`/university/workspaces/${id}`);
      setWs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadEligibleMembers = async () => {
    try {
      const { data } = await api.get(`/university/workspaces/${id}/eligible-members`);
      setEligibleMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToAdd) return;
    try {
      await api.post(`/university/workspaces/${id}/team/members`, {
        userId: selectedUserToAdd,
        role: selectedRoleToAdd,
      });
      alert('Member added successfully');
      setSelectedUserToAdd('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm('Remove member from team?')) return;
    try {
      await api.delete(`/university/workspaces/${id}/team/members/${targetUserId}`);
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error removing member');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      await api.post(`/university/workspaces/${id}/tasks`, {
        title: newTaskTitle,
        description: newTaskDesc,
        assignedTo: newTaskAssignedTo || undefined,
        priority: newTaskPriority,
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/university/workspaces/${id}/tasks/${taskId}`, { status });
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error updating task');
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteContent) return;
    try {
      await api.post(`/university/workspaces/${id}/notes`, {
        title: newNoteTitle,
        content: newNoteContent,
        noteType: newNoteType,
      });
      setNewNoteTitle('');
      setNewNoteContent('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error creating note');
    }
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceTitle || !newEvidenceStorageKey) return;
    try {
      await api.post(`/university/workspaces/${id}/evidence`, {
        title: newEvidenceTitle,
        description: newEvidenceDesc,
        storageKey: newEvidenceStorageKey,
        mimeType: 'application/pdf',
        fileSize: 1024 * 1024,
      });
      setNewEvidenceTitle('');
      setNewEvidenceDesc('');
      setNewEvidenceStorageKey('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error adding evidence');
    }
  };

  const handleCreateReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefTitle) return;
    try {
      await api.post(`/university/workspaces/${id}/references`, {
        title: newRefTitle,
        url: newRefUrl,
        citation: newRefCitation,
      });
      setNewRefTitle('');
      setNewRefUrl('');
      setNewRefCitation('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error adding reference');
    }
  };

  const handleCreateFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingTitle || !newFindingDesc) return;
    try {
      await api.post(`/university/workspaces/${id}/findings`, {
        title: newFindingTitle,
        description: newFindingDesc,
        status: 'CONFIRMED',
      });
      setNewFindingTitle('');
      setNewFindingDesc('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error creating finding');
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionContent) return;
    try {
      await api.post(`/university/workspaces/${id}/discussions`, {
        content: newDiscussionContent,
      });
      setNewDiscussionContent('');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error creating discussion');
    }
  };

  const handleReadyForSolution = async () => {
    if (!confirm('Mark workspace as READY FOR SOLUTION? This signals research completion.')) return;
    try {
      await api.post(`/university/workspaces/${id}/ready-for-solution`);
      alert('Workspace marked as READY FOR SOLUTION!');
      loadWorkspace();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error updating workspace status');
    }
  };

  if (loading || !ws) {
    return <div className="max-w-6xl mx-auto py-12 text-center text-slate-500">Loading research workspace...</div>;
  }

  const ch = ws.assignment?.challenge || {};
  const completedTasks = ws.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
  const totalTasks = ws.tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isReady = ws.status === 'READY_FOR_SOLUTION';
  const isFacultyOrAdmin = ['FACULTY', 'UNIVERSITY_ADMIN', 'PLATFORM_ADMIN'].includes(user?.role || '');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Top Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/university/workspaces"
          className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspaces
        </Link>
        {isFacultyOrAdmin && !isReady && (
          <button
            onClick={handleReadyForSolution}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Ready for Solution
          </button>
        )}
        {isReady && (
          <Link
            to={`/university/workspaces/${id}/solution`}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-sm transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            {ws.solution ? (ws.solution.status === 'SUBMITTED' ? 'View Submitted Solution' : 'Continue Solution Draft') : 'Create Solution'}
          </Link>
        )}
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {ch.challengeCode || 'CHALLENGE'}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  isReady ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {ws.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{ws.title}</h1>
            <p className="text-slate-600 text-sm mt-1">{ws.description}</p>
          </div>

          <div className="w-full md:w-64 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Research Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${isReady ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 pb-2 mb-6 text-sm font-medium text-slate-600">
          {[
            { id: 'overview', label: 'Overview', icon: FlaskConical },
            { id: 'team', label: `Team (${ws.team?.members?.length || 0})`, icon: Users },
            { id: 'tasks', label: `Tasks (${ws.tasks?.length || 0})`, icon: CheckSquare },
            { id: 'notes', label: `Notes (${ws.notes?.length || 0})`, icon: FileText },
            { id: 'evidence', label: `Evidence (${ws.evidence?.length || 0})`, icon: FileCode },
            { id: 'references', label: `References (${ws.references?.length || 0})`, icon: Bookmark },
            { id: 'findings', label: `Findings (${ws.findings?.length || 0})`, icon: Lightbulb },
            { id: 'discussion', label: `Discussion (${ws.discussions?.length || 0})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'team') loadEligibleMembers();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
              <h3 className="font-semibold text-indigo-950 text-base mb-2">Original Problem Context</h3>
              <p className="text-slate-700 text-sm whitespace-pre-wrap">{ch.summary || ch.normalizedText}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-indigo-100 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">Domain:</span> {ch.domain || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Location:</span> {ch.district}, {ch.state}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Required Skills:</span>{' '}
                  {ch.requiredSkills?.join(', ') || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Matched University:</span>{' '}
                  {ws.assignment?.university?.organization?.name || 'Your University'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Research Team Lead
                </h4>
                <p className="text-slate-700 text-sm font-medium">
                  {ws.team?.members?.find((m: any) => m.role === 'FACULTY_LEAD')?.user?.email || 'Dr. Sharma'}
                </p>
                <p className="text-slate-500 text-xs mt-1">Faculty Lead & Coordinator</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  Confirmed Findings
                </h4>
                <p className="text-2xl font-bold text-slate-900">
                  {ws.findings?.filter((f: any) => f.status === 'CONFIRMED').length || 0}
                </p>
                <p className="text-slate-500 text-xs mt-1">Validated research insights</p>
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-900 text-sm mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  University Isolation
                </h4>
                <p className="text-slate-700 text-xs leading-relaxed">
                  Workspace is strictly isolated to your university. Cross-university access is prohibited.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="font-semibold text-slate-900 text-base mb-4">Team Roster</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {ws.team?.members?.map((m: any) => (
                  <div
                    key={m.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{m.user?.email}</p>
                      <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {m.role}
                      </span>
                    </div>
                    {isFacultyOrAdmin && m.role !== 'FACULTY_LEAD' && (
                      <button
                        onClick={() => handleRemoveMember(m.userId)}
                        className="text-red-500 hover:text-red-700 p-2 text-xs font-medium flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isFacultyOrAdmin && (
                <form onSubmit={handleAddMember} className="border-t border-slate-200 pt-4 flex flex-col md:flex-row gap-3">
                  <select
                    value={selectedUserToAdd}
                    onChange={(e) => setSelectedUserToAdd(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-none"
                    required
                  >
                    <option value="">Select Eligible University Member...</option>
                    {eligibleMembers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.role})
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedRoleToAdd}
                    onChange={(e) => setSelectedRoleToAdd(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-900 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="FACULTY">FACULTY</option>
                    <option value="RESEARCHER">RESEARCHER</option>
                    <option value="PHD_RESEARCHER">PHD_RESEARCHER</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateTask} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="New Task Title (e.g., Analyze soil drainage)"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                required
              />
              <select
                value={newTaskAssignedTo}
                onChange={(e) => setNewTaskAssignedTo(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
              >
                <option value="">Assign To (Optional)</option>
                {ws.team?.members?.map((m: any) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user?.email || m.userId}
                  </option>
                ))}
              </select>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED'].map((status) => {
                const tasksInCol = ws.tasks?.filter((t: any) => t.status === status) || [];
                return (
                  <div key={status} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-semibold text-xs text-slate-600 uppercase tracking-wider mb-3">
                      {status.replace('_', ' ')} ({tasksInCol.length})
                    </h4>
                    <div className="space-y-3">
                      {tasksInCol.map((task: any) => (
                        <div key={task.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm text-sm">
                          <p className="font-semibold text-slate-900">{task.title}</p>
                          {task.description && <p className="text-slate-500 text-xs mt-1">{task.description}</p>}
                          <div className="mt-3 flex justify-between items-center text-xs">
                            <span className="text-slate-400">{task.priority}</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                              className="bg-slate-100 text-slate-700 rounded px-2 py-0.5 text-xs font-medium border-0"
                            >
                              <option value="TODO">TODO</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="BLOCKED">BLOCKED</option>
                              <option value="COMPLETED">COMPLETED</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateNote} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Note Title (e.g. Rainfall Pattern Observation)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                  required
                />
                <select
                  value={newNoteType}
                  onChange={(e) => setNewNoteType(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="OBSERVATION">Observation</option>
                  <option value="LITERATURE_REVIEW">Literature Review</option>
                  <option value="HYPOTHESIS">Hypothesis</option>
                  <option value="METHODOLOGY">Methodology</option>
                  <option value="EXPERIMENT">Experiment</option>
                  <option value="ANALYSIS">Analysis</option>
                </select>
              </div>
              <textarea
                placeholder="Write research notes, observations, hypotheses..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                rows={3}
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Research Note
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ws.notes?.map((n: any) => (
                <div key={n.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {n.noteType}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">{n.title}</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">{n.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateEvidence} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Evidence Title (e.g. Soil Drainage Dataset)"
                value={newEvidenceTitle}
                onChange={(e) => setNewEvidenceTitle(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                required
              />
              <input
                type="text"
                placeholder="Storage Key / Ref (e.g. dataset-2026.csv)"
                value={newEvidenceStorageKey}
                onChange={(e) => setNewEvidenceStorageKey(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Upload Evidence
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ws.evidence?.map((ev: any) => (
                <div key={ev.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <FileCode className="w-6 h-6 text-indigo-600 mb-2" />
                  <h4 className="font-semibold text-slate-900 text-sm">{ev.title}</h4>
                  <p className="text-slate-500 text-xs mt-1">Ref: {ev.storageKey}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References Tab */}
        {activeTab === 'references' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateReference} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Paper / Reference Title"
                value={newRefTitle}
                onChange={(e) => setNewRefTitle(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                required
              />
              <input
                type="url"
                placeholder="URL (optional)"
                value={newRefUrl}
                onChange={(e) => setNewRefUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Reference
              </button>
            </form>

            <div className="space-y-3">
              {ws.references?.map((rf: any) => (
                <div key={rf.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{rf.title}</h4>
                    {rf.url && (
                      <a href={rf.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 mt-1">
                        {rf.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateFinding} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <input
                type="text"
                placeholder="Finding Title (e.g. Soil permeability is the primary bottleneck)"
                value={newFindingTitle}
                onChange={(e) => setNewFindingTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                required
              />
              <textarea
                placeholder="Detailed finding summary..."
                value={newFindingDesc}
                onChange={(e) => setNewFindingDesc(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                rows={2}
                required
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Record Confirmed Finding
              </button>
            </form>

            <div className="space-y-4">
              {ws.findings?.map((fd: any) => (
                <div key={fd.id} className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/20">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {fd.status}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(fd.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">{fd.title}</h4>
                  <p className="text-slate-700 text-sm">{fd.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateDiscussion} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex gap-3">
              <input
                type="text"
                placeholder="Start discussion thread..."
                value={newDiscussionContent}
                onChange={(e) => setNewDiscussionContent(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Post Message
              </button>
            </form>

            <div className="space-y-3">
              {ws.discussions?.map((dc: any) => (
                <div key={dc.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-800 text-sm">{dc.content}</p>
                  <span className="text-xs text-slate-400 mt-2 block">{new Date(dc.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
