import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('userToken');
  }, []);

  const verifyToken = useCallback(async (tokenToVerify) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      setUser(response.data);
      setToken(tokenToVerify);
      return true;
    } catch {
      // Token invalid, clear session
      logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    // Check for existing session
    const savedToken = localStorage.getItem('userToken');
    
    if (savedToken) {
      verifyToken(savedToken).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    
    const { token: newToken, user: userData } = response.data;
    
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('userToken', newToken);
    
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
    
    return response.data;
  };

  // Login with Google OAuth
  const loginWithGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Process Google OAuth callback
  const processGoogleCallback = async (sessionId) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/google/callback`, {
        session_id: sessionId
      });
      
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, error: 'Google authentication failed' };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Authentication failed' };
    }
  };

  const getAuthHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  // Add favorite
  const addFavorite = async (rangeId) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      await axios.post(`${API_URL}/api/favorites/${rangeId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update user favorites locally
      setUser(prev => ({
        ...prev,
        favorites: [...(prev?.favorites || []), rangeId]
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add favorite' };
    }
  };

  // Remove favorite
  const removeFavorite = async (rangeId) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    
    try {
      await axios.delete(`${API_URL}/api/favorites/${rangeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update user favorites locally
      setUser(prev => ({
        ...prev,
        favorites: (prev?.favorites || []).filter(id => id !== rangeId)
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to remove favorite' };
    }
  };

  // Check if a range is favorited
  const isFavorite = (rangeId) => {
    return user?.favorites?.includes(rangeId) || false;
  };

  // Get user's favorite ranges
  const getFavorites = useCallback(async () => {
    if (!token) return [];
    
    try {
      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch {
      return [];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      loginWithGoogle,
      processGoogleCallback,
      logout,
      getAuthHeaders,
      addFavorite,
      removeFavorite,
      isFavorite,
      getFavorites
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
