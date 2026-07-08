import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Globe, Clock, DollarSign, Shield, Target, Users, Award, Camera, ChevronLeft, ChevronRight, X, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import RangeReviews from "../components/RangeReviews";
import ShareButtons from "../components/ShareButtons";
import { RangeSEO } from "../components/SEO";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";
import { fetchRange } from "../services/api";
import LazyImage from "../components/LazyImage";

const RangeDetailPage = () => {
  const { id } = useParams();
  const [range, setRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { isAuthenticated, isFavorite, addFavorite, removeFavorite } = useAuth();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    loadRange();
  }, [id]);

  // Check favorite status when auth state or range changes
  useEffect(() => {
    if (isAuthenticated && id) {
      setIsFav(isFavorite(id));
    } else {
      setIsFav(false);
    }
  }, [isAuthenticated, id, isFavorite]);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (isFav) {
      const result = await removeFavorite(id);
      if (result.success) {
        setIsFav(false);
        toast.success('Removed from favorites');
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await addFavorite(id);
      if (result.success) {
        setIsFav(true);
        toast.success('Added to favorites!');
      } else {
        toast.error(result.error);
      }
    }
  };

  const loadRange = async () => {
    try {
      const data = await fetchRange(id);
      setRange(data);
    } catch (error) {
      console.error("Error loading range:", error);
      toast.error("Failed to load range details");
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setCurrentPhotoIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextPhoto = () => {
    if (range?.photos?.length > 0) {
      setCurrentPhotoIndex((prev) => (prev + 1) % range.photos.length);
    }
  };

  const prevPhoto = () => {
    if (range?.photos?.length > 0) {
      setCurrentPhotoIndex((prev) => (prev - 1 + range.photos.length) % range.photos.length);
    }
  };

  const formatHours = (hours) => {
    if (!hours) return "Hours not specified";
    const days = [
      { key: 'monday', label: 'Mon' },
      { key: 'tuesday', label: 'Tue' },
      { key: 'wednesday', label: 'Wed' },
      { key: 'thursday', label: 'Thu' },
      { key: 'friday', label: 'Fri' },
      { key: 'saturday', label: 'Sat' },
      { key: 'sunday', label: 'Sun' }
    ];
    
    return days.map(day => ({
      day: day.label,
      hours: hours[day.key] || 'Closed'
    }));
  };

  const getRangeCapabilities = (amenities) => {
    const capabilities = [];
    if (amenities.pistol_50ft || amenities.pistol_75ft || amenities.pistol_25yd || amenities.pistol_50yd) {
      capabilities.push('Pistol Ranges');
    }
    if (amenities.rifle_smallbore || amenities.rifle_centerfire || amenities.rifle_100yd || amenities.rifle_200yd || amenities.rifle_300yd || amenities.rifle_500yd) {
      capabilities.push('Rifle Ranges');
    }
    if (amenities.trap || amenities.skeet || amenities.sporting_clays) {
      capabilities.push('Shotgun Sports');
    }
    if (amenities.archery) capabilities.push('Archery');
    if (amenities.airgun) capabilities.push('Airgun');
    if (amenities.muzzle_loader) capabilities.push('Muzzle Loading');
    return capabilities;
  };

  const getServices = (amenities) => {
    const services = [];
    if (amenities.instruction) services.push('Professional Instruction');
    if (amenities.equipment_rentals) services.push('Equipment Rentals');
    if (amenities.retail_store) services.push('Pro Shop/Retail');
    if (amenities.hunter_education) services.push('Hunter Education');
    if (amenities.youth_programs) services.push('Youth Programs');
    if (amenities.womens_programs) services.push("Women's Programs");
    if (amenities.concealed_carry_classes) services.push('CCW Classes');
    if (amenities.basic_firearm_training) services.push('Basic Training');
    if (amenities.advanced_training) services.push('Advanced Training');
    return services;
  };

  const getCompetitions = (amenities) => {
    const competitions = [];
    if (amenities.uspsa) competitions.push('USPSA');
    if (amenities.idpa) competitions.push('IDPA');
    if (amenities.precision_pistol) competitions.push('Precision Pistol');
    if (amenities.practical_pistol) competitions.push('Action Pistol');
    if (amenities.three_gun) competitions.push('3-Gun');
    if (amenities.cowboy_action) competitions.push('Cowboy Action');
    if (amenities.smallbore_competition) competitions.push('Smallbore Rifle');
    if (amenities.centerfire_competition) competitions.push('Centerfire Rifle');
    if (amenities.rimfire_challenge) competitions.push('Rimfire Challenge');
    return competitions;
  };

  const getFacilities = (amenities) => {
    const facilities = [];
    if (amenities.clubhouse) facilities.push('Clubhouse/Lounge');
    if (amenities.food_service) facilities.push('Food Service');
    if (amenities.picnic_area) facilities.push('Picnic Areas');
    if (amenities.rv_sites) facilities.push('RV Sites');
    if (amenities.lodging) facilities.push('Lodging');
    if (amenities.climate_controlled) facilities.push('Climate Controlled');
    if (amenities.bulletproof_barriers) facilities.push('Bulletproof Barriers');
    if (amenities.ada_accessible) facilities.push('ADA Accessible');
    return facilities;
  };

  if (loading) {
    return (
      <div data-testid="loading-indicator" className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Loading range details...</p>
        </div>
      </div>
    );
  }

  if (!range) {
    return (
      <div data-testid="error-message" className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-slate-100">Range not found</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">The range you&apos;re looking for doesn&apos;t exist or may have been removed.</p>
          <Link to="/">
            <Button data-testid="back-to-search-button">Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 grid-pattern transition-colors duration-300">
      {/* SEO */}
      <RangeSEO range={range} />
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b-2 border-slate-200 dark:border-slate-700 transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/" data-testid="back-link">
                <Button variant="outline" size="sm" className="interactive-element dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
              {range.nssf_member && (
                <Badge data-testid="nssf-member-badge" className="tactical-badge">NSSF Member</Badge>
              )}
              {range.verified && (
                <Badge data-testid="verified-badge" className="bg-green-600 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
            
            {/* Favorite Button */}
            <Button
              onClick={handleFavoriteClick}
              variant={isFav ? "default" : "outline"}
              className={`flex items-center gap-2 ${isFav ? 'bg-red-500 hover:bg-red-600 text-white' : 'dark:border-slate-500 dark:text-slate-200 dark:hover:bg-slate-700'}`}
              data-testid="favorite-btn"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
              {isFav ? 'Saved' : 'Save to Favorites'}
            </Button>
          </div>
          
          <h1 data-testid="range-name" className="tactical-heading text-3xl md:text-4xl mb-2 dark:text-slate-100">{range.name}</h1>
          <p data-testid="range-address" className="text-slate-600 dark:text-slate-300 flex items-center mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            {range.location.address}, {range.location.city}, {range.location.state} {range.location.zip_code}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {range.amenities.indoor && (
              <Badge data-testid="indoor-badge" variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">Indoor Range</Badge>
            )}
            {range.amenities.outdoor && (
              <Badge data-testid="outdoor-badge" variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">Outdoor Range</Badge>
            )}
            {range.amenities.public_access && (
              <Badge data-testid="public-access-badge" variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">Public Access</Badge>
            )}
            {range.amenities.members_only && (
              <Badge data-testid="members-only-badge" variant="secondary" className="dark:bg-slate-700 dark:text-slate-200">Members Only</Badge>
            )}
          </div>
          
          {/* Share Buttons */}
          <ShareButtons 
            title={`${range.name} - Shooting Range in ${range.location.city}, ${range.location.state}`}
            description={range.description || `Check out ${range.name}, a shooting range in ${range.location.city}, ${range.location.state}`}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            {range.photos && range.photos.length > 0 && (
              <Card data-testid="photos-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="tactical-heading flex items-center dark:text-slate-100">
                    <Camera className="w-5 h-5 mr-2" />
                    Photos ({range.photos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {range.photos.map((photo, index) => (
                      <div 
                        key={index}
                        className="aspect-video cursor-pointer overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
                        onClick={() => openLightbox(index)}
                      >
                        <LazyImage
                          src={photo}
                          alt={`${range.name} - Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {range.description && (
              <Card data-testid="description-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="tactical-heading dark:text-slate-100">About This Range</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300">{range.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Range Capabilities */}
            <Card data-testid="capabilities-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="tactical-heading flex items-center dark:text-slate-100">
                  <Target className="w-5 h-5 mr-2" />
                  Range Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRangeCapabilities(range.amenities).map((capability, index) => (
                    <div key={index} data-testid={`capability-${index}`} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <div className="w-2 h-2 bg-orange-500 mr-3"></div>
                      <span className="font-medium dark:text-slate-200">{capability}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {getServices(range.amenities).length > 0 && (
              <Card data-testid="services-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="tactical-heading flex items-center dark:text-slate-100">
                    <Users className="w-5 h-5 mr-2" />
                    Services & Programs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getServices(range.amenities).map((service, index) => (
                      <div key={index} data-testid={`service-${index}`} className="flex items-center py-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 mr-3"></div>
                        <span className="dark:text-slate-200">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Competitions */}
            {getCompetitions(range.amenities).length > 0 && (
              <Card data-testid="competitions-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="tactical-heading flex items-center dark:text-slate-100">
                    <Award className="w-5 h-5 mr-2" />
                    Competitions & Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {getCompetitions(range.amenities).map((competition, index) => (
                      <Badge key={index} data-testid={`competition-${index}`} className="tactical-badge">
                        {competition}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Facilities */}
            {getFacilities(range.amenities).length > 0 && (
              <Card data-testid="facilities-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="tactical-heading dark:text-slate-100">Facilities & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getFacilities(range.amenities).map((facility, index) => (
                      <div key={index} data-testid={`facility-${index}`} className="flex items-center py-2">
                        <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 mr-3"></div>
                        <span className="dark:text-slate-200">{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <RangeReviews rangeId={range.id} rangeName={range.name} />
          </div>

          {/* Right Column - Contact & Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card data-testid="contact-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="tactical-heading dark:text-slate-100">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {range.phone && (
                  <div data-testid="phone-info" className="flex items-center">
                    <Phone className="w-5 h-5 mr-3 text-orange-500" />
                    <span className="font-medium dark:text-slate-200">{range.phone}</span>
                  </div>
                )}
                
                {range.website && (
                  <div data-testid="website-info" className="flex items-center">
                    <Globe className="w-5 h-5 mr-3 text-orange-500" />
                    <a 
                      href={range.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div data-testid="address-info" className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium dark:text-slate-200">{range.location.address}</div>
                    <div className="text-slate-600 dark:text-slate-400">
                      {range.location.city}, {range.location.state} {range.location.zip_code}
                    </div>
                  </div>
                </div>
                
                {range.google_maps_url && (
                  <Button 
                    data-testid="directions-button"
                    asChild 
                    className="w-full tactical-button"
                  >
                    <a href={range.google_maps_url} target="_blank" rel="noopener noreferrer">
                      Get Directions
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Hours */}
            <Card data-testid="hours-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
              <CardHeader>
                <CardTitle className="tactical-heading flex items-center dark:text-slate-100">
                  <Clock className="w-5 h-5 mr-2" />
                  Hours of Operation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {formatHours(range.hours).map((day, index) => (
                    <div key={index} data-testid={`hours-${day.day.toLowerCase()}`} className="flex justify-between text-sm">
                      <span className="font-medium dark:text-slate-200">{day.day}</span>
                      <span className="text-slate-600 dark:text-slate-400">{day.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            {range.pricing && (
              <Card data-testid="pricing-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardHeader>
                  <CardTitle className="tactical-heading flex items-center dark:text-slate-100">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {range.pricing.day_pass && (
                    <div data-testid="day-pass-price" className="flex justify-between">
                      <span className="dark:text-slate-300">Day Pass</span>
                      <span className="font-medium dark:text-slate-200">${range.pricing.day_pass}</span>
                    </div>
                  )}
                  
                  {range.pricing.hourly_rate && (
                    <div data-testid="hourly-rate-price" className="flex justify-between">
                      <span className="dark:text-slate-300">Hourly Rate</span>
                      <span className="font-medium dark:text-slate-200">${range.pricing.hourly_rate}/hr</span>
                    </div>
                  )}
                  
                  {range.pricing.monthly_membership && (
                    <div data-testid="monthly-membership-price" className="flex justify-between">
                      <span className="dark:text-slate-300">Monthly Membership</span>
                      <span className="font-medium dark:text-slate-200">${range.pricing.monthly_membership}/month</span>
                    </div>
                  )}
                  
                  {range.pricing.annual_membership && (
                    <div data-testid="annual-membership-price" className="flex justify-between">
                      <span className="dark:text-slate-300">Annual Membership</span>
                      <span className="font-medium dark:text-slate-200">${range.pricing.annual_membership}/year</span>
                    </div>
                  )}
                  
                  {range.pricing.notes && (
                    <>
                      <Separator className="dark:bg-slate-600" />
                      <p data-testid="pricing-notes" className="text-sm text-slate-600 dark:text-slate-400">{range.pricing.notes}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rating */}
            {range.google_rating && (
              <Card data-testid="rating-card" className="tactical-card dark:bg-slate-800 dark:border-slate-600">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div data-testid="google-rating" className="text-2xl font-bold text-orange-500 mb-1">
                      {range.google_rating} ⭐
                    </div>
                    <div data-testid="google-reviews" className="text-sm text-slate-600 dark:text-slate-400">
                      Based on {range.google_reviews} Google reviews
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Photo Lightbox */}
      {lightboxOpen && range.photos && range.photos.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-orange-500 transition-colors"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-orange-500 transition-colors p-2"
            onClick={(e) => { e.stopPropagation(); prevPhoto(); }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          
          <img
            src={range.photos[currentPhotoIndex]}
            alt={`${range.name} - Photo ${currentPhotoIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-orange-500 transition-colors p-2"
            onClick={(e) => { e.stopPropagation(); nextPhoto(); }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentPhotoIndex + 1} / {range.photos.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default RangeDetailPage;