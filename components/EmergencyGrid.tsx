import React from 'react';
import { EMERGENCY_TYPES } from '../constants
import { EmergencyType } from '../types
import { HeartPulse, Car, Brain, Droplets, Flame, Wind, AlertTriangle, HelpCircle } from 'lucide-react';

interface EmergencyGridProps {
  onSelect: (type: EmergencyType) => void;
}

const iconMap: Record<string, React.ElementType> = {
  HeartPulse, Car, Brain, Droplets, Flame, Wind
};

const EmergencyGrid: React.FC<EmergencyGridProps> = ({ onSelect }) => {
  return (
    <div className="p-4 pb-24 h-full bg-charcoal overflow-y-auto">
      <div className="mb-6 text-center">
         <h2 className="text-2xl font-black text-white uppercase tracking-tight">Select Emergency</h2>
         <p className="text-gray-400 text-sm">Tap to activate specific protocol</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {EMERGENCY_TYPES.map((type) => {
          const Icon = iconMap[type.icon] || AlertTriangle;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type)}
              className="bg-[#2f3640] hover:bg-[#353b48] text-white p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-3 transition-all active:scale-95 border border-gray-700 group"
            >
              <div className={`p-3 rounded-full ${type.color.replace('bg-', 'text-')} bg-white/10 group-hover:bg-white/20`}>
                 <Icon size={32} strokeWidth={2} />
              </div>
              <span className="font-bold text-md text-center leading-tight">{type.name}</span>
            </button>
          );
        })}
        <button
           onClick={() => alert("Connecting to General Emergency...")}
           className="bg-gray-700 text-white p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-3 col-span-2 border border-gray-600 active:scale-95"
        >
          <HelpCircle size={28} className="text-gray-400" />
          <span className="font-bold text-md text-gray-300">Other / Unsure</span>
        </button>
      </div>
    </div>
  );
};

export default EmergencyGrid;
