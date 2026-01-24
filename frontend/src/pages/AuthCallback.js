import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use ref to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      // Extract session_id from URL hash
      const hash = location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);
      
      if (!sessionIdMatch) {
        toast.error('Authentication failed: No session ID found');
        navigate('/');
        return;
      }

      const sessionId = sessionIdMatch[1];

      try {
        const result = await processGoogleCallback(sessionId);
        
        if (result.success) {
          toast.success(`Welcome, ${result.user.name}!`);
          navigate('/');
        } else {
          toast.error(result.error || 'Authentication failed');
          navigate('/');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/');
      }
    };

    handleCallback();
  }, [location, navigate, processGoogleCallback]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
          Completing sign in...
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Please wait while we authenticate your account.
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
