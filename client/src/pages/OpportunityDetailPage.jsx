import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { opportunitiesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, ErrorState } from '../components/StateComponents';
import { TypeBadge, SkillBadge, InterestBadge } from '../components/Badges';
import { Calendar, Users, Star, ArrowLeft, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await opportunitiesApi.getById(id);
        setOpp(res.data.data.opportunity);
      } catch {
        setError('Opportunity not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleInterest = async () => {
    setInterestLoading(true);
    try {
      await opportunitiesApi.expressInterest(id);
      toast.success('Interest expressed!');
      // refresh
      const res = await opportunitiesApi.getById(id);
      setOpp(res.data.data.opportunity);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setInterestLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await opportunitiesApi.remove(id);
      toast.success('Deleted');
      navigate('/opportunities');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!opp) return null;

  const isCreator = opp.creator?._id === user._id;
  const hasInterested = opp.interestedUsers?.some(u => u._id === user._id);
  const isMember = opp.currentMembers?.some(m => m._id === user._id);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/opportunities" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Opportunities
      </Link>

      {/* Main card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <TypeBadge type={opp.type} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opp.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {opp.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{opp.title}</h1>
          </div>
          {isCreator && (
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        <p className="text-gray-700 leading-relaxed">{opp.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-6">
          <div>
            <p className="text-xs text-gray-500 mb-1">Team Size</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <Users size={14} className="text-blue-500" />
              {opp.currentMembers?.length}/{opp.teamSize} members
            </p>
          </div>
          {opp.deadline && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Deadline</p>
              <p className="font-semibold text-gray-900 flex items-center gap-1">
                <Calendar size={14} className="text-orange-500" />
                {new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 mb-1">Posted by</p>
            <Link to={`/profile/${opp.creator?._id}`} className="font-semibold text-blue-600 hover:underline text-sm">
              {opp.creator?.name}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Required skills */}
        {opp.requiredSkills?.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {opp.requiredSkills.map(s => <SkillBadge key={s} skill={s} />)}
            </div>
          </div>
        )}

        {/* Required interests */}
        {opp.requiredInterests?.length > 0 && (
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-3">Required Interests</h2>
            <div className="flex flex-wrap gap-2">
              {opp.requiredInterests.map(i => <InterestBadge key={i} interest={i} />)}
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      {!isCreator && opp.status === 'open' && (
        <div className="card mb-6">
          {isMember ? (
            <div className="text-center text-green-700 font-medium">✓ You're a member of this team!</div>
          ) : hasInterested ? (
            <div className="text-center text-blue-700 font-medium flex items-center justify-center gap-2">
              <Star size={16} className="fill-blue-400 text-blue-400" />
              You've expressed interest — the creator will reach out!
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Interested in joining this {opp.type}?</p>
              <button onClick={handleInterest} disabled={interestLoading} className="btn-primary flex items-center gap-2 mx-auto">
                <Star size={16} />
                {interestLoading ? 'Submitting...' : 'Express Interest'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current members */}
      {opp.currentMembers?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Team Members ({opp.currentMembers.length})</h2>
          <div className="flex flex-wrap gap-3">
            {opp.currentMembers.map(m => (
              <Link key={m._id} to={`/profile/${m._id}`} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {m.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.branch?.split(' ')[0]}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Interested users (only visible to creator) */}
      {isCreator && opp.interestedUsers?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            Interested Students ({opp.interestedUsers.length})
          </h2>
          <div className="space-y-3">
            {opp.interestedUsers.map(u => (
              <div key={u._id} className="flex items-center gap-3">
                <Link to={`/profile/${u._id}`} className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.branch} • Year {u.year}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap gap-1">
                  {u.skills?.slice(0, 3).map(s => <SkillBadge key={s} skill={s} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
