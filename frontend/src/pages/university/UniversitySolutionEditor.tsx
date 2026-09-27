import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, Save, Send } from 'lucide-react';

export default function UniversitySolutionEditor() {
  const { id } = useParams(); // workspaceId
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [workspace, setWorkspace] = useState<any>(null);
  const [solution, setSolution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [proposedApproach, setProposedApproach] = useState('');
  const [methodology, setMethodology] = useState('');
  const [implementationPlan, setImplementationPlan] = useState('');
  const [requiredResources, setRequiredResources] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [limitations, setLimitations] = useState('');
  const [futureWork, setFutureWork] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const wsRes = await api.get(`/university/workspaces/${id}`);
      setWorkspace(wsRes.data);
      const assignmentId = wsRes.data.assignmentId;
      
      try {
        const solRes = await api.get(`/university/assignments/${assignmentId}/solution`);
        setSolution(solRes.data);
        if (solRes.data) {
          setTitle(solRes.data.title || '');
          setSummary(solRes.data.summary || '');
          setProblemStatement(solRes.data.problemStatement || '');
          setProposedApproach(solRes.data.proposedApproach || '');
          setMethodology(solRes.data.methodology || '');
          setImplementationPlan(solRes.data.implementationPlan || '');
          setRequiredResources(solRes.data.requiredResources || '');
          setExpectedOutcome(solRes.data.expectedOutcome || '');
          setExpectedImpact(solRes.data.expectedImpact || '');
          setLimitations(solRes.data.limitations || '');
          setFutureWork(solRes.data.futureWork || '');
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const assignmentId = workspace.assignmentId;
      await api.post(`/university/assignments/${assignmentId}/solution`, {
        title, summary, problemStatement, proposedApproach, methodology,
        implementationPlan, requiredResources, expectedOutcome, expectedImpact,
        limitations, futureWork
      });
      alert('Draft saved successfully');
      loadData();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error saving draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!solution || !solution.id) {
      alert('Please save the draft first');
      return;
    }
    if (!confirm('Submit Solution?\n\nOnce submitted, the solution will become visible to authorized stakeholders.')) {
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/university/solutions/${solution.id}/submit`);
      alert('Solution submitted successfully!');
      navigate(`/university/workspaces/${id}`);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Error submitting solution');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading...</div>;
  if (!workspace) return <div className="p-12 text-center text-slate-500">Workspace not found</div>;

  const isSubmitted = solution?.status === 'SUBMITTED';
  const isFacultyLead = ['FACULTY_LEAD', 'UNIVERSITY_ADMIN'].includes(user?.role || '');

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to={`/university/workspaces/${id}`} className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{isSubmitted ? 'View Submitted Solution' : 'Solution Editor'}</h1>
          <p className="text-slate-600 mt-1">Problem: {workspace.assignment?.challenge?.summary || workspace.assignment?.challenge?.normalizedText}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveDraft} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Solution Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Executive Summary</label>
                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={3} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Problem Understanding</label>
                <textarea value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={3} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Proposed Solution</label>
                <textarea value={proposedApproach} onChange={(e) => setProposedApproach(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={4} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Methodology</label>
                <textarea value={methodology} onChange={(e) => setMethodology(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={4} required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Implementation Plan</label>
                <textarea value={implementationPlan} onChange={(e) => setImplementationPlan(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={4} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Required Resources</label>
                  <textarea value={requiredResources} onChange={(e) => setRequiredResources(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Outcomes</label>
                  <textarea value={expectedOutcome} onChange={(e) => setExpectedOutcome(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={3} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expected Impact</label>
                  <textarea value={expectedImpact} onChange={(e) => setExpectedImpact(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Limitations</label>
                  <textarea value={limitations} onChange={(e) => setLimitations(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Future Work</label>
                  <textarea value={futureWork} onChange={(e) => setFutureWork(e.target.value)} disabled={isSubmitted} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2" rows={2} />
                </div>
              </div>

              {!isSubmitted && (
                <div className="flex gap-4 pt-4 border-t border-slate-100">
                  <button type="submit" disabled={saving} className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2 rounded-xl flex items-center gap-2">
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  {solution?.id && isFacultyLead && (
                    <button type="button" onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl flex items-center gap-2">
                      <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Solution'}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-6 self-start">
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Research Findings</h3>
              {workspace.findings?.length === 0 ? <p className="text-slate-500 text-sm">No findings</p> : (
                <ul className="space-y-2">
                  {workspace.findings?.map((f: any) => (
                    <li key={f.id} className="text-sm bg-white p-3 rounded-lg border border-slate-200">
                      <strong>{f.title}</strong><br/><span className="text-slate-600">{f.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-slate-900 mb-3">Evidence</h3>
              {workspace.evidence?.length === 0 ? <p className="text-slate-500 text-sm">No evidence</p> : (
                <ul className="space-y-2">
                  {workspace.evidence?.map((e: any) => (
                    <li key={e.id} className="text-sm bg-white p-3 rounded-lg border border-slate-200">
                      {e.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-3">References</h3>
              {workspace.references?.length === 0 ? <p className="text-slate-500 text-sm">No references</p> : (
                <ul className="space-y-2">
                  {workspace.references?.map((r: any) => (
                    <li key={r.id} className="text-sm bg-white p-3 rounded-lg border border-slate-200">
                      {r.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
