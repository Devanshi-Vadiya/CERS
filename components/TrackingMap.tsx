import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocationData } from '../types';
import { Wifi, Navigation, Crosshair, Map as MapIcon } from 'lucide-react';

// Fix Leaflet Default Icon Issue
// We use custom emojis/icons as pure HTML to stay lightweight and "pro"
const createCustomIcon = (emoji: string, color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background: white; 
        width: 35px; 
        height: 35px; 
        border-radius: 50%; 
        border: 3px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      ">
        ${emoji}
      </div>
    `,
    className: '',
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });
};

const hospitalIcon = createCustomIcon('🏥', '#3b82f6'); // Blue
const patientIcon = createCustomIcon('🆘', '#ef4444');  // Red
const ambulanceIcon = createCustomIcon('🚑', '#3b82f6'); // Blue
const otherHospitalIcon = createCustomIcon('⚕️', '#94a3b8'); // Slate

/**
 * Bounds Auto-Fitter
 */
const MapAutoCenter: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length > 0) {
      // 🛡️ Filter out any invalid [undefined, undefined] or non-number pairs
      const validCoords = coords.filter(c =>
        c && typeof c[0] === 'number' && typeof c[1] === 'number' &&
        !isNaN(c[0]) && !isNaN(c[1])
      );

      if (validCoords.length > 0) {
        try {
          const bounds = L.latLngBounds(validCoords as L.LatLngExpression[]);
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
          }
        } catch (e) {
          console.warn("Leaflet bounds error:", e);
        }
      }
    }
  }, [coords, map]);
  return null;
};

interface TrackingMapProps {
  location?: LocationData;
  ambulanceLocation?: LocationData;
  hospitalLocation?: LocationData;
  allHospitals?: any[];
}

const TrackingMap: React.FC<TrackingMapProps> = ({ location, ambulanceLocation, hospitalLocation, allHospitals }) => {
  const [route, setRoute] = useState<[number, number][]>([]);

  // Fetch OSRM Route Geometry
  useEffect(() => {
    const fetchRoute = async () => {
      const origin = hospitalLocation || ambulanceLocation;
      if (!origin || !location) {
        setRoute([]);
        return;
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${location.lng},${location.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
          setRoute(coords);
        }
      } catch (e) {
        console.error("Leaflet Route fetch failed:", e);
      }
    };
    fetchRoute();
  }, [location, ambulanceLocation, hospitalLocation]);

  const activeCoords = useMemo(() => {
    const list: [number, number][] = [];
    if (location) list.push([location.lat, location.lng]);
    if (hospitalLocation) list.push([hospitalLocation.lat, hospitalLocation.lng]);
    if (ambulanceLocation) list.push([ambulanceLocation.lat, ambulanceLocation.lng]);

    // 🏥 Also include all other hospitals in the view if no active patient
    if (!location && allHospitals) {
      allHospitals.forEach(h => {
        if (h.location) list.push([h.location.lat, h.location.lng]);
      });
    }

    return list;
  }, [location, hospitalLocation, ambulanceLocation, allHospitals]);

  const center: [number, number] = activeCoords.length > 0
    ? activeCoords[0]
    : [21.1702, 72.8311]; // Surat Fallback

  return (
    <div className="w-full h-[600px] bg-slate-100 rounded-3xl overflow-hidden relative shadow-2xl border-4 border-white z-0">
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🏥 Hospital Marker */}
        {hospitalLocation && (
          <Marker position={[hospitalLocation.lat, hospitalLocation.lng]} icon={hospitalIcon}>
            <Popup>Assigned Hospital</Popup>
          </Marker>
        )}

        {/* 🆘 Patient Marker */}
        {location && (
          <Marker position={[location.lat, location.lng]} icon={patientIcon}>
            <Popup>Patient S.O.S Location</Popup>
          </Marker>
        )}

        {/* 🚑 Ambulance Marker */}
        {ambulanceLocation && (
          <Marker position={[ambulanceLocation.lat, ambulanceLocation.lng]} icon={ambulanceIcon}>
            <Popup>Ambulance En-Route</Popup>
          </Marker>
        )}

        {/* 🛣️ Route Polyline */}
        {route.length > 0 && (
          <Polyline positions={route} pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.7 }} />
        )}

        {/* Other Hospitals */}
        {allHospitals?.map(h => {
          if (!h.location) return null;
          if (hospitalLocation && h.location.lat === hospitalLocation.lat && h.location.lng === hospitalLocation.lng) return null;
          return (
            <Marker key={h.id} position={[h.location.lat, h.location.lng]} icon={otherHospitalIcon}>
              <Popup>{h.name}</Popup>
            </Marker>
          );
        })}

        <MapAutoCenter coords={activeCoords} />
      </MapContainer>

      {/* OVERLAY STATUS */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-white z-[1000]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="font-black text-slate-800 text-xs uppercase">100% Free Leaflet Active</span>
        </div>
        <div className="text-[10px] text-slate-500 font-bold flex items-center gap-2">
          <MapIcon size={12} className="text-blue-500" /> OSRM Traffic Simulated
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;