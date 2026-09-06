import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "1036495147427-dmvgunrange.apps.googleusercontent.com";

const AuthModal = ({ isOpen, onClose, onForgotPassword }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleBtnRef = useRef(null);
  const { login, register, loginWithGoogle } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleGoogleResponse = useCallback(async (response) => {
    if (!response || !response.credential) return;
    setGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      toast.success('Signed in with Google successfully!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse
        });
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: 380,
            text: mode === 'login' ? 'signin_with' : 'signup_with'
          });
        }
      }
    };

    if (!window.google?.accounts?.id) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    } else {
      initializeGoogle();
    }
  }, [isOpen, mode, handleGoogleResponse]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (mode === 'register' && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Account created successfully!');
      }
      onClose();
    } catch (error) {
      const message = error.response?.data?.detail || 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setErrors({});
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            data-testid="close-auth-modal"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold" data-testid="auth-modal-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-white/80 mt-1">
            {mode === 'login' 
              ? 'Sign in to access your favorites' 
              : 'Join DMV Gun Range to save your favorite ranges'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Google Sign In */}
          <div className="flex flex-col items-center mb-6">
            <div ref={googleBtnRef} className="min-h-[40px] flex justify-center w-full"></div>
            {googleLoading && (
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                Signing in with Google...
              </div>
            )}
            
            <div className="relative w-full my-4 flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-700 w-full absolute"></div>
              <span className="bg-white dark:bg-slate-800 px-3 text-xs text-slate-400 relative uppercase font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`pl-10 h-12 ${errors.name ? 'border-red-500' : ''}`}
                    data-testid="register-name-input"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`pl-10 h-12 ${errors.email ? 'border-red-500' : ''}`}
                  data-testid="auth-email-input"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`pl-10 pr-10 h-12 ${errors.password ? 'border-red-500' : ''}`}
                  data-testid="auth-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-sm text-orange-500 hover:text-orange-600 mt-1"
                  data-testid="forgot-password-link"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 h-12 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    data-testid="register-confirm-password-input"
                  />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-orange-500 hover:bg-orange-600"
              disabled={loading}
              data-testid="auth-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <p className="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-orange-500 hover:text-orange-600 font-medium"
              data-testid="switch-auth-mode"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
