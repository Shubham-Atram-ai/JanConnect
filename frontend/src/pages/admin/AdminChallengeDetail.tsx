import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useParams, useNavigate } from 'react-router-dom';

export default function AdminChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedUnis, setSelectedUnis] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);

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

  if (!challenge) return <div>Loading...</div>;

  const alreadyDistributed = challenge.status === 'DISTRIBUTED';

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Problem Distribution: {challenge.challengeCode}</h1>
        <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-semibold">{challenge.status}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-2">AI Extracted Requirements</h3>
            <p className="text-sm text-gray-600 mb-2"><strong>Domain:</strong> {challenge.domain}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Skills:</strong> {challenge.requiredSkills?.join(', ')}</p>
            <p className="text-sm text-gray-600 mb-2"><strong>Location:</strong> {challenge.district}, {challenge.state}</p>
          </div>
          
          {!alreadyDistributed && (
            <div className="bg-white p-6 rounded-lg shadow">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-indigo-600 text-white font-medium py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? 'Analyzing Capabilities...' : 'Generate AI Matches'}
              </button>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {matches.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recommended Universities</h2>
              <div className="space-y-4">
                {matches.map(match => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4 flex gap-4">
                    {!alreadyDistributed && (
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-indigo-600 rounded"
                          checked={selectedUnis.includes(match.universityId)}
                          onChange={() => toggleSelect(match.universityId)}
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-lg">{match.university.organization.name}</h4>
                        <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
                          {match.matchScore}% Match
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                        {match.matchExplanation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!alreadyDistributed && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleDistribute}
                    disabled={isDistributing || selectedUnis.length === 0}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Distribute to {selectedUnis.length} Universities
                  </button>
                  <p className="text-center text-sm text-gray-500 mt-2">Maximum 5 allowed.</p>
                </div>
              )}
            </div>
          ) : (
             <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
               {alreadyDistributed ? 'No active matches found.' : 'Click "Generate AI Matches" to find the best universities for this problem.'}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
