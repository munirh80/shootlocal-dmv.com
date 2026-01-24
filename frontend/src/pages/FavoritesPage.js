import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, Globe, ArrowLeft, Loader2, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, getFavorites, removeFavorite, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error('Please sign in to view your favorites');
      navigate('/');
      return;
    }

    if (isAuthenticated) {
      loadFavorites();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (rangeId, rangeName) => {
    const result = await removeFavorite(rangeId);
    if (result.success) {
      setFavorites(prev => prev.filter(r => r.id !== rangeId));
      toast.success(`Removed ${rangeName} from favorites`);
    } else {
      toast.error(result.error || 'Failed to remove favorite');
    }
  };

  const getAmenityBadges = (amenities) => {
    if (!amenities) return [];
    const badges = [];
    if (amenities.indoor) badges.push('Indoor');
    if (amenities.outdoor) badges.push('Outdoor');
    if (amenities.handgun) badges.push('Handgun');
    if (amenities.rifle) badges.push('Rifle');
    if (amenities.instruction) badges.push('Training');
    return badges.slice(0, 4);
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
            <Heart className="w-8 h-8 text-orange-500" fill="currentColor" />
            <h1 className="text-3xl font-bold" data-testid="favorites-title">My Favorite Ranges</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No favorites yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start exploring shooting ranges and click the heart icon to save your favorites!
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="browse-ranges-btn"
            >
              Browse Ranges
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((range) => (
              <Card 
                key={range.id} 
                className="hover:shadow-lg transition-shadow dark:bg-slate-800 dark:border-slate-700"
                data-testid={`favorite-card-${range.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">
                      {range.name}
                    </CardTitle>
                    <button
                      onClick={() => handleRemoveFavorite(range.id, range.name)}
                      className="text-red-500 hover:text-red-600 transition-colors p-1"
                      title="Remove from favorites"
                      data-testid={`remove-favorite-${range.id}`}
                    >
                      <Heart className="w-5 h-5" fill="currentColor" />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {range.location?.city}, {range.location?.state}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {getAmenityBadges(range.amenities).map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {range.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span className="truncate max-w-[100px]">{range.phone}</span>
                      </div>
                    )}
                    {range.website && (
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        <a 
                          href={range.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/range/${range.id}`}
                    className="block w-full"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full"
                      data-testid={`view-details-${range.id}`}
                    >
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
