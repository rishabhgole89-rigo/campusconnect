import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { graphApi, usersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/StateComponents';
import { Link } from 'react-router-dom';
import { GitBranch, ArrowRight, Search, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function PathNode({ user, isSource, isTarget }) {
  return (
    <div className={`flex flex-col items-center text-center ${isSource ? 'text-blue-700' : isTarget ? 'text-green-700' : 'text-gray-700'}`}>
      <Link to={`/profile/${user.id}`}>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md mb-2 ${
          isSource ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' :
          isTarget ? 'bg-green-100 text-green-700 ring-2 ring-green-400' :
          'bg-gray-100 text-gray-700'
        }`}>
          {user.name?.charAt(0)}
        </div>
      </Link>
      <p className="text-xs font-semibold max-w-[80px] truncate">{user.name}</p>
      <p className="text-xs text-gray-400">{user.branch?.split(' ')[0]}</p>
    </div>
  );
}

export default function ConnectionFinderPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [allUsers, setAllUsers] = useState([]);
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await usersApi.getUsers({ limit: 100 });
        const allRes = [
          { _id: user._id, name: user.name, branch: user.branch },
          ...(res.data.data.users || [])
        ];
        setAllUsers(allRes);
      } finally {
        setUsersLoading(false);
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam) setSource(fromParam);
    if (toParam) setTarget(toParam);
  }, [searchParams]);

  const findPath = async () => {
    if (!source || !target) {
      toast.error('Please select both students');
      return;
    }
    if (source === target) {
      toast.error('Please select two different students');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await graphApi.getShortestPath(source, target);
      setResult(res.data.data);
    } catch (err) {
      if (err.response?.data?.error?.code === 'NO_PATH') {
        setResult({ noPath: true });
      } else {
        toast.error(err.response?.data?.message || 'Failed to find path');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GitBranch className="text-blue-600" size={24} />
          Connection Finder
        </h1>
        <p className="text-gray-500 mt-1">
          Find the shortest connection path between two students using{' '}
          <span className="font-mono text-blue-600 text-sm">BFS (Breadth-First Search)</span>
        </p>
      </div>

      {/* BFS info */}
      <div className="card bg-blue-50 border border-blue-100 mb-6">
        <div className="text-sm text-blue-800">
          <strong>How it works:</strong> BFS explores all 1-hop connections first, then 2-hop, 3-hop, etc.,
          guaranteeing the shortest path is found. Time: O(V+E).
        </div>
      </div>

      {/* Selectors */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From (Student A)</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="input-field"
              disabled={usersLoading}
            >
              <option value="">Select student...</option>
              {allUsers.map(u => (
                <option key={u._id} value={u._id}>
                  {u.name}{u._id === user._id ? ' (You)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To (Student B)</label>
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="input-field"
              disabled={usersLoading}
            >
              <option value="">Select student...</option>
              {allUsers.filter(u => u._id !== source).map(u => (
                <option key={u._id} value={u._id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={findPath}
          disabled={loading || !source || !target}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><LoadingSpinner size="sm" center={false} /> Finding shortest path...</>
          ) : (
            <><Search size={16} /> Find Shortest Path</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="card animate-slide-up">
          {result.noPath ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <GitBranch size={24} className="text-red-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">No Connection Found</h3>
              <p className="text-gray-500 text-sm">These two students are in different network components — no chain of connections links them.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-gray-900">
                    {result.distance === 0 ? 'Same Person!' :
                     result.distance === 1 ? 'Directly Connected' :
                     `${result.distance} degrees of separation`}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Path length: {result.path?.length} nodes • Algorithm: {result.algorithm}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  result.distance <= 2 ? 'bg-green-100 text-green-700' :
                  result.distance <= 4 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {result.distance} hop{result.distance !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Visual path */}
              <div className="overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max mx-auto justify-center py-4">
                  {result.path?.map((node, idx) => (
                    <div key={node.id} className="flex items-center gap-2">
                      <PathNode
                        user={node}
                        isSource={idx === 0}
                        isTarget={idx === result.path.length - 1}
                      />
                      {idx < result.path.length - 1 && (
                        <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Textual path */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 font-mono text-center">
                  {result.path?.map(n => n.name).join(' → ')}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick suggestions */}
      {!result && !loading && (
        <div className="card bg-gray-50">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Try these examples:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Rahul Sharma → Neha Singh (3+ hops through the network)</li>
            <li>• Rahul Sharma → Ritika Bose (path via Priya or Akash)</li>
            <li>• Rahul Sharma → Dhruv Malhotra (disconnected — no path!)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
