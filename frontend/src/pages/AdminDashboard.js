import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, Palette, TrendingUp, LogOut, Settings, List } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Welcome, {admin?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Paintings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalPaintings || 0}</p>
              </div>
              <Palette className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <Link to="/admin/users" className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-12 w-12 text-green-600" />
            </div>
          </Link>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bids</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalBids || 0}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bid Value</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats?.totalBidValue?.toLocaleString() || 0}</p>
              </div>
              <BarChart3 className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/admin/paintings"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition text-center"
          >
            <Palette className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Paintings</h3>
            <p className="text-gray-600">Add, edit, or delete paintings and generate QR codes</p>
          </Link>

          <Link
            to="/admin/bids"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition text-center"
          >
            <List className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">View All Bids</h3>
            <p className="text-gray-600">Monitor bidding activity and rankings</p>
          </Link>

          <Link
            to="/admin/settings"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition text-center"
          >
            <Settings className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Auction Settings</h3>
            <p className="text-gray-600">Configure auction start and end dates</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
