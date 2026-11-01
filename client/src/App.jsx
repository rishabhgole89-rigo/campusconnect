import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiscoverPage from './pages/DiscoverPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import MyNetworkPage from './pages/MyNetworkPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ConnectionFinderPage from './pages/ConnectionFinderPage';
import CommunitiesPage from './pages/CommunitiesPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';

function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      {/* Protected — wrapped in Navbar layout */}
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><DashboardPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/discover" element={
        <ProtectedRoute><AppLayout><DiscoverPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile/:id" element={
        <ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile/:id/edit" element={
        <ProtectedRoute><AppLayout><EditProfilePage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/network" element={
        <ProtectedRoute><AppLayout><MyNetworkPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/recommendations" element={
        <ProtectedRoute><AppLayout><RecommendationsPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/connection-finder" element={
        <ProtectedRoute><AppLayout><ConnectionFinderPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/communities" element={
        <ProtectedRoute><AppLayout><CommunitiesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/opportunities" element={
        <ProtectedRoute><AppLayout><OpportunitiesPage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/opportunities/:id" element={
        <ProtectedRoute><AppLayout><OpportunityDetailPage /></AppLayout></ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
