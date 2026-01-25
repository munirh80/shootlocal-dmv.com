import React, { useState } from 'react';
import { X, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            data-testid="close-forgot-password-modal"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold" data-testid="forgot-password-title">
            {submitted ? 'Check Your Email' : 'Forgot Password'}
          </h2>
          <p className="text-white/80 mt-1">
            {submitted 
              ? 'We sent you a password reset link' 
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                If an account exists with <strong>{email}</strong>, you'll receive a password reset link shortly.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Don't see it? Check your spam folder or try again.
              </p>
              <Button
                onClick={onBackToLogin}
                className="w-full bg-orange-500 hover:bg-orange-600"
                data-testid="back-to-login-btn"
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="reset-email" className="text-sm font-medium">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className={`pl-10 h-12 ${error ? 'border-red-500' : ''}`}
                    data-testid="forgot-password-email-input"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-orange-500 hover:bg-orange-600"
                disabled={loading}
                data-testid="send-reset-link-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors mt-4"
                data-testid="back-to-login-link"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
