import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { ArrowLeft, Send, MapPin, Phone, Globe, Clock, Camera, X, Upload } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const SubmitRangePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    website: '',
    email: '',
    address: '',
    city: '',
    state: 'VA',
    zip_code: '',
    description: '',
    photos: [],
    hours: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    amenities: {
      indoor: false,
      outdoor: false,
      handgun: false,
      rifle: false,
      shotgun: false,
      archery: false,
      equipment_rentals: false,
      instruction: false,
      retail_store: false,
      concealed_carry_classes: false,
      basic_firearm_training: false,
      advanced_training: false,
      trap: false,
      skeet: false,
      sporting_clays: false,
      ada_accessible: false,
      climate_controlled: false,
      public_access: true,
      members_only: false
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      hours: { ...prev.hours, [day]: value }
    }));
  };

  const handleAmenityChange = (amenity, checked) => {
    setFormData(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [amenity]: checked }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await fetch(`${API_URL}/api/ranges/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit range');
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Send className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Submission Received!</h1>
            <p className="text-slate-300 mb-8">
              Thank you for submitting your range. Our team will review your submission and add it to the directory within 2-3 business days.
            </p>
            <Button
              data-testid="back-to-home-btn"
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            data-testid="back-btn"
            onClick={() => navigate('/')}
            className="flex items-center text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Directory
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 data-testid="submit-page-title" className="text-3xl font-bold mb-2">Submit Your Range</h1>
          <p className="text-slate-400">
            Own or manage a shooting range in the DMV area? Submit your range to be included in our directory.
          </p>
        </div>

        {submitError && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="name">Range Name *</Label>
                <Input
                  data-testid="input-name"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-700 border-slate-600"
                  placeholder="e.g., DMV Shooting Range"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  data-testid="input-phone"
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-slate-600"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  data-testid="input-email"
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-slate-600"
                  placeholder="contact@yourrange.com"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  data-testid="input-website"
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="bg-slate-700 border-slate-600"
                  placeholder="https://www.yourrange.com"
                />
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-orange-500" />
              Location
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  data-testid="input-address"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-700 border-slate-600"
                  placeholder="123 Range Road"
                />
              </div>
              
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  data-testid="input-city"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-700 border-slate-600"
                  placeholder="Arlington"
                />
              </div>
              
              <div>
                <Label htmlFor="state">State *</Label>
                <select
                  data-testid="input-state"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white"
                >
                  <option value="VA">Virginia</option>
                  <option value="MD">Maryland</option>
                  <option value="DC">District of Columbia</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  data-testid="input-zip"
                  id="zip_code"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-700 border-slate-600"
                  placeholder="22201"
                />
              </div>
            </div>
          </section>

          {/* Hours */}
          <section className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-500" />
              Hours of Operation
            </h2>
            
            <div className="space-y-3">
              {DAYS.map(day => (
                <div key={day} className="flex items-center gap-4">
                  <Label className="w-28 capitalize">{day}</Label>
                  <Input
                    data-testid={`input-hours-${day}`}
                    value={formData.hours[day]}
                    onChange={(e) => handleHoursChange(day, e.target.value)}
                    className="bg-slate-700 border-slate-600 flex-1"
                    placeholder="e.g., 9AM-8PM or Closed"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Range Type & Amenities</h2>
            
            <div className="space-y-6">
              {/* Range Type */}
              <div>
                <h3 className="font-medium text-slate-300 mb-3">Range Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['indoor', 'outdoor'].map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        data-testid={`checkbox-${amenity}`}
                        checked={formData.amenities[amenity]}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                      />
                      <span className="capitalize">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Firearms */}
              <div>
                <h3 className="font-medium text-slate-300 mb-3">Firearms Allowed</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['handgun', 'rifle', 'shotgun', 'archery'].map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        data-testid={`checkbox-${amenity}`}
                        checked={formData.amenities[amenity]}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                      />
                      <span className="capitalize">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="font-medium text-slate-300 mb-3">Services</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'equipment_rentals', label: 'Equipment Rentals' },
                    { key: 'instruction', label: 'Instruction' },
                    { key: 'retail_store', label: 'Retail Store' },
                    { key: 'concealed_carry_classes', label: 'Concealed Carry Classes' },
                    { key: 'basic_firearm_training', label: 'Basic Training' },
                    { key: 'advanced_training', label: 'Advanced Training' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        data-testid={`checkbox-${key}`}
                        checked={formData.amenities[key]}
                        onCheckedChange={(checked) => handleAmenityChange(key, checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shotgun Sports */}
              <div>
                <h3 className="font-medium text-slate-300 mb-3">Shotgun Sports</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['trap', 'skeet', 'sporting_clays'].map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        data-testid={`checkbox-${amenity}`}
                        checked={formData.amenities[amenity]}
                        onCheckedChange={(checked) => handleAmenityChange(amenity, checked)}
                      />
                      <span className="capitalize">{amenity.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="font-medium text-slate-300 mb-3">Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'ada_accessible', label: 'ADA Accessible' },
                    { key: 'climate_controlled', label: 'Climate Controlled' },
                    { key: 'public_access', label: 'Public Access' },
                    { key: 'members_only', label: 'Members Only' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        data-testid={`checkbox-${key}`}
                        checked={formData.amenities[key]}
                        onCheckedChange={(checked) => handleAmenityChange(key, checked)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
            <Label htmlFor="description">Description</Label>
            <textarea
              data-testid="input-description"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white"
              placeholder="Tell us about your range, special features, history, etc."
            />
          </section>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              data-testid="submit-range-btn"
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 px-8"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Range
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitRangePage;
