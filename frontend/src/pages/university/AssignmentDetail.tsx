import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams } from 'react-router-dom';

export default function AssignmentDetail() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState<any>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

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

  if (!assignment) return <div>Loading...</div>;

  const ch = assignment.challenge;
  const isResponded = assignment.status === 'ACCEPTED' || assignment.status === 'DECLINED';

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-start mb-6 border-b pb-6">
          <div>
            <h1 className="text-2xl font-bold">{ch.title}</h1>
            <p className="text-gray-500">{ch.challengeCode} • {ch.district}, {ch.state}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-bold text-sm
              ${assignment.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
              ${assignment.status === 'DECLINED' ? 'bg-red-100 text-red-800' : ''}
              ${!isResponded ? 'bg-yellow-100 text-yellow-800' : ''}
          `}>
            {assignment.status}
          </span>
        </div>

        <div className="mb-8">
          <h3 className="font-bold text-lg mb-2">Problem Summary</h3>
          <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded">{ch.summary}</p>
        </div>

        {assignment.status === 'ACCEPTED' && (
          <div className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-emerald-900 text-lg">Research Workspace</h3>
              <p className="text-sm text-emerald-700 mt-1">Collaborative space for faculty, researchers, PhDs, and students.</p>
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors whitespace-nowrap"
            >
              Open Research Workspace →
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <h4 className="font-bold text-sm text-gray-500">Domain</h4>
            <p>{ch.domain}</p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-500">Required Skills</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {ch.requiredSkills?.map((skill: string) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 rounded text-xs">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2">Why were you matched?</h3>
          <p className="text-sm text-indigo-800 whitespace-pre-wrap">{assignment.matchExplanation}</p>
        </div>

        {!isResponded && !showDeclineForm && (
          <div className="flex gap-4 border-t pt-6">
            <button
              onClick={handleAccept}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
            >
              Accept Assignment
            </button>
            <button
              onClick={() => setShowDeclineForm(true)}
              className="flex-1 bg-white hover:bg-gray-50 text-red-600 border border-red-200 font-bold py-3 rounded-lg"
            >
              Decline
            </button>
          </div>
        )}

        {showDeclineForm && !isResponded && (
          <form onSubmit={handleDecline} className="border-t pt-6">
            <h3 className="font-bold mb-2 text-red-600">Provide Decline Reason</h3>
            <textarea
              value={declineReason}
              onChange={e => setDeclineReason(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
              rows={3}
              placeholder="E.g., Lack of current capacity, missing specialized equipment..."
              required
            />
            <div className="flex gap-4">
              <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">
                Confirm Decline
              </button>
              <button
                type="button"
                onClick={() => setShowDeclineForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
