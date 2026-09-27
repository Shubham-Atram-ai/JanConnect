import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [challenges, setChallenges] = useState<any[]>([]);

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
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Platform Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Problems</h3>
          <p className="text-3xl font-bold mt-2">{challenges.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Matched</h3>
          <p className="text-3xl font-bold mt-2 text-indigo-600">
            {challenges.filter(c => c.status === 'MATCHED' || c.status === 'DISTRIBUTED').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {challenges.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{c.challengeCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.domain || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${c.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${c.status === 'MATCHED' ? 'bg-blue-100 text-blue-800' : ''}
                    ${c.status === 'DISTRIBUTED' ? 'bg-green-100 text-green-800' : ''}
                  `}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/admin/challenges/${c.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    Review & Distribute
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
