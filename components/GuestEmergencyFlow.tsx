import React, { useState, useEffect } from 'react';
import { EmergencyType, EmergencyIncident, VictimCondition, VideoEvidence, UserProfile } from '../types';
import { EMERGENCY_TYPES } from '../constants';
import TrackingMap from './TrackingMap';
import AmbulanceCountdown from './AmbulanceCountdown';
import VideoRecorder from './VideoRecorder';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import { CheckCircle, XCircle, Phone, MessageSquare, Mic, Shield, HeartPulse, Car, Brain, Droplets, Flame, Wind, Zap, HelpCircle, ArrowLeft, MoreVertical, LogOut, User, Video as VideoIcon, Users, Activity, RadioReceiver } from 'lucide-react';

interface GuestEmergencyFlowProps {
  currentEmergency: EmergencyIncident;
  onClose: () => void;
  onLogout?: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  HeartPulse, Car, Brain, Droplets, Flame, Wind, Zap, HelpCircle
};

const GuestEmergencyFlow: React.FC<GuestEmergencyFlowProps> = ({ currentEmergency, onClose, onLogout }) => {
  const { addVideoEvidence, currentUser, updateEmergencyType, updateGuestDetails } = useEmergencySystem();
  
  // Steps: 0 = Select Type, 1 = Victim Details, 2 = Video/Active Tracking
  const [step, setStep] = useState<number>(currentEmergency.type ? (currentEmergency.victimCondition ? 2 : 1) : 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoCollapsed, setVideoCollapsed] = useState(false);

  // Form states for Step 1
  const [condition, setCondition] = useState<VictimCondition>({
    consciousness: 'Conscious',
    bleeding: 'Not bleeding',
    breathing: 'Breathing'
  });
  const [victimsCount, setVictimsCount] = useState<string>('1 victim');
  const [victimMedicalInfo, setVictimMedicalInfo] = useState({ bloodGroup: '', knownConditions: '', currentMedications: '', allergies: '' });

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

  const selectType = async (type: EmergencyType) => {
    handleVibrate();
    await updateEmergencyType(currentEmergency.id, type);
    setStep(1);
  };

  const submitDetails = async () => {
    handleVibrate();
    const medInfo = (Object.values(victimMedicalInfo) as string[]).some(v => v.trim() !== '') ? victimMedicalInfo : undefined;
    await updateGuestDetails(currentEmergency.id, {
      victimCondition: condition,
      numberOfVictims: victimsCount,
      ...(medInfo ? { victimMedicalInfo: medInfo } : {})
    });
    setStep(2);
    setShowVideo(true);
  };

  const handleVideoSave = (video: VideoEvidence) => {
    addVideoEvidence(currentEmergency.id, video);
    setShowVideo(false);
    setVideoCollapsed(false);
  };

  // ----------------------------------------------------------------------
  // VIEW: Step 0 - Selection
  // ----------------------------------------------------------------------
  if (step === 0 || !currentEmergency.type) {
    return (
      <div className="flex flex-col h-full bg-[#1E272E] text-white relative overflow-hidden">
        <div className="bg-orange-600 p-6 pb-8 rounded-b-3xl shadow-2xl z-20 text-center relative">
           <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Guest Mode</h1>
           <p className="font-bold text-white/90">Report an emergency for someone else</p>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-300 font-bold uppercase tracking-widest text-sm">Select Emergency Type</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {EMERGENCY_TYPES.map((eType) => {
              const Icon = iconMap[eType.icon] || HelpCircle;
              return (
                <button
                  key={eType.id}
                  onClick={() => selectType(eType)}
                  className="bg-[#2f3640] hover:bg-[#353b48] active:scale-95 transition-all p-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-600 aspect-square shadow-lg group relative overflow-hidden"
                >
                  <div className={`${eType.color.replace('bg-', 'text-')} p-2 rounded-full bg-white/5 group-hover:bg-white/10`}>
                    <Icon size={40} strokeWidth={1.5} />
                  </div>
                  <span className="font-bold text-sm md:text-base text-center leading-tight">{eType.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
             <button onClick={() => { handleVibrate(); onClose(); }} className="text-gray-500 font-bold text-sm underline hover:text-white transition-colors p-4">
               CANCEL SOS
             </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: Step 1 - Details
  // ----------------------------------------------------------------------
  if (step === 1) {
    return (
      <div className="flex flex-col h-full bg-charcoal text-white overflow-hidden relative">
        <div className={`${currentEmergency.type.color} p-4 pt-6 rounded-b-3xl shadow-2xl z-20 shrink-0`}>
          <button onClick={() => setStep(0)} className="flex items-center gap-1 text-white/80 text-xs font-bold uppercase tracking-widest hover:text-white mb-2">
             <ArrowLeft size={12} /> Back
          </button>
          <h1 className="text-2xl font-black text-white">Victim Details</h1>
          <p className="text-sm text-white/80 font-bold">Help responders prepare</p>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div className="bg-[#2f3640] p-5 rounded-2xl border border-gray-700 shadow-xl">
             <h3 className="text-gray-400 font-bold uppercase text-xs mb-4 flex items-center gap-2">
               <Activity size={16} /> Patient Condition
             </h3>
             <div className="space-y-4">
                <div className="flex bg-black/20 p-1 rounded-xl">
                   <button onClick={() => setCondition({...condition, consciousness: 'Conscious'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${condition.consciousness === 'Conscious' ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>Conscious</button>
                   <button onClick={() => setCondition({...condition, consciousness: 'Unconscious'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${condition.consciousness === 'Unconscious' ? 'bg-red-500 text-white' : 'text-gray-400'}`}>Unconscious</button>
                </div>
                <div className="flex bg-black/20 p-1 rounded-xl">
                   <button onClick={() => setCondition({...condition, bleeding: 'Not bleeding'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${condition.bleeding === 'Not bleeding' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>No Bleeding</button>
                   <button onClick={() => setCondition({...condition, bleeding: 'Bleeding'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${condition.bleeding === 'Bleeding' ? 'bg-red-600 text-white' : 'text-gray-400'}`}>Bleeding</button>
                </div>
                <div className="flex bg-black/20 p-1 rounded-xl">
                   <button onClick={() => setCondition({...condition, breathing: 'Breathing'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${condition.breathing === 'Breathing' ? 'bg-green-600 text-white' : 'text-gray-400'}`}>Breathing</button>
                   <button onClick={() => setCondition({...condition, breathing: 'Not breathing'})} className={`flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${condition.breathing === 'Not breathing' ? 'bg-red-600 text-white' : 'text-gray-400'}`}>No Breathing</button>
                </div>
             </div>
          </div>

          <div className="bg-[#2f3640] p-5 rounded-2xl border border-gray-700 shadow-xl">
             <h3 className="text-gray-400 font-bold uppercase text-xs mb-1 flex items-center gap-2">
               <Users size={16} /> Number of Victims
             </h3>
             <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setVictimsCount('1 victim')} className={`py-3 text-sm font-bold rounded-xl border ${victimsCount === '1 victim' ? 'bg-white/10 border-white text-white' : 'border-gray-600 text-gray-500'}`}>1</button>
                <button onClick={() => setVictimsCount('2-5 victims')} className={`py-3 text-sm font-bold rounded-xl border ${victimsCount === '2-5 victims' ? 'bg-white/10 border-white text-white' : 'border-gray-600 text-gray-500'}`}>2-5</button>
                <button onClick={() => setVictimsCount('Mass accident')} className={`py-3 text-sm font-bold rounded-xl border ${victimsCount === 'Mass accident' ? 'bg-red-600/20 border-red-500 text-red-500' : 'border-gray-600 text-gray-500'}`}>Mass</button>
             </div>
          </div>

          {/* Optional Medical Info */}
          <div className="bg-[#2f3640] p-5 rounded-2xl border border-gray-700 shadow-xl">
             <h3 className="text-gray-400 font-bold uppercase text-xs mb-1 flex items-center gap-2">
               <Shield size={16} /> Known Medical Info
               <span className="ml-auto text-[10px] normal-case font-normal text-gray-500 italic">optional — skip if unknown</span>
             </h3>
             <p className="text-gray-500 text-[11px] mb-4">Fill in anything you know about the victim. Leave blank if unknown.</p>
             <div className="space-y-3">
               <div>
                 <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 block">Blood Group</label>
                 <input
                   value={victimMedicalInfo.bloodGroup}
                   onChange={e => setVictimMedicalInfo(p => ({...p, bloodGroup: e.target.value}))}
                   placeholder="e.g. O+, A−, unknown"
                   className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-400"
                 />
               </div>
               <div>
                 <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 block">Known Conditions</label>
                 <input
                   value={victimMedicalInfo.knownConditions}
                   onChange={e => setVictimMedicalInfo(p => ({...p, knownConditions: e.target.value}))}
                   placeholder="e.g. Diabetic, Heart patient"
                   className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-400"
                 />
               </div>
               <div>
                 <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 block">Current Medications</label>
                 <input
                   value={victimMedicalInfo.currentMedications}
                   onChange={e => setVictimMedicalInfo(p => ({...p, currentMedications: e.target.value}))}
                   placeholder="e.g. Insulin, Blood thinners"
                   className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-400"
                 />
               </div>
               <div>
                 <label className="text-gray-500 text-[10px] uppercase font-bold mb-1 block">Allergies</label>
                 <input
                   value={victimMedicalInfo.allergies}
                   onChange={e => setVictimMedicalInfo(p => ({...p, allergies: e.target.value}))}
                   placeholder="e.g. Penicillin, Latex"
                   className="w-full bg-black/30 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-orange-400"
                 />
               </div>
             </div>
          </div>
        </div>

        <div className="p-4 bg-[#2f3640] border-t border-gray-700 shrink-0">
          <button onClick={submitDetails} className="w-full bg-emergency text-white font-black py-4 rounded-xl text-lg shadow-[0_0_20px_rgba(255,71,87,0.3)] active:scale-95 transition-transform flex items-center justify-center gap-2">
             Dispatch Rapid Response <ArrowRightIcon />
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: Step 2 - Active Tracking & First Aid
  // ----------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full bg-charcoal text-white overflow-hidden relative">
      <div className={`${currentEmergency.type.color} p-4 pt-6 rounded-b-3xl shadow-2xl z-20 shrink-0 transition-all duration-500 ${!videoCollapsed && showVideo ? 'pb-4' : ''}`}>
        <div className="flex justify-between items-start mb-2">
           <div>
              <div className="flex items-center gap-2 mb-1">
                 <span className="bg-white text-black text-[10px] font-black uppercase px-2 py-0.5 rounded-full">GUEST REPORT</span>
                 <span className="text-white/90 text-[10px] font-bold uppercase">{victimsCount}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white">{currentEmergency.type.name}</h1>
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
                     <button onClick={handleLogoutClick} className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-bold flex items-center gap-2">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative">
        {showVideo && (
            <div className={`w-full transition-all duration-500 ease-in-out px-4 pt-4 z-10 ${videoCollapsed ? 'h-48' : 'h-[65vh]'}`}>
                <div className="h-full w-full relative">
                    <VideoRecorder 
                        emergencyId={currentEmergency.id} 
                        emergencyType={currentEmergency.type.name} 
                        location={currentEmergency.location}
                        onSave={handleVideoSave}
                        onDiscard={() => { handleVibrate(); setShowVideo(false); setVideoCollapsed(false); }}
                    />
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
          <div className={`transition-opacity duration-500 ${!videoCollapsed && showVideo ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <TrackingMap location={currentEmergency.location} />

            <div className="grid grid-cols-2 gap-3 mt-4">
                {currentEmergency.ambulanceEta ? (
                   <div className="col-span-2 bg-indigo-600/10 border border-indigo-500/30 p-4 rounded-2xl animate-in fade-in">
                       <div className="flex justify-between items-center mb-2">
                           <span className="text-indigo-400 text-xs font-black uppercase">Ambulance</span>
                           <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">EN ROUTE</span>
                       </div>
                       <AmbulanceCountdown initialEtaString={currentEmergency.ambulanceEta} />
                   </div>
                ) : (
                    <div className="col-span-2 bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
                       <div className="flex items-center gap-2">
                           <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                           <span className="text-slate-300 font-bold text-sm">Waiting for Dispatch...</span>
                       </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
               <button onClick={() => { handleVibrate(); window.alert('Community Network Notified!'); }} className="bg-orange-500/20 border border-orange-500/50 p-2 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all">
                  <RadioReceiver size={18} className="text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-200 text-center">Notify Locals</span>
               </button>
               <button onClick={() => { handleVibrate(); window.alert('Opening responder chat...'); }} className="bg-blue-500/20 border border-blue-500/50 p-2 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all">
                  <MessageSquare size={18} className="text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-200 text-center">Responder Chat</span>
               </button>
               <button onClick={() => { handleVibrate(); setShowVideo(!showVideo); setVideoCollapsed(false); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 active:scale-95 transition-all border ${showVideo ? 'bg-red-500/30 border-red-500' : 'bg-gray-700 border-gray-600'}`}>
                  <VideoIcon size={18} className="text-white" />
                  <span className="text-[10px] font-bold text-white text-center">{showVideo ? 'Hide Cam' : 'Evidence'}</span>
               </button>
            </div>

            <div className="bg-[#2f3640] rounded-2xl p-5 border border-gray-700 shadow-xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-white">First Aid Guide</h3>
               </div>
               <div className="mb-4">
                  <ul className="list-disc pl-5 space-y-2 text-gray-300 text-sm">
                     {currentEmergency.type.instructions.map((inst, i) => (
                         <li key={i}>{inst}</li>
                     ))}
                  </ul>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 animate-in slide-in-from-bottom duration-500 delay-150">
               <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                  <h4 className="text-green-400 font-bold text-[11px] mb-2 flex items-center gap-1 uppercase tracking-wider">
                     <CheckCircle size={14} /> Do
                  </h4>
                  <ul className="text-xs space-y-1.5 text-gray-300">
                     {(currentEmergency.type.do || []).map((d, i) => (
                        <li key={i} className="leading-tight">• {d}</li>
                     ))}
                  </ul>
               </div>
               <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                  <h4 className="text-red-400 font-bold text-[11px] mb-2 flex items-center gap-1 uppercase tracking-wider">
                     <XCircle size={14} /> Don't
                  </h4>
                  <ul className="text-xs space-y-1.5 text-gray-300">
                     {(currentEmergency.type.dont || []).map((d, i) => (
                        <li key={i} className="leading-tight">• {d}</li>
                     ))}
                  </ul>
               </div>
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

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);

export default GuestEmergencyFlow;
