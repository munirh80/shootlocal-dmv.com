import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon for ranges
const rangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to fit map bounds to all markers
function FitBounds({ ranges }) {
  const map = useMap();
  
  useEffect(() => {
    if (ranges && ranges.length > 0) {
      const validRanges = ranges.filter(r => 
        r.location?.latitude && r.location?.longitude
      );
      
      if (validRanges.length > 0) {
        const bounds = L.latLngBounds(
          validRanges.map(r => [r.location.latitude, r.location.longitude])
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [ranges, map]);
  
  return null;
}

export const RangeMap = ({ ranges, onRangeClick, selectedRange, height = "400px" }) => {
  const [mapReady, setMapReady] = useState(false);
  
  // Filter ranges with valid coordinates
  const validRanges = ranges?.filter(r => 
    r.location?.latitude && r.location?.longitude
  ) || [];
  
  // Default center (DMV area)
  const defaultCenter = [38.9, -77.0];
  
  // Calculate center from valid ranges or use default
  const center = validRanges.length > 0
    ? [
        validRanges.reduce((sum, r) => sum + r.location.latitude, 0) / validRanges.length,
        validRanges.reduce((sum, r) => sum + r.location.longitude, 0) / validRanges.length
      ]
    : defaultCenter;

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div 
        data-testid="map-loading"
        className="flex items-center justify-center bg-slate-800 rounded-lg"
        style={{ height }}
      >
        <div className="text-slate-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div data-testid="range-map-container" className="rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds ranges={validRanges} />
        
        {validRanges.map((range) => (
          <Marker
            key={range.id}
            position={[range.location.latitude, range.location.longitude]}
            icon={rangeIcon}
            eventHandlers={{
              click: () => onRangeClick && onRangeClick(range)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{range.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {range.location.city}, {range.location.state}
                </p>
                <div className="flex gap-2 mb-2">
                  {range.amenities?.indoor && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">Indoor</span>
                  )}
                  {range.amenities?.outdoor && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Outdoor</span>
                  )}
                </div>
                {range.phone && (
                  <p className="text-sm">
                    <a href={`tel:${range.phone}`} className="text-blue-600 hover:underline">
                      {range.phone}
                    </a>
                  </p>
                )}
                <button
                  onClick={() => onRangeClick && onRangeClick(range)}
                  className="mt-2 w-full px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {validRanges.length === 0 && (
        <div 
          data-testid="no-coordinates-message"
          className="absolute inset-0 flex items-center justify-center bg-slate-800/80 text-slate-300"
        >
          No ranges with location data available
        </div>
      )}
      
      <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400">
        Showing {validRanges.length} of {ranges?.length || 0} ranges on map
      </div>
    </div>
  );
};

export default RangeMap;
