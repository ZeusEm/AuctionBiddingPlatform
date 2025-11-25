import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getAuctionSettings();
      const data = response.data.data.settings;
      setSettings({
        startDate: new Date(data.startDate).toISOString().slice(0, 16),
        endDate: new Date(data.endDate).toISOString().slice(0, 16)
      });
    } catch (error) {
      console.log('No settings found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateAuctionSettings({
        startDate: new Date(settings.startDate).toISOString(),
        endDate: new Date(settings.endDate).toISOString()
      });
      toast.success('Auction settings updated!');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-4">
          <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold">Auction Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={settings.startDate}
                onChange={(e) => setSettings({...settings, startDate: e.target.value})}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auction End Date & Time
              </label>
              <input
                type="datetime-local"
                value={settings.endDate}
                onChange={(e) => setSettings({...settings, endDate: e.target.value})}
                required
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Update Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
