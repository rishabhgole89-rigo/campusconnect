import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api';
import { SkillBadge, InterestBadge } from '../components/Badges';
import { X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

function TagInput({ label, values, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setInput('');
  };

  const remove = (val) => onChange(values.filter(v => v !== val));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map(v => (
          <span key={v} className="skill-badge flex items-center gap-1 pr-1">
            {v}
            <button onClick={() => remove(v)} className="hover:text-blue-900 ml-0.5"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="input-field flex-1 text-sm"
        />
        <button type="button" onClick={add} className="btn-secondary px-3 py-2 text-sm flex items-center gap-1">
          <Plus size={14} /> Add
        </button>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', bio: '', branch: '', year: 1,
    skills: [], interests: [], clubs: [], achievements: [],
    lookingFor: '',
    portfolioLinks: { github: '', linkedin: '', portfolio: '' }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        bio: user.bio || '',
        branch: user.branch || '',
        year: user.year || 1,
        skills: user.skills || [],
        interests: user.interests || [],
        clubs: user.clubs || [],
        achievements: user.achievements || [],
        lookingFor: user.lookingFor || '',
        portfolioLinks: {
          github: user.portfolioLinks?.github || '',
          linkedin: user.portfolioLinks?.linkedin || '',
          portfolio: user.portfolioLinks?.portfolio || '',
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await usersApi.updateUser(user._id, form);
      updateUser(res.data.data.user);
      toast.success('Profile updated!');
      navigate(`/profile/${user._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setLink = (field, val) => setForm(p => ({ ...p, portfolioLinks: { ...p.portfolioLinks, [field]: val } }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 mt-1">Keep your profile updated to get better recommendations</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <input value={form.branch} onChange={e => set('branch', e.target.value)} className="input-field" placeholder="e.g. Computer Science" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select value={form.year} onChange={e => set('year', Number(e.target.value))} className="input-field">
                {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Looking For</label>
              <input value={form.lookingFor} onChange={e => set('lookingFor', e.target.value)} className="input-field" placeholder="e.g. Hackathon teammates" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio <span className="text-gray-400 text-xs">(max 500 chars)</span></label>
            <textarea
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              maxLength={500}
              rows={4}
              className="input-field resize-none"
              placeholder="Tell others about yourself..."
            />
            <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500</p>
          </div>
        </div>

        {/* Skills & Interests */}
        <div className="card space-y-5">
          <h2 className="font-bold text-gray-900">Skills & Interests</h2>
          <TagInput
            label="Skills"
            values={form.skills}
            onChange={vals => set('skills', vals)}
            placeholder="Add a skill (press Enter)"
          />
          <TagInput
            label="Interests"
            values={form.interests}
            onChange={vals => set('interests', vals)}
            placeholder="Add an interest (press Enter)"
          />
          <TagInput
            label="Clubs & Societies"
            values={form.clubs}
            onChange={vals => set('clubs', vals)}
            placeholder="Add a club (press Enter)"
          />
          <TagInput
            label="Achievements"
            values={form.achievements}
            onChange={vals => set('achievements', vals)}
            placeholder="Add an achievement (press Enter)"
          />
        </div>

        {/* Portfolio links */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">Portfolio Links</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input value={form.portfolioLinks.github} onChange={e => setLink('github', e.target.value)} className="input-field" placeholder="https://github.com/username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input value={form.portfolioLinks.linkedin} onChange={e => setLink('linkedin', e.target.value)} className="input-field" placeholder="https://linkedin.com/in/username" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
            <input value={form.portfolioLinks.portfolio} onChange={e => setLink('portfolio', e.target.value)} className="input-field" placeholder="https://yoursite.com" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  );
}
