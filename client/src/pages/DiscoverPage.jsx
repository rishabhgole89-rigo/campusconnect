import { useEffect, useState, useCallback } from 'react';
import { usersApi } from '../api';
import UserCard from '../components/UserCard';
import ConnectionButton from '../components/ConnectionButton';
import { LoadingSpinner, EmptyState } from '../components/StateComponents';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const BRANCHES = ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Electrical', 'Civil'];

export default function DiscoverPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: '', skill: '', branch: '', year: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.q) params.q = filters.q;
      if (filters.skill) params.skill = filters.skill;
      if (filters.branch) params.branch = filters.branch;
      if (filters.year) params.year = filters.year;

      const res = await usersApi.getUsers(params);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const clearFilters = () => setFilters({ q: '', skill: '', branch: '', year: '' });
  const hasFilters = filters.q || filters.skill || filters.branch || filters.year;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Discover Students</h1>
        <p className="text-gray-500 mt-1">Find students by name, skill, branch, or year of study</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, skill, interest..."
            value={filters.q}
            onChange={e => setFilters(p => ({ ...p, q: e.target.value }))}
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:block">Filters</span>
          {hasFilters && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-sm">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
            <input
              placeholder="e.g. React, Python"
              value={filters.skill}
              onChange={e => setFilters(p => ({ ...p, skill: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={filters.branch}
              onChange={e => setFilters(p => ({ ...p, branch: e.target.value }))}
              className="input-field"
            >
              <option value="">All branches</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={filters.year}
              onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}
              className="input-field"
            >
              <option value="">All years</option>
              {[1,2,3,4,5].map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">{pagination.total} student{pagination.total !== 1 ? 's' : ''} found</p>

      {/* Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No students found"
          description="Try different search terms or clear the filters."
          action={hasFilters ? <button onClick={clearFilters} className="btn-outline text-sm">Clear Filters</button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(u => (
            <UserCard
              key={u._id}
              user={u}
              actions={<ConnectionButton targetUserId={u._id} initialStatus="none" />}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchUsers(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === pagination.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
