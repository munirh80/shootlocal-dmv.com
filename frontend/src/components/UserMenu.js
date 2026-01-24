import React, { useState } from 'react';
import { User, Heart, LogOut, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

const UserMenu = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <Button
          onClick={() => setShowAuthModal(true)}
          variant="outline"
          className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
          data-testid="login-btn"
        >
          <User className="w-4 h-4" />
          Sign In
        </Button>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
        data-testid="user-menu-btn"
      >
        {user?.picture ? (
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        )}
        <span className="text-white font-medium hidden sm:block max-w-[120px] truncate">
          {user?.name}
        </span>
        <ChevronDown className="w-4 h-4 text-white/70" />
      </button>

      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="font-medium text-slate-800 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-2">
              <Link
                to="/favorites"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                data-testid="favorites-link"
              >
                <Heart className="w-4 h-4" />
                My Favorites
              </Link>
              
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;
