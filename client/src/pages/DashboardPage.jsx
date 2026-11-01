import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { graphApi, recommendationsApi, opportunitiesApi, connectionsApi } from '../api';
import UserCard from '../components/UserCard';
import ConnectionButton from '../components/ConnectionButton';
import { LoadingSpinner, EmptyState } from '../components/StateComponents';
import { TypeBadge } from '../components/Badges';
import {
  Users, Network, Lightbulb, Briefcase, GitBranch,
  TrendingUp, ArrowRight, UserCheck
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [pendingRequests, setPendingRequests] = useState({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, recsRes, oppsRes, pendingRes] = await Promise.allSettled([
          graphApi.getNetworkStats(),
          recommendationsApi.getPeopleRecommendations(),
          opportunitiesApi.getAll({ limit: 3 }),
          connectionsApi.getPendingRequests(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
        if (recsRes.status === 'fulfilled') setRecommendations(recsRes.value.data.data.recommendations?.slice(0, 3) || []);
        if (oppsRes.status === 'fulfilled') setOpportunities(oppsRes.value.data.data.opportunities || []);
        if (pendingRes.status === 'fulfilled') setPendingRequests(pendingRes.value.data.data);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">{user?.branch} • Year {user?.year}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="My Connections" value={stats?.myStats?.degree} color="blue" />
        <StatCard icon={Network} label="Reachable Students" value={stats?.myStats?.reachableStudents} color="green" />
        <StatCard icon={TrendingUp} label="Total Students" value={stats?.network?.totalStudents} color="purple" />
        <StatCard icon={GitBranch} label="Communities" value={stats?.network?.communities} color="orange" />
      </div>

      {/* Pending requests */}
      {pendingRequests.received?.length > 0 && (
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              Connection Requests ({pendingRequests.received.length})
            </h2>
            <Link to="/network" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {pendingRequests.received.slice(0, 2).map(conn => (
              <div key={conn._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                  {conn.sender?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{conn.sender?.name}</p>
                  <p className="text-xs text-gray-500">{conn.sender?.branch} • Year {conn.sender?.year}</p>
                </div>
                <ConnectionButton
                  targetUserId={conn.sender?._id}
                  initialStatus="pending_received"
                  connectionId={conn._id}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommendations */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <Lightbulb size={18} className="text-yellow-500" />
              People You May Know
            </h2>
            <Link to="/recommendations" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <EmptyState icon={Users} title="No recommendations yet" description="Connect with more students to get personalized suggestions." />
            ) : (
              recommendations.map(rec => (
                <UserCard
                  key={rec.user._id}
                  user={rec.user}
                  highlight={rec.reason}
                  actions={
                    <ConnectionButton targetUserId={rec.user._id} initialStatus="none" />
                  }
                />
              ))
            )}
          </div>
        </div>

        {/* Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0 flex items-center gap-2">
              <Briefcase size={18} className="text-green-500" />
              Open Opportunities
            </h2>
            <Link to="/opportunities" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {opportunities.length === 0 ? (
              <EmptyState icon={Briefcase} title="No opportunities yet" description="Be the first to post a hackathon or project!" />
            ) : (
              opportunities.map(opp => (
                <Link key={opp._id} to={`/opportunities/${opp._id}`} className="card hover:shadow-md transition-shadow block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{opp.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{opp.creator?.name} • {opp.currentMembers?.length}/{opp.teamSize} members</p>
                    </div>
                    <TypeBadge type={opp.type} />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
                  {opp.requiredSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {opp.requiredSkills.slice(0, 3).map(s => (
                        <span key={s} className="skill-badge">{s}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/discover', label: 'Discover Students', icon: Users },
            { to: '/connection-finder', label: 'Find Connections', icon: GitBranch },
            { to: '/communities', label: 'View Communities', icon: Network },
            { to: `/profile/${user?._id}`, label: 'Edit Profile', icon: TrendingUp },
          ].map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center">
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
