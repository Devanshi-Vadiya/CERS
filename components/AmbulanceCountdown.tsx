import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Navigation } from 'lucide-react';

const AmbulanceCountdown: React.FC = () => {
  const [secondsRemaining, setSecondsRemaining] = useState(322); // Start at 5m 22s for demo
  const [isArrived, setIsArrived] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsArrived(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine styles based on time
  let colorClass = 'text-white';
  let bgClass = 'bg-[#2f3640]';
  let borderClass = 'border-gray-600';
  let pulseClass = '';
  let statusText = 'AMBULANCE ETA';

  if (isArrived) {
    colorClass = 'text-white';
    bgClass = 'bg-green-600';
    borderClass = 'border-green-400';
    pulseClass = 'animate-bounce';
    statusText = 'AMBULANCE ARRIVED';
  } else if (secondsRemaining < 120) { // < 2 min
    colorClass = 'text-white';
    bgClass = 'bg-green-600';
    borderClass = 'border-green-400';
    pulseClass = 'animate-pulse';
    statusText = 'ARRIVING NOW';
  } else if (secondsRemaining < 300) { // 2-5 min
    colorClass = 'text-white';
    bgClass = 'bg-emergency';
    borderClass = 'border-red-400';
    pulseClass = 'animate-pulse';
    statusText = 'ALMOST THERE';
  } else if (secondsRemaining < 600) { // 5-10 min
    colorClass = 'text-warning';
    bgClass = 'bg-[#2f3640]';
    borderClass = 'border-warning';
    statusText = 'APPROACHING';
  }

  return (
    <div className={`mt-4 rounded-2xl border-2 ${borderClass} ${bgClass} p-4 shadow-xl transition-all duration-500 overflow-hidden relative`}>
      <div className={`flex flex-col items-center justify-center ${pulseClass}`}>
        <div className="text-xs font-bold opacity-80 mb-1 tracking-widest uppercase flex items-center gap-2">
           {isArrived ? <CheckCircle size={14}/> : <Clock size={14}/>}
           {statusText}
        </div>
        <div className={`text-5xl font-black font-mono tracking-tighter ${colorClass} mb-2`}>
          {formatTime(secondsRemaining)}
        </div>
        {!isArrived && (
          <div className="flex items-center justify-between w-full max-w-[200px] text-xs opacity-70 font-medium border-t border-white/20 pt-2">
             <span className="flex items-center gap-1"><Navigation size={10}/> 3.1 km</span>
             <span>•</span>
             <span>45 km/h</span>
          </div>
        )}
      </div>
      
      {/* Progress Bar background */}
      {!isArrived && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full">
            <div 
                className="h-full bg-white/50 transition-all duration-1000 ease-linear" 
                style={{ width: `${(secondsRemaining / 322) * 100}%` }} 
            />
          </div>
      )}
    </div>
  );
};

export default AmbulanceCountdown;
