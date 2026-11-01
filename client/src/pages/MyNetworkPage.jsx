import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { connectionsApi } from '../api';
import { LoadingSpinner, EmptyState } from '../components/StateComponents';
import ConnectionButton from '../components/ConnectionButton';
import { Users, UserCheck, Clock, ArrowRight } from 'lucide-react';

function UserRow({ user, connectionId, status, onUpdate }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <Link to={`/profile/${user._id}`} className="flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
          {user.name?.charAt(0)}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user._id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate">
          {user.name}
        </Link>
        <p className="text-sm text-gray-500 truncate">{user.branch} • Year {user.year}</p>
        {user.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {user.skills.slice(0, 3).map(s => (
              <span key={s} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-shrink-0">
        <ConnectionButton
          targetUserId={user._id}
          initialStatus={status}
          connectionId={connectionId}
          onStatusChange={onUpdate}
        />
      </div>
    </div>
  );
}

export default function MyNetworkPage() {
  const [tab, setTab] = useState('connections');
  const [connections, setConnections] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [connsRes, pendingRes] = await Promise.all([
          connectionsApi.getMyConnections(),
          connectionsApi.getPendingRequests(),
        ]);
        setConnections(connsRes.data.data.connections || []);
        setPendingReceived(pendingRes.data.data.received || []);
        setPendingSent(pendingRes.data.data.sent || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleConnectionUpdate = (connId, newStatus) => {
    if (newStatus === 'none') {
      setConnections(prev => prev.filter(c => c.connectionId !== connId));
      setPendingReceived(prev => prev.filter(c => c._id !== connId));
    } else if (newStatus === 'accepted') {
      const req = pendingReceived.find(c => c._id === connId);
      if (req) {
        setPendingReceived(prev => prev.filter(c => c._id !== connId));
      }
    }
  };

  const tabs = [
    { key: 'connections', label: 'My Connections', count: connections.length, icon: UserCheck },
    { key: 'received', label: 'Requests Received', count: pendingReceived.length, icon: Users },
    { key: 'sent', label: 'Requests Sent', count: pendingSent.length, icon: Clock },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Network</h1>
        <p className="text-gray-500 mt-1">Manage your connections and connection requests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-1">
          {/* Connections tab */}
          {tab === 'connections' && (
            connections.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No connections yet"
                description="Start discovering people and sending connection requests!"
                action={<Link to="/discover" className="btn-primary text-sm flex items-center gap-1.5"><ArrowRight size={14} /> Discover Students</Link>}
              />
            ) : (
              connections.map(conn => (
                <UserRow
                  key={conn.connectionId}
                  user={conn.user}
                  connectionId={conn.connectionId}
                  status="accepted"
                  onUpdate={(status) => handleConnectionUpdate(conn.connectionId, status)}
                />
              ))
            )
          )}

          {/* Received tab */}
          {tab === 'received' && (
            pendingReceived.length === 0 ? (
              <EmptyState icon={Clock} title="No pending requests" description="No one has sent you a connection request yet." />
            ) : (
              pendingReceived.map(conn => (
                <UserRow
                  key={conn._id}
                  user={conn.sender}
                  connectionId={conn._id}
                  status="pending_received"
                  onUpdate={(status) => handleConnectionUpdate(conn._id, status)}
                />
              ))
            )
          )}

          {/* Sent tab */}
          {tab === 'sent' && (
            pendingSent.length === 0 ? (
              <EmptyState icon={Clock} title="No sent requests" description="You haven't sent any pending requests." />
            ) : (
              pendingSent.map(conn => (
                <UserRow
                  key={conn._id}
                  user={conn.receiver}
                  connectionId={conn._id}
                  status="pending_sent"
                  onUpdate={() => {}}
                />
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}
