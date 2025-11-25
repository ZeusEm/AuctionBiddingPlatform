import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Only add token if it exists and is not null/undefined
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect for bid endpoint - let the component handle it
    if (error.config?.url?.includes('/bid')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  checkMobile: (mobile) => api.get(`/auth/check-mobile/${mobile}`), // ✅ NOW ACTUALLY FIXED!
};

// Admin API
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getUsers: () => api.get('/admin/users'),
  getPaintings: () => api.get('/admin/paintings'),
  createPainting: (paintingData) => api.post('/admin/paintings', paintingData),
  
  // ✅ NOW ACTUALLY FIXED - updatePainting
  updatePainting: (id, paintingData) => api.put(`/admin/paintings/${id}`, paintingData),
  
  deletePainting: (id) => api.delete(`/admin/paintings/${id}`), // ✅ NOW ACTUALLY FIXED!
  getQRCode: (id) => api.get(`/admin/paintings/${id}/qrcode`), // ✅ NOW ACTUALLY FIXED!
  getBids: () => api.get('/admin/bids'),
  getAuctionSettings: () => api.get('/admin/auction-settings'),
  updateAuctionSettings: (settings) => api.put('/admin/auction-settings', settings),
  
  // Excel download
  downloadBiddingRankExcel: () => 
    api.get('/admin/generate-bidding-rank-excel', {
      responseType: 'blob',
    }),
};

// Create a separate axios instance for guest bids that doesn't redirect or add auth
export const guestAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Painting API
export const paintingAPI = {
  getAllPaintings: () => api.get('/paintings'),
  getPainting: (id) => api.get(`/paintings/${id}`), // ✅ NOW ACTUALLY FIXED!
  
  // Use authenticated API for logged-in users
  placeBid: (bidData) => api.post('/paintings/bid', bidData),
  
  // Add guest bid function without auth
  placeGuestBid: (bidData) => guestAPI.post('/paintings/bid', bidData),
  
  getUserBids: (mobile) => api.get(`/paintings/user-bids?mobile=${mobile}`), // ✅ NOW ACTUALLY FIXED!
};

export default api;