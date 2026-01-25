import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Trash2, ArrowLeft, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to view your profile');
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const isGoogleUser = user?.auth_provider === 'google';

  const handleUpdateName = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSavingName(true);

    try {
      await axios.put(
        `${API_URL}/api/auth/profile`,
        { name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Name updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update name');
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Current password is required');
      return;
    }

    if (!newPassword) {
      toast.error('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/change-password`,
        { 
          current_password: currentPassword,
          new_password: newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setDeletingAccount(true);

    try {
      await axios.delete(
        `${API_URL}/api/auth/account`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete account');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-800 to-slate-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Back to Directory
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold" data-testid="profile-title">My Profile</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Account Type Badge */}
        <div className="mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Account type: <span className="font-medium">{isGoogleUser ? 'Google Account' : 'Email & Password'}</span>
          </span>
        </div>

        {/* Profile Info */}
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="pl-10 bg-slate-100 dark:bg-slate-700"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    data-testid="profile-name-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={savingName}
                className="bg-orange-500 hover:bg-orange-600"
                data-testid="save-name-btn"
              >
                {savingName ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Name'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password - Only for email/password users */}
        {!isGoogleUser && (
          <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1"
                    data-testid="current-password-input"
                  />
                </div>

                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1"
                    data-testid="new-password-input"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1"
                    data-testid="confirm-password-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-orange-500 hover:bg-orange-600"
                  data-testid="change-password-btn"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Delete Account */}
        <Card className="border-red-200 dark:border-red-900 dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Once you delete your account, there is no going back. All your data including favorites and reviews will be permanently removed.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  data-testid="delete-account-btn"
                >
                  Delete My Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-600">Are you absolutely sure?</p>
                    <p className="text-sm text-red-600/80 mt-1">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="delete-confirm">Type DELETE to confirm</Label>
                  <Input
                    id="delete-confirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="mt-1"
                    placeholder="DELETE"
                    data-testid="delete-confirm-input"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || deleteConfirmText !== 'DELETE'}
                    data-testid="confirm-delete-btn"
                  >
                    {deletingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Permanently Delete'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
