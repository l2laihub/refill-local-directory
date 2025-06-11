import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// We'll create our own map implementation instead of using react-map-gl
// since there seems to be a package resolution issue

// Get Mapbox token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Initialize Mapbox if token is available
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapboxMapProps {
  locations: Location[];
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
  height?: string;
  width?: string;
  interactive?: boolean;
  className?: string;
  onMarkerClick?: (location: Location) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  locations,
  initialLatitude = 37.7749,
  initialLongitude = -122.4194,
  initialZoom = 12,
  height = '400px',
  width = '100%',
  interactive = true,
  className = '',
  onMarkerClick
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const [popupInfo, setPopupInfo] = useState<Location | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popup = useRef<mapboxgl.Popup | null>(null);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapRef.current || !MAPBOX_TOKEN) return;
    
    // Create map
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialLongitude, initialLatitude],
      zoom: initialZoom,
      interactive: interactive,
    });
    
    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Save map instance
    mapInstance.current = map;
    
    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [initialLatitude, initialLongitude, initialZoom, interactive]);
  
  // Update markers when locations change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    
    // Add new markers
    locations.forEach(location => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5c916e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
      
      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);
      
      // Add click handler
      el.addEventListener('click', () => {
        handleMarkerClick(location);
      });
      
      // Store marker
      markers.current.push(marker);
    });
    
    // Fit bounds if multiple locations
    if (locations.length > 1) {
      const bounds = calculateBounds(locations);
      fitBounds(bounds);
    } else if (locations.length === 1) {
      map.flyTo({
        center: [locations[0].longitude, locations[0].latitude],
        zoom: 14
      });
    }
  }, [locations]);

  // Calculate bounds for multiple markers
  const calculateBounds = (locs: Location[]) => {
    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    locs.forEach(loc => {
      minLng = Math.min(minLng, loc.longitude);
      maxLng = Math.max(maxLng, loc.longitude);
      minLat = Math.min(minLat, loc.latitude);
      maxLat = Math.max(maxLat, loc.latitude);
    });

    // Add padding
    const padding = 0.05;
    return {
      sw: [minLng - padding, minLat - padding],
      ne: [maxLng + padding, maxLat + padding]
    };
  };

  // Fit map to bounds
  const fitBounds = (bounds: { sw: number[], ne: number[] }) => {
    if (mapInstance.current) {
      // Ensure bounds are correctly typed as [number, number]
      const sw: [number, number] = [bounds.sw[0], bounds.sw[1]];
      const ne: [number, number] = [bounds.ne[0], bounds.ne[1]];
      
      mapInstance.current.fitBounds([sw, ne], { padding: 40 });
    }
  };

  // Handle marker click
  const handleMarkerClick = (location: Location) => {
    const map = mapInstance.current;
    if (map) {
      // Remove existing popup
      if (popup.current) {
        popup.current.remove();
      }
      
      // Create popup
      const popupElement = document.createElement('div');
      popupElement.className = 'mapbox-popup';
      popupElement.innerHTML = `
        <h3 class="font-semibold text-gray-800">${location.name}</h3>
        ${location.address ? `<p class="text-sm text-gray-600 mt-1">${location.address}</p>` : ''}
      `;
      
      // Add popup to map
      popup.current = new mapboxgl.Popup({ closeButton: true, maxWidth: '300px' })
        .setLngLat([location.longitude, location.latitude])
        .setDOMContent(popupElement)
        .addTo(map);
      
      // Set popup info
      setPopupInfo(location);
      
      // Call onMarkerClick callback if provided
      if (onMarkerClick) {
        onMarkerClick(location);
      }
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`} 
        style={{ height, width }}
      >
        <p className="text-gray-500">Mapbox token not found. Please add VITE_MAPBOX_TOKEN to your environment variables.</p>
      </div>
    );
  }

  return (
    <div className={className} style={{ height, width }}>
      <div 
        ref={mapRef} 
        style={{ 
          borderRadius: '0.5rem', 
          width: '100%', 
          height: '100%' 
        }}
      />
      <style>{`
        .mapboxgl-popup-content {
          border-radius: 0.375rem;
          padding: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .map-marker {
          cursor: pointer;
          transform: translateY(-16px);
        }
      `}</style>
    </div>
  );
};

export default MapboxMap;
