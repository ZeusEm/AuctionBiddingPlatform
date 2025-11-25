// Frontend Component: Add this button to your Admin Dashboard

import React, { useState } from 'react';
import axios from 'axios';

const ExcelDownloadButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken'); // Adjust based on your auth storage
      
      const response = await axios.get(
        'http://80.225.198.104:5000/api/admin/generate-bidding-rank-excel',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob', // Important for file download
        }
      );

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

      setIsLoading(false);
    } catch (err) {
      console.error('Error downloading Excel:', err);
      setError('Failed to download Excel file. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="excel-download-container">
      <button
        onClick={handleDownloadExcel}
        disabled={isLoading}
        className="excel-download-btn"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Generating Excel...
          </>
        ) : (
          <>
            <svg 
              className="download-icon" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            Download Bidding Ranks (Excel)
          </>
        )}
      </button>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <style jsx>{`
        .excel-download-container {
          margin: 20px 0;
        }

        .excel-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #1e7e34 0%, #28a745 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .excel-download-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #155d27 0%, #1e7e34 100%);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .excel-download-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .excel-download-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .download-icon {
          width: 24px;
          height: 24px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          margin-top: 10px;
          padding: 12px;
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          font-size: 14px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .excel-download-btn {
            width: 100%;
            justify-content: center;
            padding: 14px 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default ExcelDownloadButton;