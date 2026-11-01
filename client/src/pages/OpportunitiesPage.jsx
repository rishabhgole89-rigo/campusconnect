import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { opportunitiesApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner, EmptyState } from '../components/StateComponents';
import { TypeBadge, SkillBadge } from '../components/Badges';
import { Briefcase, Plus, Calendar, Users, X, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '', description: '', type: 'project',
    teamSize: 4, requiredSkills: [], requiredInterests: []
  });
  const [skill, setSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = () => {
    const s = skill.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm(p => ({ ...p, requiredSkills: [...p.requiredSkills, s] }));
    }
    setSkill('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) return toast.error('Title and description required');
    setLoading(true);
    try {
      const res = await opportunitiesApi.create(form);
      onCreate(res.data.data.opportunity);
      toast.success('Opportunity created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Post Opportunity</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" placeholder="e.g. Need UI/UX designer for hackathon" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="input-field resize-none" placeholder="Describe what you're looking for..." required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="input-field">
                {['hackathon', 'project', 'research', 'internship', 'other'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Size</label>
              <input type="number" min={1} max={20} value={form.teamSize} onChange={e => setForm(p => ({ ...p, teamSize: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.requiredSkills.map(s => (
                <span key={s} className="skill-badge flex items-center gap-1 pr-1">
                  {s} <button type="button" onClick={() => setForm(p => ({ ...p, requiredSkills: p.requiredSkills.filter(x => x !== s) }))}><X size={10} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skill} onChange={e => setSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Add skill and press Enter" className="input-field flex-1 text-sm" />
              <button type="button" onClick={addSkill} className="btn-secondary px-3 text-sm">Add</button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Posting...' : 'Post Opportunity'}</button>
            <button type="button" onClick={onClose} className="btn-secondary px-6">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState({ type: '', status: 'open' });

  const load = async () => {
    setLoading(true);
    try {
      const params = { status: filter.status, limit: 20 };
      if (filter.type) params.type = filter.type;
      const res = await opportunitiesApi.getAll(params);
      setOpportunities(res.data.data.opportunities || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-gray-500 mt-1">Find hackathon teams, projects, and research collaborations</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-1">
        {['all', 'hackathon', 'project', 'research', 'internship', 'other'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(p => ({ ...p, type: t === 'all' ? '' : t }))}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              (t === 'all' && !filter.type) || filter.type === t
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        opportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No opportunities found"
            description="Be the first to post a project or hackathon opportunity!"
            action={<button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-1.5"><Plus size={14} /> Post Opportunity</button>}
          />
        ) : (
          <div className="space-y-4">
            {opportunities.map(opp => (
              <Link key={opp._id} to={`/opportunities/${opp._id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <TypeBadge type={opp.type} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opp.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {opp.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{opp.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">by {opp.creator?.name} • {opp.creator?.branch}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{opp.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-500 justify-end">
                      <Users size={14} /> {opp.currentMembers?.length}/{opp.teamSize}
                    </div>
                    {opp.deadline && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                        <Calendar size={12} /> {new Date(opp.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                {opp.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {opp.requiredSkills.map(s => <SkillBadge key={s} skill={s} />)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )
      )}

      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreate={opp => setOpportunities(p => [opp, ...p])}
        />
      )}
    </div>
  );
}
