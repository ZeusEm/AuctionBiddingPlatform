import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { ArrowLeft, Trophy, Download } from 'lucide-react';

const AdminBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false); // ADD THIS

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

  // EXCEL DOWNLOAD FUNCTION - Uses adminAPI service
  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      // ✅ Use adminAPI service (automatically uses correct baseURL)
      const response = await adminAPI.downloadBiddingRankExcel();

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Bidding_Rankings_${timestamp}.xlsx`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Excel file downloaded successfully!');
    } catch (err) {
      console.error('Error downloading Excel:', err);
      toast.error('Failed to download Excel file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Split bids into top bidders (rank 1) and others
  const topBidders = bids.filter(bid => bid.rank === 1);
  const otherBids = bids.filter(bid => bid.rank !== 1);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">All Bids</h1>
          </div>
          
          {/* EXCEL DOWNLOAD BUTTON - ADDED HERE */}
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg 
                       flex items-center gap-2 font-semibold transition-all shadow-md 
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                Download Excel
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* TOP BIDDERS SECTION (Rank #1) */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Top Bidders (Winners)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Painting</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Bid Amount</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {topBidders.length > 0 ? (
                  topBidders.map((bid) => (
                    <tr key={bid.id} className="border-t hover:bg-green-50">
                      <td className="px-4 py-3 font-medium">{bid.painting.name}</td>
                      <td className="px-4 py-3">{bid.user.firstName} {bid.user.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{bid.user.phone || bid.user.mobile || 'N/A'}</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹{bid.bidAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(bid.bidTime).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No top bids yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALL OTHER BIDS SECTION */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gray-700 px-6 py-4">
            <h2 className="text-xl font-bold text-white">All Other Bids</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Painting</th>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Bid Amount</th>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {otherBids.length > 0 ? (
                  otherBids.map((bid) => (
                    <tr key={bid.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">{bid.painting.name}</td>
                      <td className="px-4 py-3">{bid.user.firstName} {bid.user.lastName}</td>
                      <td className="px-4 py-3 text-gray-600">{bid.user.phone || bid.user.mobile || 'N/A'}</td>
                      <td className="px-4 py-3 font-semibold">₹{bid.bidAmount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">
                          #{bid.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(bid.bidTime).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">No other bids</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBids;