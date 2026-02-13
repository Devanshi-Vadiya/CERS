import React, { useState, useEffect, useRef } from 'react';
import { LocationData } from '../types';
import { MapPin, Crosshair, Layers, Navigation, Activity, Wifi, WifiOff } from 'lucide-react';

interface TrackingMapProps {
  location?: LocationData;
  onLocationUpdate?: (coords: { lat: number; lng: number; accuracy: number; speed: number | null }) => void;
  enableContinuousTracking?: boolean; // NEW: Enable live updates every few seconds
  showPath?: boolean; // NEW: Show path trail
}

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy: number;
}

// Fallback coords (Surat, India)
const DEFAULT_LAT = 21.1702;
const DEFAULT_LNG = 72.8311;

const TrackingMap: React.FC<TrackingMapProps> = ({ 
  location, 
  onLocationUpdate,
  enableContinuousTracking = true,
  showPath = true 
}) => {
  const [coords, setCoords] = useState({
    lat: location?.lat ?? DEFAULT_LAT,
    lng: location?.lng ?? DEFAULT_LNG,
  });
  
  const [locationPath, setLocationPath] = useState<LocationPoint[]>([]);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [iframeKey, setIframeKey] = useState(0);
  
  const watchIdRef = useRef<number | null>(null);
  const pathRef = useRef<LocationPoint[]>([]);

  // 1. Initialize with provided location or get current location
  useEffect(() => {
    if (location?.lat && location?.lng) {
      const newPoint: LocationPoint = {
        lat: location.lat,
        lng: location.lng,
        timestamp: Date.now(),
        accuracy: 0
      };
      setCoords({ lat: location.lat, lng: location.lng });
      
      if (showPath && pathRef.current.length === 0) {
        pathRef.current.push(newPoint);
        setLocationPath([newPoint]);
      }
    }
  }, [location?.lat, location?.lng]);

  // 2. Start continuous live tracking
  useEffect(() => {
    if (!enableContinuousTracking || !navigator.geolocation) return;

    // Initial position
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        
        const newPoint: LocationPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
          accuracy: pos.coords.accuracy
        };

        setCoords(newCoords);
        setAccuracy(pos.coords.accuracy);
        setSpeed(pos.coords.speed);
        setLastUpdate(new Date());
        setIsTracking(true);

        if (showPath) {
          pathRef.current.push(newPoint);
          setLocationPath([...pathRef.current]);
        }

        // Callback to parent component
        onLocationUpdate?.({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed
        });
      },
      (err) => {
        console.warn('Initial geolocation failed:', err);
        setIsTracking(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        const newPoint: LocationPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
          accuracy: pos.coords.accuracy
        };

        setCoords(newCoords);
        setAccuracy(pos.coords.accuracy);
        setSpeed(pos.coords.speed);
        setLastUpdate(new Date());
        setIsTracking(true);

        // Add to path (limit to last 50 points to avoid memory issues)
        if (showPath) {
          pathRef.current.push(newPoint);
          if (pathRef.current.length > 50) {
            pathRef.current.shift();
          }
          setLocationPath([...pathRef.current]);
        }

        // Callback to parent
        onLocationUpdate?.({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          speed: pos.coords.speed
        });
      },
      (err) => {
        console.warn('Watch position error:', err);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enableContinuousTracking, showPath, onLocationUpdate]);

  const handleRecenter = () => {
    setIframeKey(k => k + 1);
  };

  const toggleMapType = () => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  };

  const clearPath = () => {
    pathRef.current = [];
    setLocationPath([]);
  };

  // Build map URL
  const bbox = 0.01;
  const getMapUrl = () => {
    if (mapType === 'satellite') {
      return `https://www.arcgis.com/apps/Embed/index.html?webmap=d802f08316e84c6592ef681c50178f17&extent=${coords.lng - bbox},${coords.lat - bbox},${coords.lng + bbox},${coords.lat + bbox}&zoom=true&previewImage=false&scale=false&disable_scroll=true&theme=dark`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - bbox}%2C${coords.lat - bbox}%2C${coords.lng + bbox}%2C${coords.lat + bbox}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`;
  };

  // Calculate time since last update
  const timeSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);

  return (
    <div className="w-full h-64 md:h-96 bg-[#2f3640] rounded-3xl overflow-hidden relative shadow-lg border border-[#4a5568]">

      {/* MAP IFRAME */}
      <iframe
        key={iframeKey}
        src={getMapUrl()}
        width="100%"
        height="100%"
        style={{ border: 'none', filter: 'brightness(0.85) saturate(1.1)' }}
        title="Live Emergency Location"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* PATH TRAIL VISUALIZATION (SVG Overlay) */}
      {showPath && locationPath.length > 1 && (
        <svg 
          className="absolute inset-0 pointer-events-none z-10"
          style={{ width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#ef4444', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          <polyline
            points={locationPath.map((_, idx) => {
              // Simple percentage-based positioning (not accurate projection, but visual indicator)
              const x = ((idx / locationPath.length) * 80 + 10) + '%';
              const y = (50 - (idx % 2 === 0 ? 5 : -5)) + '%';
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        </svg>
      )}

      {/* CENTER PIN (Current Position) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-20 pointer-events-none">
        <div className="relative flex flex-col items-center">
          {/* Pulse ring */}
          {isTracking && (
            <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-emergency opacity-60 -top-1 -left-1" />
          )}
          <div className={`bg-emergency p-2 rounded-full border-4 ${isTracking ? 'border-white' : 'border-gray-400'} shadow-2xl shadow-red-500/50 relative z-10 transition-all`}>
            <MapPin className="text-white" size={20} fill="currentColor" />
          </div>
          {/* Direction indicator if moving */}
          {speed && speed > 0.5 && (
            <div className="absolute -bottom-6 bg-blue-600 p-1 rounded-full">
              <Navigation size={12} className="text-white" fill="currentColor" />
            </div>
          )}
          <div className="w-2 h-1 bg-black/40 rounded-full mt-0.5 blur-sm" />
        </div>
      </div>

      {/* ADDRESS LABEL */}
      {location?.address && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] text-white font-bold border border-white/20 whitespace-nowrap shadow-lg">
            📍 {location.address.length > 35 ? location.address.substring(0, 35) + '…' : location.address}
          </div>
        </div>
      )}

      {/* LIVE TRACKING STATUS (Enhanced) */}
      <div className="absolute top-3 left-3 bg-[#1E272E]/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-gray-700 shadow-lg text-xs z-30">
        {/* Status indicator */}
        <div className="flex items-center gap-2 mb-1">
          {isTracking ? (
            <>
              <Wifi size={12} className="text-green-500" />
              <span className="font-bold text-green-400">Live Tracking</span>
            </>
          ) : (
            <>
              <WifiOff size={12} className="text-red-500" />
              <span className="font-bold text-red-400">GPS Unavailable</span>
            </>
          )}
        </div>
        
        {/* Coordinates */}
        <div className="text-[10px] text-gray-400 font-mono mb-1">
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </div>
        
        {/* Additional info */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          {accuracy > 0 && (
            <div className="flex items-center gap-1">
              <Crosshair size={10} />
              <span>±{Math.round(accuracy)}m</span>
            </div>
          )}
          {speed !== null && speed > 0 && (
            <div className="flex items-center gap-1">
              <Activity size={10} />
              <span>{(speed * 3.6).toFixed(1)} km/h</span>
            </div>
          )}
        </div>
        
        {/* Last update time */}
        {isTracking && (
          <div className="text-[9px] text-gray-600 mt-1">
            Updated {timeSinceUpdate}s ago
          </div>
        )}
      </div>

      {/* MAP CONTROLS */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-30">
        {/* Map type toggle */}
        <button
          onClick={toggleMapType}
          title={mapType === 'standard' ? 'Switch to Satellite' : 'Switch to Map'}
          className="p-2 bg-[#1E272E]/90 text-white rounded-lg border border-gray-600 hover:bg-gray-700 active:scale-95 transition-all backdrop-blur-sm shadow"
        >
          <Layers size={15} />
        </button>
        
        {/* Recenter */}
        <button
          onClick={handleRecenter}
          title="Re-center map"
          className="p-2 bg-[#1E272E]/90 text-white rounded-lg border border-gray-600 hover:bg-gray-700 active:scale-95 transition-all backdrop-blur-sm shadow"
        >
          <Crosshair size={15} />
        </button>

        {showPath && locationPath.length > 1 && (
          <button
            onClick={clearPath}
            title="Clear path"
            className="p-2 bg-[#1E272E]/90 text-white rounded-lg border border-gray-600 hover:bg-gray-700 active:scale-95 transition-all backdrop-blur-sm shadow"
          >
            <span className="text-[10px] font-bold">Clear</span>
          </button>
        )}
      </div>

      {mapType === 'satellite' && (
        <div className="absolute top-3 right-3 z-30 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shadow border border-blue-400/50">
          Satellite
        </div>
      )}

      {/* PATH INFO */}
      {showPath && locationPath.length > 1 && (
        <div className="absolute top-16 left-3 z-30 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow border border-blue-400/50">
          Path: {locationPath.length} points
        </div>
      )}
    </div>
  );
};

export default TrackingMap;