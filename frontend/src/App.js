import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminUsers from './pages/AdminUsers';

// Pages
import HomePage from './pages/HomePage';
import PaintingDetailPage from './pages/PaintingDetailPage';
import UserLoginPage from './pages/UserLoginPage';
import UserRegisterPage from './pages/UserRegisterPage';
import UserBidsPage from './pages/UserBidsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminPaintings from './pages/AdminPaintings';
import AdminBids from './pages/AdminBids';
import AdminSettings from './pages/AdminSettings';

// Protected Route Components
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/painting/:id" element={<PaintingDetailPage />} />
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/register" element={<UserRegisterPage />} />
          <Route path="/my-bids" element={<UserBidsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/paintings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPaintings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bids"
            element={
              <ProtectedRoute requireAdmin>
                <AdminBids />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
