import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface SOSButtonProps {
  onActivate: () => void;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onActivate }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    setIsPressed(true);
    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
    setTimeout(() => {
        onActivate();
        setIsPressed(false);
    }, 300); // Slight delay for animation
  };

  return (
    <div className="flex flex-col items-center justify-center w-full px-6 py-8 max-w-lg mx-auto relative">
      
      {/* Container for the huge button */}
      <div className="relative flex items-center justify-center">
         {/* Ambient Ripples */}
         <div className="absolute inset-0 bg-emergency rounded-full opacity-20 animate-[ping_2s_ease-in-out_infinite]"></div>
         <div className="absolute -inset-8 bg-emergency rounded-full opacity-10 animate-[ping_3s_ease-in-out_infinite_0.5s]"></div>
         
         {/* Main Button */}
         <button 
            onClick={handlePress}
            className={`
              relative w-64 h-64 md:w-80 md:h-80 rounded-full 
              bg-gradient-to-br from-[#FF4757] to-[#d63031] 
              flex flex-col items-center justify-center 
              shadow-[0_0_50px_rgba(255,71,87,0.6)] 
              border-8 border-[#1E272E] 
              active:scale-90 transition-transform duration-100 ease-in-out
              group z-10 select-none touch-manipulation
              ${isPressed ? 'scale-90 brightness-90' : 'scale-100'}
            `}
            aria-label="SOS Emergency Button"
         >
            <span className="text-white font-black text-7xl md:text-8xl tracking-tighter drop-shadow-lg group-hover:scale-105 transition-transform">
              SOS
            </span>
            <span className="text-white/80 font-bold text-sm md:text-lg tracking-widest mt-2 uppercase">
              Tap for Help
            </span>
         </button>
      </div>

      <div className="text-center mt-12 z-10">
        <h2 className="text-3xl font-bold text-white mb-2">Emergency Mode</h2>
        <p className="text-gray-400 text-lg">
          One tap sends your location immediately
        </p>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-xs md:text-sm text-gray-500">
        <ShieldAlert size={16} />
        <span>Instant Alert • No Delay • Live Tracking</span>
      </div>
    </div>
  );
};

export default SOSButton;
