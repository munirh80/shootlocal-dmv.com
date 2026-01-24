import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, Check, X, Eye, MapPin, Phone, Globe, Clock, 
  RefreshCw, Shield, AlertCircle, LogOut, Settings, Lock 
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { adminSession } from './AdminLogin';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!adminSession.checkSession()) {
      navigate('/admin');
      return;
    }
    loadSubmissions();
    loadStats();
  }, [navigate]);

  const handleLogout = () => {
    adminSession.clearSession();
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const getAuthHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${adminSession.getToken()}`
    }
  });

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    setChangingPassword(true);
    try {
      await axios.post(`${API_URL}/api/admin/change-password`, {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      }, getAuthHeaders());
      
      toast.success('Password changed successfully!');
      setShowSettings(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/admin/submissions`, getAuthHeaders());
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      if (error.response?.status === 401) {
        adminSession.clearSession();
        navigate('/admin');
        return;
      }
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleApprove = async (submissionId) => {
    setProcessing(true);
    try {
      await axios.post(`${API_URL}/api/admin/submissions/${submissionId}/approve`, {}, getAuthHeaders());
      toast.success('Range approved and added to directory!');
      loadSubmissions();
      loadStats();
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error approving submission:', error);
      if (error.response?.status === 401) {
        adminSession.clearSession();
        navigate('/admin');
        return;
      }
      toast.error('Failed to approve submission');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (submissionId) => {
    setProcessing(true);
    try {
      await axios.post(`${API_URL}/api/admin/submissions/${submissionId}/reject`, {}, getAuthHeaders());
      toast.success('Submission rejected');
      loadSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error rejecting submission:', error);
      if (error.response?.status === 401) {
        adminSession.clearSession();
        navigate('/admin');
        return;
      }
      toast.error('Failed to reject submission');
    } finally {
      setProcessing(false);
    }
  };

  const formatHours = (hours) => {
    if (!hours) return 'Not provided';
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.map(day => {
      const value = hours[day];
      return value ? `${day.charAt(0).toUpperCase() + day.slice(1)}: ${value}` : null;
    }).filter(Boolean).join(', ') || 'Not provided';
  };

  const getAmenityList = (amenities) => {
    if (!amenities) return [];
    return Object.entries(amenities)
      .filter(([_, value]) => value === true)
      .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  };

  const SubmissionCard = ({ submission }) => (
    <Card 
      data-testid={`submission-card-${submission.id}`}
      className="cursor-pointer hover:border-orange-500 transition-colors"
      onClick={() => setSelectedSubmission(submission)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{submission.name}</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              <MapPin className="inline w-4 h-4 mr-1" />
              {submission.location?.city}, {submission.location?.state}
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pending Review
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4 text-sm text-slate-600">
          {submission.phone && (
            <span className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {submission.phone}
            </span>
          )}
          {submission.website && (
            <span className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Website
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubmission(submission);
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const SubmissionDetail = ({ submission }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{submission.name}</h2>
              <Badge variant="outline" className="mt-2 bg-yellow-100 text-yellow-800">
                Pending Review
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(null)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Location */}
          <section className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Location
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              <p>{submission.location?.address}</p>
              <p>{submission.location?.city}, {submission.location?.state} {submission.location?.zip_code}</p>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-orange-500" />
              Contact Information
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg space-y-2">
              {submission.phone && <p><strong>Phone:</strong> {submission.phone}</p>}
              {submission.email && <p><strong>Email:</strong> {submission.email}</p>}
              {submission.website && (
                <p>
                  <strong>Website:</strong>{' '}
                  <a href={submission.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {submission.website}
                  </a>
                </p>
              )}
              {!submission.phone && !submission.email && !submission.website && (
                <p className="text-slate-500">No contact info provided</p>
              )}
            </div>
          </section>

          {/* Hours */}
          <section className="mb-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Hours of Operation
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              {submission.hours ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}:</span>
                      <span>{submission.hours[day] || 'Not set'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Hours not provided</p>
              )}
            </div>
          </section>

          {/* Amenities */}
          <section className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Amenities</h3>
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
              {getAmenityList(submission.amenities).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {getAmenityList(submission.amenities).map((amenity, idx) => (
                    <Badge key={idx} variant="secondary">{amenity}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No amenities specified</p>
              )}
            </div>
          </section>

          {/* Description */}
          {submission.description && (
            <section className="mb-6">
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <p>{submission.description}</p>
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              data-testid="approve-btn"
              onClick={() => handleApprove(submission.id)}
              disabled={processing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : 'Approve & Add to Directory'}
            </Button>
            <Button
              data-testid="reject-btn"
              onClick={() => handleReject(submission.id)}
              disabled={processing}
              variant="destructive"
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                data-testid="back-btn"
                onClick={() => navigate('/')}
                className="flex items-center text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Directory
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">Admin Dashboard</span>
              </div>
              <Button
                data-testid="logout-btn"
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-slate-300 border-slate-600 hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">{submissions.length}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Pending Reviews</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">{stats?.total_ranges || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Ranges</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{stats?.virginia_ranges || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Virginia</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">{stats?.maryland_ranges || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Maryland</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 data-testid="admin-title" className="text-2xl font-bold dark:text-white">
            Pending Range Submissions
          </h1>
          <Button 
            data-testid="refresh-btn"
            variant="outline" 
            onClick={loadSubmissions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-slate-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
              Loading submissions...
            </div>
          </div>
        ) : submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-slate-600 dark:text-slate-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">No Pending Submissions</h3>
                <p>All range submissions have been reviewed. Check back later!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetail submission={selectedSubmission} />
      )}
    </div>
  );
};

export default AdminDashboard;
