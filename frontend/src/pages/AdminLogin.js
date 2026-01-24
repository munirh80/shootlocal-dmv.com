import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Store admin session in memory (will be cleared on page refresh)
export const adminSession = {
  isAuthenticated: false,
  token: null,
  
  setSession(token) {
    this.isAuthenticated = true;
    this.token = token;
    sessionStorage.setItem('adminToken', token);
  },
  
  clearSession() {
    this.isAuthenticated = false;
    this.token = null;
    sessionStorage.removeItem('adminToken');
  },
  
  checkSession() {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
      this.isAuthenticated = true;
      this.token = token;
      return true;
    }
    return false;
  },
  
  getToken() {
    return this.token || sessionStorage.getItem('adminToken');
  }
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, {
        password: password
      });
      
      if (response.data.success) {
        adminSession.setSession(response.data.token);
        toast.success('Login successful!');
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.detail || 'Invalid password');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-orange-500" />
          </div>
          <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
          <p className="text-slate-400 text-sm mt-2">
            Enter the admin password to access the dashboard
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  data-testid="admin-password-input"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button
              data-testid="admin-login-btn"
              type="submit"
              disabled={loading || !password}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-slate-400 hover:text-slate-300"
              >
                ← Back to Directory
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
