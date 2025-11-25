import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { paintingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Search, Award, TrendingUp, IndianRupee, Palette } from 'lucide-react';

const UserBidsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobile, setMobile] = useState('');
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-fetch bids if user is logged in
  useEffect(() => {
    // Only fetch if user is authenticated and has a valid mobile number
    if (isAuthenticated() && user && user.mobile && user.mobile.length === 10) {
      setMobile(user.mobile);
      // Small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        fetchBids(user.mobile);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user]);

  const fetchBids = async (mobileNumber) => {
    // Validate mobile number format
    if (!mobileNumber || !/^[6-9]\d{9}$/.test(mobileNumber)) {
      console.error('Invalid mobile number format:', mobileNumber);
      return;
    }

    console.log('Fetching bids for mobile:', mobileNumber);
    setLoading(true);
    setSearched(true);

    try {
      const response = await paintingAPI.getUserBids(mobileNumber);
      console.log('Bids response:', response.data);
      const fetchedBids = response.data.data.bids;
      console.log('Fetched bids count:', fetchedBids.length);
      setBids(fetchedBids);
      
      if (fetchedBids.length > 0) {
        toast.success(`Found ${fetchedBids.length} bid(s)!`);
      }
    } catch (error) {
      console.error('Fetch bids error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 404) {
        console.log('User not found or no bids');
        setBids([]);
      } else if (error.response?.status === 400) {
        console.error('Validation error:', error.response?.data);
        toast.error('Invalid mobile number format');
        setBids([]);
      } else {
        toast.error('Failed to fetch bids. Please try again.');
        setBids([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchBids(mobile);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {isAuthenticated() ? 'Your Bids' : 'Track Your Bids'}
            </h1>
            <p className="text-gray-600">
              {isAuthenticated() 
                ? `Welcome back, ${user?.firstName}! Here are all your bids.`
                : 'Enter your mobile number to view all your bids and rankings'
              }
            </p>
          </div>

          {/* Search Form - Only show for non-logged in users or allow manual search */}
          {!isAuthenticated() && (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Enter your mobile number"
                    pattern="[6-9][0-9]{9}"
                    maxLength="10"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2 disabled:bg-gray-400"
                >
                  <Search className="h-5 w-5" />
                  <span>{loading ? 'Searching...' : 'Search'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your bids...</p>
            </div>
          )}

          {/* Bids List */}
          {!loading && searched && (
            <div className="space-y-4">
              {bids.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                  <Palette className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Bids Found
                  </h3>
                  <p className="text-gray-500">
                    You haven't placed any bids yet. Start bidding on paintings!
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Your Bids ({bids.length})
                  </h2>
                  {bids.map((bid) => (
                    <div
                      key={bid.id}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Painting Info */}
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {bid.painting.imageUrl ? (
                              <img
                                src={bid.painting.imageUrl}
                                alt={bid.painting.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Palette className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {bid.painting.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              by {bid.painting.artist}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Bid placed: {new Date(bid.bidTime).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Bid Info */}
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">Your Bid</p>
                            <div className="flex items-center justify-end">
                              <IndianRupee className="h-5 w-5 text-gray-700" />
                              <span className="text-2xl font-bold text-gray-900">
                                {bid.bidAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div
                            className={`flex items-center px-4 py-2 rounded-lg ${
                              bid.rank === 1
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            <Award className="h-5 w-5 mr-2" />
                            <span className="font-bold text-lg">#{bid.rank}</span>
                          </div>
                        </div>
                      </div>

                      {/* Current Highest */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Current Highest Bid:</span>
                          <div className="flex items-center font-semibold text-gray-900">
                            <IndianRupee className="h-4 w-4" />
                            <span>{bid.currentHighestBid.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserBidsPage;
