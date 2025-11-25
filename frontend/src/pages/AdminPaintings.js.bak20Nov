import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { ArrowLeft, Plus, QrCode, Edit, Trash } from 'lucide-react';

const AdminPaintings = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    artistName: '',
    paintingName: '',
    basePrice: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchPaintings();
  }, []);

  const fetchPaintings = async () => {
    try {
      const response = await adminAPI.getPaintings();
      setPaintings(response.data.data.paintings);
    } catch (error) {
      toast.error('Failed to load paintings');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createPainting(formData);
      toast.success('Painting added successfully!');
      setShowAddModal(false);
      setFormData({ artistName: '', paintingName: '', basePrice: '', imageUrl: '' });
      fetchPaintings();
    } catch (error) {
      toast.error('Failed to add painting');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this painting?')) return;
    try {
      await adminAPI.deletePainting(id);
      toast.success('Painting deleted successfully!');
      fetchPaintings();
    } catch (error) {
      toast.error('Failed to delete painting');
    }
  };

  const handleGenerateQR = async (id) => {
    try {
      const response = await adminAPI.getQRCode(id);
      const qrCode = response.data.data.painting.qrCode;
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `painting-${id}-qr.png`;
      link.click();
      toast.success('QR Code downloaded!');
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/admin/dashboard" className="text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold">Manage Paintings</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Painting</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paintings.map((painting) => (
            <div key={painting.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {painting.imageUrl ? (
                  <img src={painting.imageUrl} alt={painting.paintingName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{painting.paintingName}</h3>
                <p className="text-gray-600 text-sm mb-2">by {painting.artistName}</p>
                <p className="text-lg font-semibold text-blue-600 mb-4">₹{painting.basePrice.toLocaleString()}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateQR(painting.id)}
                    className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center"
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    QR
                  </button>
                  <button
                    onClick={() => handleDelete(painting.id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add New Painting</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                type="text"
                placeholder="Artist Name"
                value={formData.artistName}
                onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Painting Name"
                value={formData.paintingName}
                onChange={(e) => setFormData({...formData, paintingName: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Base Price"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="url"
                placeholder="Image URL (optional)"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex space-x-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaintings;
