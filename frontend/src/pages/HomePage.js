import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { paintingAPI } from '../services/api';
import Navbar from '../components/Navbar';
import { Palette, TrendingUp, Users, IndianRupee } from 'lucide-react';
import logo from '../logo-removebg-preview.png';
import themeImage from '../theme.jpeg';

const HomePage = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaintings();
  }, []);

  const fetchPaintings = async () => {
    try {
      const response = await paintingAPI.getAllPaintings();
      setPaintings(response.data.data.paintings);
    } catch (error) {
      toast.error('Failed to load paintings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading paintings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
  {/* Hero Section */}
  <div 
  className="relative text-white py-12 sm:py-20 bg-cover bg-center"
  style={{
    backgroundImage: `url(${themeImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  {/* Add a dark overlay for text readability */}
  <div className="absolute inset-0 bg-black/40"></div>
  
  <div 
  className="relative text-white py-12 sm:py-20 bg-cover bg-center"
  style={{
    
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
  {/* Logo Image with Glow Background */}
  <div className="relative inline-block mx-auto mb-6">
    {/* Outer glow - larger, more diffused */}
    <div className="absolute inset-0 blur-3xl bg-white/30 scale-110 rounded-full"></div>
    
    {/* Inner glow - tighter, brighter */}
    <div className="absolute inset-0 blur-xl bg-white/40 rounded-full"></div>
    
    {/* Logo */}
    <img 
      src={logo} 
      alt="Naval Dockyard Logo" 
      className="relative h-32 sm:h-40 mx-auto object-contain drop-shadow-2xl"
      style={{
        filter: 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.5))'
      }}
    />
  </div>
    <h1 className="text-3xl sm:text-5xl font-bold mb-4 drop-shadow-lg">
      Naval Dockyard Painting Exhibition
    </h1>
    {/* <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto drop-shadow-md">
      Support talented student artists by bidding on their beautiful paintings.
      All proceeds go towards student development programs.
    </p> */}
  </div>
</div></div>

        {/* Paintings Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {paintings.length === 0 ? (
            <div className="text-center py-20">
              <Palette className="h-24 w-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                No Paintings Available
              </h3>
              <p className="text-gray-500">
                Check back soon for new artwork from our talented students!
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Featured Paintings
                </h2>
                <p className="text-gray-600">
                  Explore {paintings.length} beautiful artworks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paintings.map((painting) => (
                  <Link
                    key={painting.id}
                    to={`/painting/${painting.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                      {/* Painting Image */}
                      <div className="relative h-64 sm:h-72 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        {painting.imageUrl ? (
                          <img
                            src={painting.imageUrl}
                            alt={painting.paintingName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Palette className="h-24 w-24 text-gray-300" />
                          </div>
                        )}
                        {/* Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                          <span className="text-sm font-semibold text-blue-600">
                            {painting.totalBidders} bidders
                          </span>
                        </div>
                      </div>

                      {/* Painting Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition">
                          {painting.paintingName}
                        </h3>
                        <p className="text-gray-600 mb-4 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          by {painting.artistName}
                        </p>

                        {/* Pricing */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Current Bid</p>
                            <div className="flex items-center">
                              <IndianRupee className="h-5 w-5 text-green-600" />
                              <span className="text-2xl font-bold text-gray-900">
                                {painting.currentPrice.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-1 group-hover:scale-105">
                            <TrendingUp className="h-4 w-4" />
                            <span>Bid Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-400">
              &copy; Developed with &#10084;&#65039; at Advanced Technology Lab, Naval Dockyard Mumbai.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
