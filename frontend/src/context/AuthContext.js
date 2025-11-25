import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedAdmin = localStorage.getItem('admin');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }

    setLoading(false);
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const loginAdmin = (adminData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setUser(null);
    setAdmin(null);
  };

  const isAuthenticated = () => {
    return !!user || !!admin;
  };

  const isAdmin = () => {
    return !!admin;
  };

  const isUser = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        loading,
        loginUser,
        loginAdmin,
        logout,
        isAuthenticated,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
