import { Link } from 'react-router-dom';
import { User, MapPin, GraduationCap } from 'lucide-react';
import { SkillBadge } from './Badges';

export default function UserCard({ user, actions, footer, highlight }) {
  const displaySkills = (user.skills || []).slice(0, 4);
  const extraSkills = (user.skills || []).length - 4;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link to={`/profile/${user._id}`} className="flex-shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden text-white font-bold text-lg shadow-sm">
            {user.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/profile/${user._id}`}
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block truncate"
              >
                {user.name}
              </Link>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                {user.branch && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <GraduationCap size={12} />
                    {user.branch}
                  </span>
                )}
                {user.year && (
                  <span className="text-xs text-gray-500">Year {user.year}</span>
                )}
              </div>
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
          </div>

          {/* Highlight reason (for recommendations) */}
          {highlight && (
            <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 rounded px-2 py-0.5 inline-block">
              {highlight}
            </p>
          )}

          {/* Bio */}
          {user.bio && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.bio}</p>
          )}

          {/* Skills */}
          {displaySkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {displaySkills.map(skill => (
                <SkillBadge key={skill} skill={skill} />
              ))}
              {extraSkills > 0 && (
                <span className="text-xs text-gray-400 self-center">+{extraSkills} more</span>
              )}
            </div>
          )}

          {footer && <div className="mt-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
