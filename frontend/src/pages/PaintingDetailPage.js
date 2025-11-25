import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { paintingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Palette, TrendingUp, Users, IndianRupee, Award, Clock, X } from 'lucide-react';

const PaintingDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, loginUser } = useAuth(); // ✅ FIXED: Use loginUser instead of login

  const [painting, setPainting] = useState(null);
  const [userBidInfo, setUserBidInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  useEffect(() => {
    fetchPaintingDetails();
  }, [id]);

  // Function to round up to nearest 500
  const roundToNext500 = (amount) => {
    return Math.ceil(amount / 500) * 500;
  };

  const fetchPaintingDetails = async () => {
    try {
      const response = await paintingAPI.getPainting(id);
      const data = response.data.data;
      setPainting(data.painting);
      setUserBidInfo(data.userBidInfo);
      // Round up current price to nearest 500
      const roundedAmount = roundToNext500(data.painting.currentPrice);
      setBidAmount(roundedAmount);
    } catch (error) {
      toast.error('Failed to load painting details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBidClick = (e) => {
    e.preventDefault();

    // Round the bid amount to nearest 500
    const roundedBidAmount = roundToNext500(parseFloat(bidAmount) || 0);

    if (!roundedBidAmount || roundedBidAmount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    if (roundedBidAmount <= painting.currentPrice) {
      toast.error(`Bid must be higher than current price of ₹${painting.currentPrice}`);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Show modal for name and mobile
      setShowModal(true);
    } else {
      // User is authenticated, proceed with bid
      submitBid(roundedBidAmount);
    }
  };

  const submitBid = async (roundedBidAmount, name = null, mobile = null) => {
  setSubmitting(true);

  try {
    const bidData = {
      paintingId: parseInt(id),
      bidAmount: roundedBidAmount,
    };

    let response;

    // ✅ Check if this is a guest bid (name and mobile provided)
    if (name && mobile) {
      // Guest bid - use guestAPI without authentication
      bidData.name = name;
      bidData.mobile = mobile;
      response = await paintingAPI.placeGuestBid(bidData);
    } else {
      // Authenticated bid - use regular API with token
      response = await paintingAPI.placeBid(bidData);
    }

    // If user was auto-registered/logged in, update auth state
    if (response.data.token && response.data.user) {
      // Use loginUser from AuthContext
      loginUser(response.data.user, response.data.token);
    }

    toast.success(response.data.message || 'Bid placed successfully!');
    
    // Close modal and clear fields
    setShowModal(false);
    setUserName('');
    setMobileNumber('');
    
    // Refresh data to show updated bid
    await fetchPaintingDetails();
    
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to place bid');
  } finally {
    setSubmitting(false);
  }
};

  const handleModalSubmit = (e) => {
    e.preventDefault();

    // Validate name
    if (!userName || userName.trim().length < 3) {
      toast.error('Please enter a valid name (minimum 3 characters)');
      return;
    }

    // Validate mobile
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    // Proceed with bid submission
    const roundedBidAmount = roundToNext500(parseFloat(bidAmount) || 0);
    submitBid(roundedBidAmount, userName.trim(), mobileNumber);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading painting...</p>
          </div>
        </div>
      </>
    );
  }

  if (!painting) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Palette className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Painting Not Found</h2>
            <p className="text-gray-600 mb-6">The painting you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            ← Back to Gallery
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Image */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="relative h-96 sm:h-[500px] bg-gradient-to-br from-gray-100 to-gray-200">
                {painting.imageUrl ? (
                  <img
                    src={painting.imageUrl}
                    alt={painting.paintingName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="h-32 w-32 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details & Bidding */}
            <div className="space-y-6">
              {/* Title & Artist */}
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  {painting.paintingName}
                </h1>
                <div className="flex items-center text-gray-600 mb-6">
                  <Users className="h-5 w-5 mr-2" />
                  <span className="text-lg">by {painting.artistName}</span>
                </div>

                {/* Status Banner */}
                {!painting.auctionActive && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-red-700">
                      <Clock className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Auction is currently not active</span>
                    </div>
                  </div>
                )}

                {/* User Bid Status */}
                {userBidInfo && (
                  <div className={`border-2 rounded-xl p-4 mb-6 ${
                    userBidInfo.rank === 1
                      ? 'bg-green-50 border-green-400'
                      : 'bg-yellow-50 border-yellow-400'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Your Status</p>
                        <div className="flex items-center mt-1">
                          <Award className={`h-5 w-5 mr-2 ${
                            userBidInfo.rank === 1 ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                          <span className={`text-lg font-bold ${
                            userBidInfo.rank === 1 ? 'text-green-700' : 'text-yellow-700'
                          }`}>
                            Rank #{userBidInfo.rank}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Your Bid</p>
                        <div className="flex items-center justify-end">
                          <IndianRupee className="h-5 w-5 text-gray-700" />
                          <span className="text-xl font-bold text-gray-900">
                            {userBidInfo.bidAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Price */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Current Highest Bid</p>
                      <div className="flex items-center mb-2">
                        <IndianRupee className="h-8 w-8 text-gray-700" />
                        <span className="text-4xl font-bold text-gray-900">
                          {painting.currentPrice.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Base Price and Percentage Increase */}
                      {painting.basePrice && painting.currentPrice > painting.basePrice && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500">
                            <b>Base Price ₹</b>{painting.basePrice.toLocaleString()}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
                            +{(((painting.currentPrice - painting.basePrice) / painting.basePrice) * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow">
                      <Users className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-lg font-semibold text-gray-900">
                        {painting.totalBidders}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bid Form */}
                {painting.auctionActive && (
                  <form onSubmit={handleBidClick} className="space-y-4">
                    {/* Bid Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter Your Bid Amount (₹)
                      </label>
                      <div className="flex gap-2">
                        {/* Decrement Button */}
                        <button
                          type="button"
                          onClick={() => setBidAmount(prev => {
                            const current = parseFloat(prev) || 0;
                            const newAmount = current - 500;
                            const minBid = roundToNext500(painting.currentPrice);
                            return Math.max(newAmount, minBid);
                          })}
                          disabled={submitting}
                          className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          -500
                        </button>

                        <div className="relative flex-1">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBidAmount(value);
                            }}
                            onBlur={(e) => {
                              if (e.target.value) {
                                const rounded = roundToNext500(parseFloat(e.target.value));
                                setBidAmount(rounded);
                              }
                            }}
                            required
                            disabled={submitting}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                            placeholder={`Minimum: ₹${roundToNext500(painting.currentPrice)}`}
                          />
                        </div>

                        {/* Increment Button */}
                        <button
                          type="button"
                          onClick={() => setBidAmount(prev => {
                            const current = parseFloat(prev) || 0;
                            return current + 500;
                          })}
                          disabled={submitting}
                          className="px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                        >
                          +500
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Minimum bid: ₹{roundToNext500(painting.currentPrice).toLocaleString()} (amounts will be rounded to nearest ₹500)
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                        submitting
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                      }`}
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span>{submitting ? 'Placing Bid...' : 'Place Bid'}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About This Auction</h3>
                <div className="space-y-3 text-gray-600">
                  <p>🎨 Featuring exclusive original artworks from skilled and trusted artists</p>
                  <p>🏆 Bid on unique, one-of-a-kind pieces available only in this auction</p>
                  <p>💰 Competitive bidding with transparent pricing</p>
                  <p>💳 Payment Methods: Cash • Card • UPI (processed securely at the venue)</p>
                  <p>📦 Artwork Collection: Pick up your purchased items after the auction ends</p>
                  <p>🔒 Authenticity guaranteed for all listed artworks</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Name and Mobile */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowModal(false);
                setUserName('');
                setMobileNumber('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Bid</h2>
              <p className="text-gray-600">Please provide your details to place the bid</p>
            </div>

            {/* Bid Amount Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Your Bid Amount</p>
              <div className="flex items-center">
                <IndianRupee className="h-6 w-6 text-blue-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {roundToNext500(parseFloat(bidAmount) || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Enter your full name"
                  minLength={3}
                  autoFocus
                />
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    if (value.length <= 10) {
                      setMobileNumber(value);
                    }
                  }}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Enter 10-digit mobile number"
                  pattern="[0-9]{10}"
                  minLength={10}
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 10-digit mobile number without +91
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                  submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                <TrendingUp className="h-6 w-6" />
                <span>{submitting ? 'Placing Bid...' : 'Confirm & Place Bid'}</span>
              </button>
            </form>

            {/* Info Text */}
            <p className="text-xs text-gray-500 text-center mt-4">
              New users will be automatically registered. Existing users will be logged in.
            </p>
          </div>
        </div>
      )}

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default PaintingDetailPage;