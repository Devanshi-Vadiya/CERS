import React, { useState } from 'react';
import { MOCK_VOLUNTEERS } from '../constants';
import { LocationData } from '../types';
import { MapPin, Navigation, Siren, Plus, Minus, Crosshair, Layers } from 'lucide-react';

interface TrackingMapProps {
  location?: LocationData;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ location }) => {
  const [zoom, setZoom] = useState(1);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const handleRecenter = () => setZoom(1);
  const toggleMapType = () => setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');

  return (
    <div className="w-full h-64 md:h-96 bg-[#2f3640] rounded-3xl overflow-hidden relative shadow-lg border border-[#4a5568] group">
      {/* Dark Mode Map Grid / Satellite Texture */}
      <div 
         className={`absolute inset-0 transition-opacity duration-500`} 
         style={{ 
             transform: `scale(${zoom})`,
             transformOrigin: 'center center',
             transition: 'transform 0.3s ease-out'
         }}
      >
          {mapType === 'standard' ? (
              <div className="w-full h-full opacity-20"
                style={{ 
                    backgroundImage: 'linear-gradient(#4a5568 1px, transparent 1px), linear-gradient(90deg, #4a5568 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }}
              />
          ) : (
              // Mock Satellite Texture
              <div className="w-full h-full bg-gray-800 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
          )}
      </div>
      
      {/* Center User */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20">
         <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency opacity-75"></span>
            <div className="bg-emergency p-2 rounded-full border-4 border-[#2f3640] shadow-xl">
               <MapPin className="text-white" size={24} fill="currentColor" />
            </div>
         </div>
         {location?.address && (
             <div className="absolute top-12 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white whitespace-nowrap border border-white/20">
                 {location.address.length > 30 ? location.address.substring(0, 30) + '...' : location.address}
             </div>
         )}
      </div>

      {/* Mock Volunteers with slight movement simulation could be added here, currently static for MVP */}
      {MOCK_VOLUNTEERS.map((vol, idx) => {
        const top = 20 + (idx * 25);
        const left = 20 + (idx * 30);
        return (
          <div key={vol.id} className="absolute flex flex-col items-center transition-all duration-1000" style={{ top: `${top}%`, left: `${left}%`, transform: `scale(${zoom})` }}>
             <div className="bg-trust p-1.5 rounded-full border-2 border-[#2f3640] shadow-md">
                <Navigation className="text-white" size={14} />
             </div>
             <div className="mt-1 bg-[#2f3640]/90 px-2 py-0.5 rounded text-[10px] font-bold text-trust border border-trust shadow-sm whitespace-nowrap">
                {vol.distance}
             </div>
          </div>
        );
      })}

      {/* Mock Ambulance */}
      <div className="absolute bottom-6 right-12 flex flex-col items-center animate-pulse-fast z-20" style={{ transform: `scale(${zoom})` }}>
         <div className="bg-safe p-2 rounded-full border-2 border-white shadow-[0_0_15px_rgba(46,213,115,0.6)]">
            <Siren className="text-white" size={20} />
         </div>
         <span className="mt-1 bg-safe text-white text-[10px] font-bold px-2 py-0.5 rounded-full">4 MIN</span>
      </div>

      {/* Live Indicator */}
      <div className="absolute top-3 left-3 bg-[#1E272E]/90 backdrop-blur p-2 rounded-lg border border-gray-700 shadow-lg text-xs z-30">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="font-bold text-gray-300">Live Tracking</span>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-30">
         <button onClick={toggleMapType} className="p-2 bg-[#2f3640]/90 text-white rounded-lg border border-gray-600 hover:bg-gray-700 active:scale-95 transition-all">
            <Layers size={16} />
         </button>
         <button onClick={handleRecenter} className="p-2 bg-[#2f3640]/90 text-white rounded-lg border border-gray-600 hover:bg-gray-700 active:scale-95 transition-all">
            <Crosshair size={16} />
         </button>
         <div className="flex flex-col rounded-lg border border-gray-600 overflow-hidden">
             <button onClick={handleZoomIn} className="p-2 bg-[#2f3640]/90 text-white hover:bg-gray-700 active:bg-gray-600 transition-all border-b border-gray-600">
                <Plus size={16} />
             </button>
             <button onClick={handleZoomOut} className="p-2 bg-[#2f3640]/90 text-white hover:bg-gray-700 active:bg-gray-600 transition-all">
                <Minus size={16} />
             </button>
         </div>
      </div>
    </div>
  );
};

export default TrackingMap;