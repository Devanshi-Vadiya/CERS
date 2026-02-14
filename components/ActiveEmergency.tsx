import React, { useState, useEffect } from 'react';
import { EmergencyType, VideoEvidence, UserProfile } from '../types';
import { EMERGENCY_TYPES } from '../constants';
import TrackingMap from './TrackingMap';
import AmbulanceCountdown from './AmbulanceCountdown';
import VideoRecorder from './VideoRecorder';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import { CheckCircle, XCircle, Phone, MessageSquare, Mic, Shield, HeartPulse, Car, Brain, Droplets, Flame, Wind, Zap, HelpCircle, ArrowLeft, MoreVertical, LogOut, User, Video as VideoIcon } from 'lucide-react';

interface ActiveEmergencyProps {
  type: EmergencyType | null;
  onClose: () => void;
  onUpdateType?: (type: EmergencyType | null) => void;
  onLogout?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  HeartPulse, Car, Brain, Droplets, Flame, Wind, Zap, HelpCircle
};

const ActiveEmergency: React.FC<ActiveEmergencyProps> = ({ type, onClose, onUpdateType, onLogout }) => {
  const { addVideoEvidence, currentUser, activeEmergencies } = useEmergencySystem();
  const [activeStep, setActiveStep] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);

  // Find the current emergency object to get its live location
  const currentEmergency = activeEmergencies.find(e => e.userId === currentUser?.id && e.status !== 'resolved');

  // Safety delay for cancel button
  useEffect(() => {
    const timer = setTimeout(() => setShowCancel(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-show video recorder when type is selected
  useEffect(() => {
    if (type) {
        setShowVideo(true);
    }
  }, [type]);

  const handleVibrate = () => {
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleLogoutClick = () => {
    handleVibrate();
    setShowMenu(false);
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    handleVibrate();
    if (onLogout) onLogout();
  };

  const handleVideoSave = (video: VideoEvidence) => {
    if (currentEmergency) {
        addVideoEvidence(currentEmergency.id, video);
    }
    // Unmount the VideoRecorder so the map + precautions page comes back
    setShowVideo(false);
    setVideoCollapsed(false);
  };

  // --- PHASE 2: UNSPECIFIED EMERGENCY (Selection Grid) ---
  if (!type) {
    return (
      <div className="flex flex-col h-full bg-[#1E272E] text-white relative overflow-hidden">
        {/* Urgent Status Header */}
        <div className="bg-emergency p-6 pb-8 rounded-b-3xl shadow-2xl z-20 text-center animate-pulse relative">
           {/* Top Right Menu */}
           <div className="absolute top-4 right-4">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors">
                 <MoreVertical size={20} />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 bg-white text-gray-800 rounded-xl shadow-xl w-48 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-sm">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{(currentUser as UserProfile)?.phone}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700">
                    <User size={14} /> My Profile
                  </button>
                  <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-bold flex items-center gap-2">
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
           </div>

           <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Help is Coming!</h1>
           <div className="flex justify-center gap-3 text-sm font-bold bg-black/20 mx-auto w-fit px-4 py-2 rounded-full">
             <span className="flex items-center gap-1">📍 Location Locked</span>
             <span className="flex items-center gap-1">•</span>
             <span className="flex items-center gap-1">👥 Alerts Sent</span>
           </div>
        </div>

        {/* Instructions */}
        <div className="text-center py-4">
          <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">Select Emergency Type</p>
        </div>

        {/* Emergency Grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {EMERGENCY_TYPES.map((eType) => {
              const Icon = iconMap[eType.icon] || HelpCircle;
              return (
                <button
                  key={eType.id}
                  onClick={() => { handleVibrate(); onUpdateType && onUpdateType(eType); }}
                  className="bg-[#2f3640] hover:bg-[#353b48] active:scale-95 transition-all p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-600 aspect-square shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-active:opacity-100 transition-opacity" />
                  <div className={`${eType.color.replace('bg-', 'text-')} p-2 rounded-full bg-white/5 group-hover:bg-white/10`}>
                    <Icon size={40} strokeWidth={1.5} />
                  </div>
                  <span className="font-bold text-sm md:text-base text-center leading-tight">{eType.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1E272E] to-transparent z-30 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 text-safe font-bold text-sm bg-safe/10 px-4 py-2 rounded-full border border-safe/20">
              <Shield size={16} />
              <span>Response Team ETA: 3 min</span>
           </div>
           
           {showCancel && (
             <button 
               onClick={() => { handleVibrate(); onClose(); }}
               className="text-gray-500 font-bold text-sm underline hover:text-white transition-colors p-4 active:text-white"
             >
               CANCEL SOS
             </button>
           )}
        </div>

        {/* Logout Warning Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#2f3640] rounded-2xl p-6 w-full max-w-sm border border-red-500/50 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                    <Shield size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Warning: Active Emergency</h3>
                 <p className="text-gray-400 text-sm">You have an active SOS alert. Logging out will stop real-time tracking updates for responders.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-white hover:bg-gray-600 active:scale-95 transition-all">Cancel</button>
                 <button onClick={confirmLogout} className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 active:scale-95 transition-all">Logout Anyway</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- PHASE 3: SPECIFIED EMERGENCY (Protocol View) ---
  return (
    <div className="flex flex-col h-full bg-charcoal text-white overflow-hidden relative">
      {/* Top Bar - Compact when video is large */}
      <div className={`${type.color} p-4 pt-6 rounded-b-3xl shadow-2xl z-20 shrink-0 transition-all duration-500 ${!videoCollapsed && showVideo ? 'pb-4' : ''}`}>
        <div className="flex justify-between items-start mb-2">
           <div>
              <button onClick={() => { handleVibrate(); onUpdateType && onUpdateType(null); }} className="flex items-center gap-1 text-white/80 text-xs font-bold uppercase tracking-widest hover:text-white mb-1">
                 <ArrowLeft size={12} /> Change Type
              </button>
              <h1 className="text-2xl md:text-3xl font-black text-white">{type.name}</h1>
           </div>
           
           <div className="flex gap-2">
             <button onClick={() => { handleVibrate(); onClose(); }} className="bg-white/20 hover:bg-white/30 p-2 px-4 rounded-full text-sm font-bold backdrop-blur-sm transition-colors active:scale-95">
                END
             </button>
             
             {/* Profile Dropdown */}
             <div className="relative">
                <button onClick={() => { handleVibrate(); setShowMenu(!showMenu); }} className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors active:scale-95">
                  <MoreVertical size={20} />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-12 bg-white text-gray-800 rounded-xl shadow-xl w-48 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-sm text-black">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{(currentUser as UserProfile)?.phone}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-black">
                      <User size={14} /> My Profile
                    </button>
                    <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-bold flex items-center gap-2">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        
        {/* VIDEO CONTAINER: EXPANDED MODE */}
        {showVideo && (
            <div className={`w-full transition-all duration-500 ease-in-out px-4 pt-4 z-10 ${videoCollapsed ? 'h-48' : 'h-[65vh]'}`}>
                <div className="h-full w-full relative">
                    <VideoRecorder 
                        emergencyId={currentEmergency?.id || 'temp'} 
                        emergencyType={type.name} 
                        location={currentEmergency?.location || {lat:0, lng:0}}
                        onSave={handleVideoSave}
                        onDiscard={() => { handleVibrate(); setShowVideo(false); setVideoCollapsed(false); }}
                    />
                    {/* Expand/Collapse Toggle */}
                    {videoCollapsed && (
                        <button 
                           onClick={() => setVideoCollapsed(false)}
                           className="absolute top-2 right-2 bg-black/50 p-2 rounded-full text-white backdrop-blur z-20 hover:bg-black/70"
                        >
                           <VideoIcon size={16} />
                        </button>
                    )}
                </div>
            </div>
        )}

        <div className="p-4 space-y-4">
  {/* Container opacity logic remains for video overlay consistency */}
  <div className={`transition-opacity duration-500 ${!videoCollapsed && showVideo ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
    
    {/* 1. Always show the map so the user sees their active signal */}
    <TrackingMap location={currentEmergency?.location} />

    {/* 2. Conditional ETA Logic */}
    <div className="mt-4">
  {currentEmergency?.ambulanceEta ? (
    // SHOW: If the hospital has accepted and provided a time
    <div className="animate-in fade-in slide-in-from-top duration-500">
      <div className="bg-indigo-600/10 border border-indigo-500/30 p-4 rounded-2xl">
        <div className="flex justify-between items-center mb-4">
          <span className="text-indigo-400 text-xs font-black uppercase tracking-widest">Ambulance Status</span>
          <span className="bg-indigo-500 text-white text-[10px] px-2 py-1 rounded-full font-bold animate-pulse">EN ROUTE</span>
        </div>
        
        {/* 🔴 NEW: Passing the real database ETA string to the countdown component */}
        <AmbulanceCountdown initialEtaString={currentEmergency.ambulanceEta} />
        
        <p className="mt-3 text-center text-indigo-300 font-bold italic">
          Hospital Confirmed: {currentEmergency.ambulanceEta}
        </p>
      </div>
    </div>
  ) : (
    // HIDE: Show "Waiting" state if ETA is not yet available
    <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
        <p className="text-slate-300 font-bold text-sm uppercase tracking-tight">Signal Received by Dispatch</p>
      </div>
      <p className="text-slate-500 text-xs text-center">
        Waiting for a nearby hospital to confirm an ambulance and provide an ETA...
      </p>
    </div>
  )}
</div>
  </div>
</div>

        {/* Action Grid */}
        <div className="grid grid-cols-3 gap-3 px-4 mb-6">
           <button 
             onClick={() => { handleVibrate(); window.location.href='tel:100'; }}
             className="bg-green-600 p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg border border-green-500 hover:bg-green-700"
           >
              <Phone size={24} className="text-white" />
              <span className="text-[10px] font-bold">Call 100</span>
           </button>
           <button 
             onClick={() => { handleVibrate(); window.alert('Connecting to nearby volunteer network...'); }}
             className="bg-gray-700 p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg border border-gray-600 hover:bg-gray-600"
           >
              <MessageSquare size={24} className="text-white" />
              <span className="text-[10px] font-bold">Chat</span>
           </button>
           <button 
             onClick={() => { handleVibrate(); setShowVideo(!showVideo); setVideoCollapsed(false); }}
             className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform shadow-lg border ${showVideo ? 'bg-emergency border-red-400' : 'bg-gray-700 border-gray-600'}`}
           >
              <VideoIcon size={24} className="text-white" />
              <span className="text-[10px] font-bold">{showVideo ? 'Hide Cam' : 'Show Cam'}</span>
           </button>
        </div>

        {/* Dynamic Protocol Instructions */}
        <div className="px-4 mb-6">
           <div className="bg-[#2f3640] rounded-2xl p-5 border border-gray-700 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg text-white">Protocol</h3>
                 <span className={`text-xs ${type.color.replace('bg-', 'text-')} bg-white/10 px-2 py-0.5 rounded`}>Step {activeStep + 1}/{type.instructions.length}</span>
              </div>
              
              <div className="mb-6 min-h-[80px]">
                 <p className="text-xl font-medium leading-snug">{type.instructions[activeStep]}</p>
              </div>

              <div className="flex justify-between items-center">
                 <button 
                   disabled={activeStep === 0}
                   onClick={() => { handleVibrate(); setActiveStep(p => p - 1); }}
                   className="text-gray-400 font-bold text-sm disabled:opacity-30 p-2 hover:text-white"
                 >
                   BACK
                 </button>
                 <div className="flex gap-1">
                    {type.instructions.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === activeStep ? type.color : 'bg-gray-600'}`} />
                    ))}
                 </div>
                 <button 
                   disabled={activeStep === type.instructions.length - 1}
                   onClick={() => { handleVibrate(); setActiveStep(p => p + 1); }}
                   className={`font-bold text-sm disabled:opacity-30 p-2 ${type.color.replace('bg-', 'text-')} hover:brightness-110`}
                 >
                   NEXT
                 </button>
              </div>
           </div>

           {/* Dos and Don'ts Section */}
           <div className="grid grid-cols-2 gap-3 mt-4 animate-in slide-in-from-bottom duration-500 delay-150">
              <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                 <h4 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle size={16} /> Do
                 </h4>
                 <ul className="text-sm space-y-2 text-gray-300">
                    {(type.do || []).map((d, i) => (
                       <li key={i} className="flex items-start gap-2 leading-tight">
                          <div className="min-w-[4px] h-[4px] rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                          <span>{d}</span>
                       </li>
                    ))}
                 </ul>
              </div>
              
              <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                 <h4 className="text-red-400 font-bold text-sm mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <XCircle size={16} /> Don't
                 </h4>
                 <ul className="text-sm space-y-2 text-gray-300">
                    {(type.dont || []).map((d, i) => (
                       <li key={i} className="flex items-start gap-2 leading-tight">
                          <div className="min-w-[4px] h-[4px] rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                          <span>{d}</span>
                       </li>
                    ))}
                 </ul>
              </div>
           </div>
        </div>
      </div>

      {/* Logout Warning Modal */}
      {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in">
            <div className="bg-[#2f3640] rounded-2xl p-6 w-full max-w-sm border border-red-500/50 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                    <Shield size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Warning: Active Emergency</h3>
                 <p className="text-gray-400 text-sm">You have an active SOS alert. Logging out will stop real-time tracking updates for responders.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-white hover:bg-gray-600 active:scale-95 transition-all">Cancel</button>
                 <button onClick={confirmLogout} className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 active:scale-95 transition-all">Logout Anyway</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default ActiveEmergency;