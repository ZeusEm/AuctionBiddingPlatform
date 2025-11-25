import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { ArrowLeft, Plus, QrCode, Edit, Trash } from 'lucide-react';

const AdminPaintings = () => {
  const [paintings, setPaintings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPainting, setEditingPainting] = useState(null);
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
      console.error('Fetch paintings error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      artistName: '',
      paintingName: '',
      basePrice: '',
      imageUrl: ''
    });
    setEditingPainting(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.artistName.trim()) {
      toast.error('Artist name is required');
      return;
    }
    if (!formData.paintingName.trim()) {
      toast.error('Painting name is required');
      return;
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      toast.error('Base price must be greater than 0');
      return;
    }

    try {
      await adminAPI.createPainting(formData);
      toast.success('Painting added successfully!');
      setShowAddModal(false);
      resetForm();
      fetchPaintings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add painting');
      console.error('Add painting error:', error);
    }
  };

  const openEditModal = (painting) => {
    setEditingPainting(painting);
    setFormData({
      artistName: painting.artistName,
      paintingName: painting.paintingName,
      basePrice: painting.basePrice.toString(),
      imageUrl: painting.imageUrl || ''
    });
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.artistName.trim()) {
      toast.error('Artist name is required');
      return;
    }
    if (!formData.paintingName.trim()) {
      toast.error('Painting name is required');
      return;
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      toast.error('Base price must be greater than 0');
      return;
    }

    try {
      await adminAPI.updatePainting(editingPainting.id, formData);
      toast.success('Painting updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchPaintings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update painting');
      console.error('Update painting error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this painting? This action cannot be undone.')) {
      return;
    }
    
    try {
      await adminAPI.deletePainting(id);
      toast.success('Painting deleted successfully!');
      fetchPaintings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete painting');
      console.error('Delete painting error:', error);
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
      toast.error(error.response?.data?.message || 'Failed to generate QR code');
      console.error('Generate QR error:', error);
    }
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading paintings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Painting</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {paintings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">No paintings added yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Your First Painting</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paintings.map((painting) => (
              <div key={painting.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {painting.imageUrl ? (
                    <img 
                      src={painting.imageUrl} 
                      alt={painting.paintingName} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<span class="text-gray-400">Image Failed to Load</span>';
                      }}
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 truncate" title={painting.paintingName}>
                    {painting.paintingName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 truncate" title={painting.artistName}>
                    by {painting.artistName}
                  </p>
                  <p className="text-lg font-semibold text-blue-600 mb-4">
                    ₹{painting.basePrice.toLocaleString('en-IN')}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateQR(painting.id)}
                      className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center justify-center transition-colors"
                      title="Download QR Code"
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      <span className="text-sm">QR</span>
                    </button>
                    
                    <button
                      onClick={() => openEditModal(painting)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center transition-colors"
                      title="Edit Painting"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      <span className="text-sm">Edit</span>
                    </button>
                    
                    <button
                      onClick={() => handleDelete(painting.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex items-center justify-center transition-colors"
                      title="Delete Painting"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      <span className="text-sm">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Painting</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter artist name"
                  value={formData.artistName}
                  onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Painting Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter painting name"
                  value={formData.paintingName}
                  onChange={(e) => setFormData({...formData, paintingName: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter base price"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  required
                  min="1"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste image URL from ImgBB, Imgur, or Google Drive
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add Painting
                </button>
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPainting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Painting</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter artist name"
                  value={formData.artistName}
                  onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Painting Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter painting name"
                  value={formData.paintingName}
                  onChange={(e) => setFormData({...formData, paintingName: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter base price"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  required
                  min="1"
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste image URL from ImgBB, Imgur, or Google Drive
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Update Painting
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
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