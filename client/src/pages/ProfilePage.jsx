import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usersApi, connectionsApi, graphApi } from '../api';
import { useAuth } from '../context/AuthContext';
import ConnectionButton from '../components/ConnectionButton';
import { SkillBadge, InterestBadge } from '../components/Badges';
import { LoadingSpinner, ErrorState } from '../components/StateComponents';
import {
  Link2, Globe, GraduationCap, Award,
  Users, ExternalLink, Edit2, Network
} from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({ status: 'none', connection: null });
  const [mutuals, setMutuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isOwnProfile = id === currentUser?._id;

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, statusRes, mutualRes] = await Promise.allSettled([
          usersApi.getUserById(id),
          !isOwnProfile ? connectionsApi.getConnectionStatus(id) : Promise.resolve(null),
          !isOwnProfile ? connectionsApi.getMutualConnections(id) : Promise.resolve(null),
        ]);
        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data.data.user);
        } else {
          setError('User not found');
        }
        if (statusRes.status === 'fulfilled' && statusRes.value) {
          setConnectionStatus(statusRes.value.data.data);
        }
        if (mutualRes.status === 'fulfilled' && mutualRes.value) {
          setMutuals(mutualRes.value.data.data.mutualConnections || []);
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProfile();
  }, [id, isOwnProfile]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                profile.name?.charAt(0)
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-gray-600 text-sm">
                    <GraduationCap size={14} />
                    {profile.branch || 'No branch set'}
                  </span>
                  {profile.year && (
                    <span className="text-sm text-gray-500">Year {profile.year}</span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{profile.email}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isOwnProfile ? (
                  <Link to={`/profile/${id}/edit`} className="btn-outline text-sm flex items-center gap-1.5">
                    <Edit2 size={14} /> Edit Profile
                  </Link>
                ) : (
                  <>
                    <ConnectionButton
                      targetUserId={id}
                      initialStatus={connectionStatus.status}
                      connectionId={connectionStatus.connection?._id}
                    />
                    <Link
                      to={`/connection-finder?from=${currentUser?._id}&to=${id}`}
                      className="btn-secondary text-sm flex items-center gap-1.5"
                    >
                      <Network size={14} /> Find Path
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-700 mt-4 text-sm leading-relaxed">{profile.bio}</p>
            )}

            {/* Looking for */}
            {profile.lookingFor && (
              <div className="mt-3 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                <span className="font-medium">Looking for:</span> {profile.lookingFor}
              </div>
            )}

            {/* Portfolio links */}
            <div className="flex gap-3 mt-4">
              {profile.portfolioLinks?.github && (
                <a href={profile.portfolioLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <Link2 size={16} /> GitHub
                </a>
              )}
              {profile.portfolioLinks?.linkedin && (
                <a href={profile.portfolioLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  <Link2 size={16} /> LinkedIn
                </a>
              )}
              {profile.portfolioLinks?.portfolio && (
                <a href={profile.portfolioLinks.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 transition-colors">
                  <Globe size={16} /> Portfolio
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(s => <SkillBadge key={s} skill={s} />)}
              </div>
            </div>
          )}

          {/* Interests */}
          {profile.interests?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => <InterestBadge key={i} interest={i} />)}
              </div>
            </div>
          )}

          {/* Projects */}
          {profile.projects?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-4">Projects</h2>
              <div className="space-y-4">
                {profile.projects.map((p, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      {p.link && (
                        <a href={p.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                    {p.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.techStack.map(t => <SkillBadge key={t} skill={t} size="xs" />)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Achievements */}
          {profile.achievements?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={16} className="text-yellow-500" /> Achievements
              </h2>
              <ul className="space-y-2">
                {profile.achievements.map((a, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">★</span> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clubs */}
          {profile.clubs?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3">Clubs & Societies</h2>
              <div className="flex flex-wrap gap-2">
                {profile.clubs.map(c => (
                  <span key={c} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Mutual connections */}
          {!isOwnProfile && mutuals.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users size={16} className="text-blue-500" /> {mutuals.length} Mutual Connection{mutuals.length !== 1 ? 's' : ''}
              </h2>
              <div className="space-y-2">
                {mutuals.slice(0, 5).map(m => (
                  <Link key={m._id} to={`/profile/${m._id}`} className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                      {m.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                      <p className="text-xs text-gray-500 truncate">{m.branch}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
