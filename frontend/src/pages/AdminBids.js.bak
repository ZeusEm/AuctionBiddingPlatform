import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { ArrowLeft } from 'lucide-react';

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await adminAPI.getBids();
      setBids(response.data.data.bids);
    } catch (error) {
      toast.error('Failed to load bids');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold">All Bids</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Painting</th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Bid Amount</th>
                <th className="px-4 py-3 text-left">Rank</th>
                <th className="px-4 py-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {bids.map((bid) => (
                <tr key={bid.id} className="border-t">
                  <td className="px-4 py-3">{bid.painting.name}</td>
                  <td className="px-4 py-3">{bid.user.firstName} {bid.user.lastName}</td>
                  <td className="px-4 py-3 font-semibold">₹{bid.bidAmount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded ${bid.rank === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      #{bid.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{new Date(bid.bidTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBids;
