import { useState } from 'react';
import { connectionsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { UserPlus, UserCheck, UserX, Clock, Loader } from 'lucide-react';

export default function ConnectionButton({ targetUserId, initialStatus, connectionId, onStatusChange }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(initialStatus || 'none');
  const [connId, setConnId] = useState(connectionId);
  const [loading, setLoading] = useState(false);

  if (targetUserId === user?._id) return null;

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await connectionsApi.sendRequest(targetUserId);
      setConnId(res.data.data.connection._id);
      setStatus('pending_sent');
      toast.success('Connection request sent!');
      onStatusChange?.('pending_sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      await connectionsApi.acceptRequest(connId);
      setStatus('accepted');
      toast.success('Connection accepted!');
      onStatusChange?.('accepted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await connectionsApi.rejectRequest(connId);
      setStatus('none');
      toast.success('Request rejected');
      onStatusChange?.('none');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await connectionsApi.removeConnection(connId);
      setStatus('none');
      setConnId(null);
      toast.success('Connection removed');
      onStatusChange?.('none');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-400 text-sm">
        <Loader size={14} className="animate-spin" />
      </button>
    );
  }

  if (status === 'none') {
    return (
      <button onClick={handleConnect} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
        <UserPlus size={14} />
        Connect
      </button>
    );
  }

  if (status === 'pending_sent') {
    return (
      <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium">
        <Clock size={14} />
        Pending
      </button>
    );
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button onClick={handleAccept} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
          <UserCheck size={14} />
          Accept
        </button>
        <button onClick={handleReject} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors">
          <UserX size={14} />
          Reject
        </button>
      </div>
    );
  }

  if (status === 'accepted') {
    return (
      <button onClick={handleRemove} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors group">
        <UserCheck size={14} className="group-hover:hidden" />
        <UserX size={14} className="hidden group-hover:block" />
        <span className="group-hover:hidden">Connected</span>
        <span className="hidden group-hover:block">Remove</span>
      </button>
    );
  }

  return null;
}
