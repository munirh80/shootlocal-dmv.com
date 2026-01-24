import React, { useState, useEffect } from "react";
import { Search, MapPin, Filter, Navigation, Phone, Globe, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../components/ui/sheet";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import { Link } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [ranges, setRanges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState("20");
  const [stats, setStats] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    indoor: null,
    outdoor: null,
    nssf_member: null,
    public_access: null,
    instruction: null,
    equipment_rentals: null,
    retail_store: null,
    youth_programs: null,
    womens_programs: null,
    uspsa: null,
    idpa: null,
    precision_pistol: null,
    three_gun: null,
    handgun: null,
    rifle: null,
    shotgun: null,
    archery: null
  });

  // Load stats on component mount
  useEffect(() => {
    loadStats();
    loadInitialRanges();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadInitialRanges = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/ranges?limit=50`);
      setRanges(response.data);
    } catch (error) {
      console.error("Error loading ranges:", error);
      toast.error("Failed to load ranges");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          searchRanges(null, location);
          toast.success("Location detected successfully");
        },
        (error) => {
          toast.error("Unable to get your location. Please enter a city or ZIP code.");
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const searchRanges = async (query = searchQuery, location = userLocation) => {
    try {
      setLoading(true);
      
      let params = new URLSearchParams();
      
      // Add location parameters
      if (location) {
        params.append("latitude", location.latitude);
        params.append("longitude", location.longitude);
        params.append("radius", radius);
      }
      
      // Add search query parameters
      if (query) {
        // Check if it's a ZIP code or city
        if (/^\d{5}$/.test(query)) {
          params.append("zip_code", query);
        } else {
          params.append("city", query);
        }
      }
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null) {
          params.append(key, value);
        }
      });
      
      const response = await axios.get(`${API}/ranges?${params.toString()}`);
      setRanges(response.data);
      
      if (response.data.length === 0) {
        toast.info("No ranges found matching your criteria. Try adjusting your search or filters.");
      } else {
        toast.success(`Found ${response.data.length} ranges`);
      }
    } catch (error) {
      console.error("Error searching ranges:", error);
      toast.error("Failed to search ranges");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      indoor: null,
      outdoor: null,
      nssf_member: null,
      public_access: null,
      instruction: null,
      equipment_rentals: null,
      retail_store: null,
      youth_programs: null,
      womens_programs: null,
      uspsa: null,
      idpa: null,
      precision_pistol: null,
      three_gun: null,
      handgun: null,
      rifle: null,
      shotgun: null,
      archery: null
    });
  };

  const getAmenityBadges = (amenities) => {
    const badges = [];
    if (amenities.indoor) badges.push("Indoor");
    if (amenities.outdoor) badges.push("Outdoor");
    if (amenities.handgun) badges.push("Handgun");
    if (amenities.rifle) badges.push("Rifle");
    if (amenities.shotgun) badges.push("Shotgun");
    if (amenities.archery) badges.push("Archery");
    if (amenities.instruction) badges.push("Training");
    if (amenities.equipment_rentals) badges.push("Rentals");
    if (amenities.uspsa) badges.push("USPSA");
    if (amenities.idpa) badges.push("IDPA");
    return badges.slice(0, 4); // Show max 4 badges
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 data-testid="range-type-filter-header" className="tactical-heading text-sm mb-3">Range Type</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="indoor-filter-checkbox"
              checked={filters.indoor === true} 
              onCheckedChange={(checked) => handleFilterChange('indoor', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Indoor</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="outdoor-filter-checkbox"
              checked={filters.outdoor === true} 
              onCheckedChange={(checked) => handleFilterChange('outdoor', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Outdoor</span>
          </label>
        </div>
      </div>

      <div>
        <h3 data-testid="firearms-filter-header" className="tactical-heading text-sm mb-3">Firearms</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="handgun-filter-checkbox"
              checked={filters.handgun === true} 
              onCheckedChange={(checked) => handleFilterChange('handgun', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Handgun</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="rifle-filter-checkbox"
              checked={filters.rifle === true} 
              onCheckedChange={(checked) => handleFilterChange('rifle', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Rifle</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="shotgun-filter-checkbox"
              checked={filters.shotgun === true} 
              onCheckedChange={(checked) => handleFilterChange('shotgun', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Shotgun</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="archery-filter-checkbox"
              checked={filters.archery === true} 
              onCheckedChange={(checked) => handleFilterChange('archery', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Archery</span>
          </label>
        </div>
      </div>

      <div>
        <h3 data-testid="services-filter-header" className="tactical-heading text-sm mb-3">Services</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="instruction-filter-checkbox"
              checked={filters.instruction === true} 
              onCheckedChange={(checked) => handleFilterChange('instruction', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Instruction</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="rentals-filter-checkbox"
              checked={filters.equipment_rentals === true} 
              onCheckedChange={(checked) => handleFilterChange('equipment_rentals', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Equipment Rentals</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="retail-filter-checkbox"
              checked={filters.retail_store === true} 
              onCheckedChange={(checked) => handleFilterChange('retail_store', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Retail Store</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="youth-programs-filter-checkbox"
              checked={filters.youth_programs === true} 
              onCheckedChange={(checked) => handleFilterChange('youth_programs', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Youth Programs</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="womens-programs-filter-checkbox"
              checked={filters.womens_programs === true} 
              onCheckedChange={(checked) => handleFilterChange('womens_programs', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Women's Programs</span>
          </label>
        </div>
      </div>

      <div>
        <h3 data-testid="competitions-filter-header" className="tactical-heading text-sm mb-3">Competitions</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="uspsa-filter-checkbox"
              checked={filters.uspsa === true} 
              onCheckedChange={(checked) => handleFilterChange('uspsa', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">USPSA</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="idpa-filter-checkbox"
              checked={filters.idpa === true} 
              onCheckedChange={(checked) => handleFilterChange('idpa', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">IDPA</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="precision-pistol-filter-checkbox"
              checked={filters.precision_pistol === true} 
              onCheckedChange={(checked) => handleFilterChange('precision_pistol', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">Precision Pistol</span>
          </label>
          <label className="flex items-center space-x-2">
            <Checkbox 
              data-testid="three-gun-filter-checkbox"
              checked={filters.three_gun === true} 
              onCheckedChange={(checked) => handleFilterChange('three_gun', checked ? true : null)}
              className="tactical-checkbox"
            />
            <span className="text-sm font-medium">3-Gun</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Button 
          data-testid="clear-filters-button"
          variant="outline" 
          onClick={clearFilters} 
          className="w-full"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );

  const RangeCard = ({ range }) => (
    <Card data-testid={`range-card-${range.id}`} className="range-card mb-4 cursor-pointer" onClick={() => setSelectedRange(range)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="tactical-heading text-lg">{range.name}</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              <MapPin className="inline w-4 h-4 mr-1" />
              {range.location.address}, {range.location.city}, {range.location.state}
            </p>
            {range.distance && (
              <p className="text-xs text-slate-500">{range.distance.toFixed(1)} miles away</p>
            )}
          </div>
          {range.nssf_member && (
            <Badge data-testid={`nssf-badge-${range.id}`} className="tactical-badge">NSSF</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1 mb-3">
          {getAmenityBadges(range.amenities).map((badge, index) => (
            <Badge key={index} data-testid={`amenity-badge-${range.id}-${index}`} variant="secondary" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {range.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              <span>{range.phone}</span>
            </div>
          )}
          {range.website && (
            <div className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              <a 
                data-testid={`website-link-${range.id}`}
                href={range.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Website
              </a>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-100">
          <Link 
            to={`/range/${range.id}`} 
            data-testid={`view-details-link-${range.id}`}
            className="text-sm font-medium safety-orange hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            View Details →
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50 grid-pattern">
      {/* Header */}
      <header className="hero-bg text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 data-testid="main-heading" className="text-4xl md:text-6xl font-black tactical-heading mb-4">
              RANGEFINDER VA/MD
            </h1>
            <p data-testid="main-subtitle" className="text-lg md:text-xl mb-8 text-slate-200">
              Find Shooting Ranges in Virginia and Maryland
            </p>
            
            {stats && (
              <div className="flex justify-center gap-8 text-sm">
                <div data-testid="total-ranges-stat" className="text-center">
                  <div className="text-2xl font-bold safety-orange">{stats.total_ranges}</div>
                  <div className="text-slate-300">Total Ranges</div>
                </div>
                <div data-testid="va-ranges-stat" className="text-center">
                  <div className="text-2xl font-bold safety-orange">{stats.virginia_ranges}</div>
                  <div className="text-slate-300">Virginia</div>
                </div>
                <div data-testid="md-ranges-stat" className="text-center">
                  <div className="text-2xl font-bold safety-orange">{stats.maryland_ranges}</div>
                  <div className="text-slate-300">Maryland</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="bg-white border-b-2 border-slate-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex gap-2">
              <Input
                data-testid="search-input"
                placeholder="Enter city or ZIP code"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="tactical-input flex-1"
                onKeyDown={(e) => e.key === 'Enter' && searchRanges()}
              />
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger data-testid="radius-selector" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="20">20 miles</SelectItem>
                  <SelectItem value="40">40 miles</SelectItem>
                  <SelectItem value="80">80 miles</SelectItem>
                  <SelectItem value="160">160 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                data-testid="search-button"
                onClick={() => searchRanges()} 
                className="tactical-button"
                disabled={loading}
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
              
              <Button 
                data-testid="use-location-button"
                onClick={getCurrentLocation} 
                variant="outline" 
                className="interactive-element"
                disabled={loading}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Use My Location
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button data-testid="filter-button" variant="outline" className="interactive-element">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="tactical-heading">Filter Ranges</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterPanel />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="flex-1 py-6">
        <div className="container mx-auto px-4 h-full">
          <div className="flex gap-6 h-full">
            {/* Desktop Filter Panel */}
            <div className="hidden lg:block w-80 filter-panel p-6 h-fit sticky top-6">
              <h2 data-testid="desktop-filter-header" className="tactical-heading text-lg mb-6">Filter Ranges</h2>
              <FilterPanel />
            </div>
            
            {/* Results */}
            <div className="flex-1">
              <div className="mb-4 flex justify-between items-center">
                <h2 data-testid="results-header" className="tactical-heading text-xl">
                  {ranges.length > 0 ? `${ranges.length} Ranges Found` : 'No Ranges Found'}
                </h2>
                {userLocation && (
                  <Badge data-testid="location-badge" variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    Using your location
                  </Badge>
                )}
              </div>
              
              {loading ? (
                <div data-testid="loading-indicator" className="text-center py-12">
                  <div className="inline-flex items-center gap-2 text-slate-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-safety-orange"></div>
                    Searching ranges...
                  </div>
                </div>
              ) : (
                <div data-testid="results-container" className="results-scroll space-y-4">
                  {ranges.length > 0 ? (
                    ranges.map((range) => (
                      <RangeCard key={range.id} range={range} />
                    ))
                  ) : (
                    <div data-testid="no-results-message" className="text-center py-12 text-slate-600">
                      <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2">No ranges found</h3>
                      <p className="mb-4">Try adjusting your search criteria or expanding your radius.</p>
                      <Button data-testid="show-all-button" onClick={loadInitialRanges} variant="outline">
                        Show All Ranges
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;