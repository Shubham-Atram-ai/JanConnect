import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

export default function UniversityAssignments() {
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const { data } = await api.get('/university/assignments');
      setAssignments(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">University Assignments</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Problem Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No assignments yet.</td>
              </tr>
            ) : assignments.map(a => (
              <tr key={a.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{a.challenge.challengeCode}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{a.challenge.domain}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${a.status === 'SENT' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${a.status === 'VIEWED' ? 'bg-blue-100 text-blue-800' : ''}
                    ${a.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : ''}
                    ${a.status === 'DECLINED' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {a.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/university/assignments/${a.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                    View Detail
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
