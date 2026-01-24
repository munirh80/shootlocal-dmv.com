import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('userToken');
    const savedUser = localStorage.getItem('userData');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Verify token is still valid
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      // Token invalid, clear session
      logout();
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('userToken', newToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name,
      email,
      password
    });
    
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('userToken', newToken);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return response.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      getAuthHeaders
    }}>
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
