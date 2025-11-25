import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyBidsPage = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [bidsData, setBidsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // Validate mobile number
  const validateMobile = () => {
    setError('');

    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number');
      return false;
    }

    // Indian mobile number validation (10 digits, starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber.trim())) {
      setError('Please enter a valid 10-digit mobile number (starting with 6-9)');
      return false;
    }

    return true;
  };

  // Auto-login with mobile number
  const autoLoginWithMobile = async () => {
    try {
      const loginResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        {
          mobile_number: mobileNumber.trim(),
          password: mobileNumber.trim() // Mobile is password in your system
        }
      );

      if (loginResponse.data.success) {
        return loginResponse.data.data.token;
      }
      return null;
    } catch (error) {
      console.error('Auto-login error:', error);
      return null;
    }
  };

  // Fetch bids by mobile number
  const fetchMyBids = async () => {
    if (!validateMobile()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearched(true);

      // Auto-login to get token
      const token = await autoLoginWithMobile();
      
      if (!token) {
        setError('No account found with this mobile number. Place a bid first!');
        setBidsData(null);
        setLoading(false);
        return;
      }

      // Fetch all user's bids
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/bids/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Group bids by painting
        const groupedBids = groupBidsByPainting(response.data.data.bids);
        setBidsData(groupedBids);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError(err.response?.data?.message || 'Failed to fetch your bids');
      setBidsData(null);
      setLoading(false);
    }
  };

  // Group bids by painting
  const groupBidsByPainting = (bids) => {
    const grouped = {};

    bids.forEach(bid => {
      const paintingId = bid.painting_id;
      if (!grouped[paintingId]) {
        grouped[paintingId] = {
          painting_name: bid.painting_name,
          artist_name: bid.artist_name,
          painting_image: bid.painting_image,
          bids: []
        };
      }
      grouped[paintingId].bids.push(bid);
    });

    // Sort bids within each painting by amount (highest first)
    Object.keys(grouped).forEach(paintingId => {
      grouped[paintingId].bids.sort((a, b) => b.amount - a.amount);
    });

    return grouped;
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!bidsData) return { totalBids: 0, totalAmount: 0, paintings: 0 };

    let totalBids = 0;
    let totalAmount = 0;
    const paintings = Object.keys(bidsData).length;

    Object.values(bidsData).forEach(painting => {
      painting.bids.forEach(bid => {
        totalBids++;
        totalAmount += bid.amount;
      });
    });

    return { totalBids, totalAmount, paintings };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Bids</h1>
          <button
            onClick={() => navigate('/paintings')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Paintings
          </button>
        </div>

        {/* Mobile Number Input */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Enter Your Mobile Number
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchMyBids()}
              placeholder="Enter your 10-digit mobile number"
              maxLength="10"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            />
            <button
              onClick={fetchMyBids}
              disabled={loading}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Enter the mobile number you used to place bids
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bids...</p>
          </div>
        )}

        {/* Statistics */}
        {searched && bidsData && Object.keys(bidsData).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Total Bids</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalBids}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Total Amount</p>
              <p className="text-3xl font-bold text-green-600">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Paintings</p>
              <p className="text-3xl font-bold text-blue-600">{stats.paintings}</p>
            </div>
          </div>
        )}

        {/* Grouped Bids Display */}
        {searched && !loading && (
          <>
            {!bidsData || Object.keys(bidsData).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <svg
                  className="w-24 h-24 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Bids Found
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven't placed any bids with this mobile number yet.
                </p>
                <button
                  onClick={() => navigate('/paintings')}
                  className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Browse Paintings
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(bidsData).map(([paintingId, paintingData]) => (
                  <div key={paintingId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Painting Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                      <div className="flex items-center space-x-4">
                        {paintingData.painting_image && (
                          <img
                            src={`${process.env.REACT_APP_API_URL}${paintingData.painting_image}`}
                            alt={paintingData.painting_name}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-white"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold">{paintingData.painting_name}</h3>
                          <p className="text-purple-100">by {paintingData.artist_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-purple-100">Total Bids</p>
                          <p className="text-3xl font-bold">{paintingData.bids.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Bids List */}
                    <div className="p-6">
                      <div className="space-y-3">
                        {paintingData.bids.map((bid, index) => (
                          <div
                            key={bid.id}
                            className={`flex justify-between items-center p-4 rounded-lg ${
                              index === 0
                                ? 'bg-yellow-50 border-2 border-yellow-400'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="flex flex-col items-center">
                                {index === 0 && (
                                  <span className="text-2xl mb-1">👑</span>
                                )}
                                <span
                                  className={`px-3 py-1 rounded-full font-bold text-sm ${
                                    index === 0
                                      ? 'bg-yellow-400 text-yellow-900'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  Rank #{bid.rank}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  ₹{bid.amount.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(bid.created_at).toLocaleString('en-IN', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                  })}
                                </p>
                              </div>
                            </div>
                            {index === 0 && (
                              <div className="text-right">
                                <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm">
                                  🏆 Highest Bid
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* View Painting Button */}
                      <button
                        onClick={() => navigate(`/painting/${paintingId}`)}
                        className="w-full mt-4 px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-semibold"
                      >
                        View Painting Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBidsPage;
