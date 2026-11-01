import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import UserCard from '../components/UserCard';
import ConnectionButton from '../components/ConnectionButton';
import { LoadingSpinner, EmptyState } from '../components/StateComponents';
import { SkillBadge } from '../components/Badges';
import { Users, Lightbulb, Briefcase, X, Plus, Search } from 'lucide-react';

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('people');
  const [data, setData] = useState({ people: [], similar: [], collaborators: [] });
  const [loading, setLoading] = useState({ people: false, similar: false, collaborators: false });
  const [skillsInput, setSkillsInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    loadPeople();
    loadSimilar();
  }, []);

  const loadPeople = async () => {
    setLoading(p => ({ ...p, people: true }));
    try {
      const res = await recommendationsApi.getPeopleRecommendations();
      setData(p => ({ ...p, people: res.data.data.recommendations || [] }));
    } finally {
      setLoading(p => ({ ...p, people: false }));
    }
  };

  const loadSimilar = async () => {
    setLoading(p => ({ ...p, similar: true }));
    try {
      const res = await recommendationsApi.getSimilarPeople();
      setData(p => ({ ...p, similar: res.data.data.recommendations || [] }));
    } finally {
      setLoading(p => ({ ...p, similar: false }));
    }
  };

  const searchCollaborators = async () => {
    if (requiredSkills.length === 0) return;
    setLoading(p => ({ ...p, collaborators: true }));
    setSearched(true);
    try {
      const res = await recommendationsApi.getCollaboratorRecommendations(requiredSkills);
      setData(p => ({ ...p, collaborators: res.data.data.recommendations || [] }));
    } finally {
      setLoading(p => ({ ...p, collaborators: false }));
    }
  };

  const addSkill = () => {
    const s = skillsInput.trim();
    if (s && !requiredSkills.includes(s)) setRequiredSkills(p => [...p, s]);
    setSkillsInput('');
  };

  const tabs = [
    { key: 'people', label: 'People You May Know', icon: Users, desc: 'Based on 2-hop BFS mutual connections' },
    { key: 'similar', label: 'People Like You', icon: Lightbulb, desc: 'Based on skill & interest similarity (Set intersection)' },
    { key: 'collaborators', label: 'Skill Collaborators', icon: Briefcase, desc: 'Based on required skills (HashMap index)' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
        <p className="text-gray-500 mt-1">Graph algorithm-powered suggestions tailored for you</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 justify-center ${
              tab === t.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <t.icon size={15} />
            <span className="hidden sm:block">{t.label}</span>
            <span className="sm:hidden">{t.icon === Users ? 'May Know' : t.icon === Lightbulb ? 'Similar' : 'Collab'}</span>
          </button>
        ))}
      </div>

      {/* Algorithm badge */}
      <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 font-mono border border-blue-100">
        Algorithm: {tabs.find(t => t.key === tab)?.desc}
      </div>

      {/* People / Similar */}
      {(tab === 'people' || tab === 'similar') && (
        loading[tab] ? <LoadingSpinner /> : (
          data[tab].length === 0 ? (
            <EmptyState
              icon={Users}
              title="No recommendations available"
              description="Connect with more students to get personalized suggestions."
              action={<Link to="/discover" className="btn-primary text-sm">Discover Students</Link>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data[tab].map(rec => (
                <UserCard
                  key={rec.user._id}
                  user={rec.user}
                  highlight={rec.reason}
                  actions={<ConnectionButton targetUserId={rec.user._id} initialStatus="none" />}
                  footer={tab === 'similar' && rec.commonSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500">Common skills:</span>
                      {rec.commonSkills.map(s => <SkillBadge key={s} skill={s} />)}
                    </div>
                  )}
                />
              ))}
            </div>
          )
        )
      )}

      {/* Collaborators */}
      {tab === 'collaborators' && (
        <div>
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What skills does your project need?</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {requiredSkills.map(s => (
                <span key={s} className="skill-badge flex items-center gap-1 pr-1">
                  {s}
                  <button onClick={() => setRequiredSkills(p => p.filter(x => x !== s))} className="hover:text-blue-900">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. React, Python, Figma"
                className="input-field flex-1"
              />
              <button type="button" onClick={addSkill} className="btn-secondary px-3 flex items-center gap-1 text-sm">
                <Plus size={14} /> Add
              </button>
              <button
                onClick={searchCollaborators}
                disabled={requiredSkills.length === 0 || loading.collaborators}
                className="btn-primary px-4 flex items-center gap-2 text-sm"
              >
                <Search size={14} />
                {loading.collaborators ? 'Searching...' : 'Find'}
              </button>
            </div>
          </div>

          {loading.collaborators ? <LoadingSpinner /> : (
            !searched ? (
              <EmptyState icon={Briefcase} title="Enter required skills above" description="Tell us what skills you need and we'll find the best matches from the entire campus network." />
            ) : data.collaborators.length === 0 ? (
              <EmptyState icon={Search} title="No matches found" description="Try different or fewer skills." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.collaborators.map(rec => (
                  <UserCard
                    key={rec.user._id}
                    user={rec.user}
                    highlight={rec.reason}
                    actions={<ConnectionButton targetUserId={rec.user._id} initialStatus="none" />}
                    footer={rec.matchedSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs text-gray-500">Matches:</span>
                        {rec.matchedSkills.map(s => <SkillBadge key={s} skill={s} />)}
                      </div>
                    )}
                  />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
