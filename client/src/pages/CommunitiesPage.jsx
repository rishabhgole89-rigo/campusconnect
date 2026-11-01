import { useEffect, useState } from 'react';
import { graphApi } from '../api';
import { LoadingSpinner, EmptyState } from '../components/StateComponents';
import { Link } from 'react-router-dom';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';

function CommunityCard({ community, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const colors = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-green-500 to-green-700',
    'from-orange-500 to-orange-700',
    'from-red-500 to-red-700',
    'from-indigo-500 to-indigo-700',
  ];
  const gradient = colors[index % colors.length];

  return (
    <div className="card overflow-hidden">
      <div
        className={`bg-gradient-to-r ${gradient} text-white p-4 -m-6 mb-4 cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Community {community.communityId}</h3>
            <p className="text-white/80 text-sm">{community.size} student{community.size !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              {community.topSkills.slice(0, 2).map(s => (
                <span key={s} className="text-xs bg-white/20 px-2 py-0.5 rounded-full mr-1">{s}</span>
              ))}
            </div>
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Top skills & interests */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Skills</p>
          <div className="flex flex-wrap gap-1">
            {community.topSkills.map(s => (
              <span key={s} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Interests</p>
          <div className="flex flex-wrap gap-1">
            {community.topInterests.map(i => (
              <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{i}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Members list */}
      {expanded && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Members</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {community.members.map(member => (
              <Link
                key={member.userId}
                to={`/profile/${member.userId}`}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors min-w-0"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {member.name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                  <p className="text-xs text-gray-400 truncate">{member.branch?.split(' ')[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunitiesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await graphApi.getCommunities();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load communities');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-purple-600" size={24} />
          Network Communities
        </h1>
        <p className="text-gray-500 mt-1">
          Communities detected using{' '}
          <span className="font-mono text-purple-600 text-sm">DFS Connected Components</span>
        </p>
      </div>

      {/* Algorithm info */}
      <div className="card bg-purple-50 border border-purple-100 mb-6">
        <p className="text-sm text-purple-800">
          <strong>Algorithm:</strong> Iterative DFS runs from each unvisited vertex, collecting all reachable
          nodes into a component. Students in the same community can reach each other through chains of connections.{' '}
          <span className="font-mono">Time: O(V+E)</span>
        </p>
      </div>

      {/* Summary stats */}
      {data && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{data.totalStudents}</div>
            <div className="text-sm text-gray-500">Total Students</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{data.totalConnections}</div>
            <div className="text-sm text-gray-500">Connections</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">{data.totalCommunities}</div>
            <div className="text-sm text-gray-500">Communities</div>
          </div>
        </div>
      )}

      {/* Communities */}
      {error ? (
        <div className="card text-center text-red-600">{error}</div>
      ) : data?.communities?.length === 0 ? (
        <EmptyState icon={Users} title="No communities yet" description="Connect more students to discover communities!" />
      ) : (
        <div className="space-y-4">
          {data.communities.map((community, i) => (
            <CommunityCard key={community.communityId} community={community} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
