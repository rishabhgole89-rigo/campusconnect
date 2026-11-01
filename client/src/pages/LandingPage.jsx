import { Link } from 'react-router-dom';
import { Network, Users, Lightbulb, GitBranch, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Discover Students',
    desc: 'Find people by skill, interest, branch, or year. No need to already know them.',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: GitBranch,
    title: 'BFS Connection Finder',
    desc: 'Find the shortest connection path between any two students using real BFS algorithm.',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: Network,
    title: 'Graph-Based Recommendations',
    desc: 'Smart people suggestions powered by graph traversal, mutual connections, and skill matching.',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Briefcase,
    title: 'Hackathon Teams & Projects',
    desc: 'Post opportunities, find teammates with the right skills, build your dream team.',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    icon: Lightbulb,
    title: 'Community Detection',
    desc: 'Discover your campus\'s network communities using DFS-based connected component analysis.',
    color: 'bg-yellow-50 text-yellow-600'
  },
  {
    icon: Users,
    title: 'Skill-Based Matching',
    desc: 'Find collaborators who have exactly the skills your project needs. Powered by HashMap indexing.',
    color: 'bg-red-50 text-red-600'
  }
];

const dsaItems = [
  { algo: 'Graph (Adjacency List)', use: 'Represents student network — O(V+E) space' },
  { algo: 'BFS', use: 'Finds shortest connection path between two students' },
  { algo: 'DFS', use: 'Detects network communities and connected components' },
  { algo: 'HashSet Intersection', use: 'Calculates mutual connections in O(min(d1,d2))' },
  { algo: 'HashMap (Skill Index)', use: 'Skill-based collaborator lookup in O(skills)' },
  { algo: 'Sorting', use: 'Ranks recommendations by score descending' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Network size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Campus Connect</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary text-sm">Log In</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Discover People.<br />Build Teams.<br />
            <span className="text-blue-200">Grow Together.</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Campus Connect uses graph algorithms — BFS, DFS, and skill indexing — to help you find
            the right teammates, mentors, and collaborators in your college network.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
              Join Campus Connect <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="flex items-center gap-2 border border-blue-300 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The Problem We Solve</h2>
          <p className="text-lg text-gray-600 mb-8">
            Many students have skills, ideas, and ambition — but don't know who to collaborate with.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              { q: '"I need a UI/UX designer for my hackathon team."', a: 'Search by skill → Find designers → Check mutual connections → Connect' },
              { q: '"I want to join an AI/ML project."', a: 'Browse opportunities → Filter by AI/ML → Express interest → Collaborate' },
              { q: '"I want to meet people interested in competitive programming."', a: 'Filter by interest → Discover community → See shared connections → Connect' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <p className="text-blue-700 font-medium italic mb-3">{item.q}</p>
                <p className="text-gray-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DSA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4 text-center">Powered by Real DSA</h2>
          <p className="text-gray-400 text-center mb-10">
            This isn't decorative. Every algorithm solves a real campus problem.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dsaItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-800 rounded-lg p-4">
                <CheckCircle size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-mono text-blue-300 text-sm font-semibold">{item.algo}</span>
                  <p className="text-gray-400 text-sm mt-0.5">{item.use}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Connect?</h2>
          <p className="text-gray-600 mb-8">Join your campus network. Discover teammates. Build something great.</p>
          <Link to="/register" className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-sm">
        <p>Campus Connect — College Professional Networking Platform</p>
        <p className="mt-1 text-xs text-gray-400">Built with MERN Stack + Graph Algorithms (BFS, DFS, HashMap)</p>
      </footer>
    </div>
  );
}
