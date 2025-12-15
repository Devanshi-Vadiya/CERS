import React, { useState, useEffect } from 'react';
import SOSButton from './SOSButton';
import ActiveEmergency from './ActiveEmergency';
import ChatAssistant from './ChatAssistant';
import { AppTab, EmergencyType, UserProfile } from '../types'../types
import { 
  MessageSquare, User, Phone, Settings, Shield, 
  ChevronRight, Bell, Moon, Lock, ToggleLeft, ToggleRight, 
  Smartphone, Edit2, Save, X, Check, Download, Home
} from 'lucide-react';
import { useEmergencySystem } from '../contexts/EmergencyContext';

interface GeneralAppProps {
  onLogout: () => void;
}

const GeneralApp: React.FC<GeneralAppProps> = ({ onLogout }) => {
  const { currentUser, logoutUser, dispatchEmergency, activeEmergencies, updateEmergencyType, resolveEmergency, updateUserProfile } = useEmergencySystem();
  
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.HOME);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  
  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  // Settings Action States
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    notifications: true,
    haptic: true,
    theme: 'Dark'
  });

  // Safety check to prevent crash on logout
  if (!currentUser) {
      return null;
  }

  const user = currentUser as UserProfile;
  const myActiveEmergency = activeEmergencies.find(e => e.userId === currentUser?.id && e.status !== 'resolved');

  // --- Handlers ---
  const handleSOSClick = async () => {
    setIsDispatching(true);
    const startTime = Date.now();
    
    // Perform dispatch
    await dispatchEmergency(null);
    
    // Ensure the loading screen shows for at least 2 seconds for UX reassurance
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 2000) {
        await new Promise(r => setTimeout(r, 2000 - elapsedTime));
    }
    
    setIsDispatching(false);
  };

  const handleEmergencyUpdate = (type: EmergencyType | null) => {
    if (myActiveEmergency) {
      updateEmergencyType(myActiveEmergency.id, type);
    }
  };

  const handleEmergencyEnd = () => {
    if (myActiveEmergency) {
      resolveEmergency(myActiveEmergency.id);
    }
  };

  const handleLogoutRequest = () => {
    if (myActiveEmergency) {
      setShowLogoutConfirm(true);
    } else {
      logoutUser();
      onLogout();
    }
  };

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  // Profile Handlers
  const startEditing = () => {
    setEditForm(JSON.parse(JSON.stringify(user)));
    setIsEditingProfile(true);
  };

  const saveProfile = () => {
    if (currentUser?.id) {
      updateUserProfile(currentUser.id, editForm);
      setIsEditingProfile(false);
    }
  };

  const cancelEdit = () => {
    setIsEditingProfile(false);
  };

  const updateMedicalField = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      medicalInfo: { ...(prev.medicalInfo || { bloodGroup: '', allergies: '', conditions: '', medications: '' }), [field]: value }
    }));
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // -- Settings Actions --
  const handleChangePassword = () => {
      setPasswordMessage('Password reset link sent to registered email.');
      setTimeout(() => setPasswordMessage(null), 3000);
  };

  const handleDownloadData = () => {
      setDownloading(true);
      setTimeout(() => {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", `cers_data_${user.name.replace(/\s/g, '_')}.json`);
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
          setDownloading(false);
      }, 1500);
  };

  // --- Views ---
  const renderHome = () => {
    return (
      <div className="flex flex-col h-full overflow-y-auto no-scrollbar relative">
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <SOSButton onActivate={handleSOSClick} />
        </div>

        <div className="px-6 pb-6">
           <h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Quick Access</h3>
           <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              <div onClick={() => handleCall('100')} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:opacity-80 active:scale-95 transition-transform">
                 <div className="w-12 h-12 rounded-full bg-red-900/40 flex items-center justify-center border border-red-500/50">
                    <Phone size={20} className="text-red-400"/>
                 </div>
                 <span className="text-[10px] text-gray-400">Police</span>
              </div>
              <div onClick={() => handleCall('102')} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:opacity-80 active:scale-95 transition-transform">
                 <div className="w-12 h-12 rounded-full bg-blue-900/40 flex items-center justify-center border border-blue-500/50">
                    <Shield size={20} className="text-blue-400"/>
                 </div>
                 <span className="text-[10px] text-gray-400">Ambulance</span>
              </div>
              {user?.emergencyContacts?.map((contact, idx) => (
                <div key={idx} onClick={() => handleCall(contact.phone)} className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer hover:opacity-80 active:scale-95 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border border-gray-600">
                      <User size={20} className="text-gray-300"/>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate w-14 text-center">{contact.relation || contact.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderProfile = () => (
     <div className="p-6 flex flex-col items-center pt-12 h-full bg-charcoal text-white overflow-y-auto">
         <div className="w-24 h-24 bg-gradient-to-tr from-gray-700 to-gray-600 rounded-full mb-4 flex items-center justify-center shadow-xl border-4 border-charcoal relative group">
             <User size={48} className="text-gray-300" />
             <div className="absolute bottom-0 right-0 bg-gray-800 p-1.5 rounded-full border border-gray-600">
                <Edit2 size={12} className="text-white" />
             </div>
         </div>
         
         <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
         <p className="text-gray-500 text-sm mb-4">{user?.phone}</p>
         
         {!isEditingProfile && (
             <div className="flex gap-2 mt-2 mb-8">
                <span className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">
                  {user?.medicalInfo?.bloodGroup || 'N/A'}
                </span>
                <span className="bg-gray-800 px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">
                  {user?.medicalInfo?.allergies || 'No Allergies'}
                </span>
             </div>
         )}

         {/* Action Bar for Edit */}
         <div className="w-full max-w-md flex justify-end mb-2">
            {!isEditingProfile ? (
              <button onClick={startEditing} className="text-xs font-bold text-emergency flex items-center gap-1 hover:text-red-400">
                 <Edit2 size={12} /> EDIT PROFILE
              </button>
            ) : (
               <div className="flex gap-3">
                  <button onClick={cancelEdit} className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white">
                     <X size={12} /> CANCEL
                  </button>
                  <button onClick={saveProfile} className="text-xs font-bold text-safe flex items-center gap-1 hover:text-green-400">
                     <Save size={12} /> SAVE CHANGES
                  </button>
               </div>
            )}
         </div>

         <div className="w-full space-y-4 max-w-md pb-24">
             {/* Medical Details */}
             <div className="bg-[#2f3640] p-4 rounded-xl border border-gray-700 shadow-md">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-xs text-gray-500 uppercase">Medical Details</h3>
                 </div>
                 <div className="space-y-3 text-sm">
                    {isEditingProfile ? (
                      <>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Blood Group</span>
                           <input 
                              value={editForm.medicalInfo?.bloodGroup || ''} 
                              onChange={(e) => updateMedicalField('bloodGroup', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Conditions</span>
                           <input 
                              value={editForm.medicalInfo?.conditions || ''} 
                              onChange={(e) => updateMedicalField('conditions', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Medications</span>
                           <input 
                              value={editForm.medicalInfo?.medications || ''} 
                              onChange={(e) => updateMedicalField('medications', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Allergies</span>
                           <input 
                              value={editForm.medicalInfo?.allergies || ''} 
                              onChange={(e) => updateMedicalField('allergies', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                           <span className="text-gray-400">Conditions</span>
                           <span className="text-right">{user?.medicalInfo?.conditions || 'None'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                           <span className="text-gray-400">Medications</span>
                           <span className="text-right">{user?.medicalInfo?.medications || 'None'}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-400">Allergies</span>
                           <span className="text-right">{user?.medicalInfo?.allergies || 'None'}</span>
                        </div>
                      </>
                    )}
                 </div>
             </div>

             {/* Emergency Contacts */}
             <div className="bg-[#2f3640] p-4 rounded-xl border border-gray-700 shadow-md">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-xs text-gray-500 uppercase">Emergency Contacts</h3>
                 </div>
                 <div className="space-y-2">
                    {user?.emergencyContacts?.map((contact, idx) => (
                       <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                          <div className="flex flex-col">
                             <span className="font-medium">{contact.name || 'Unknown'}</span>
                             <span className="text-gray-500 text-xs">{contact.relation} • {contact.phone}</span>
                          </div>
                          <button 
                            onClick={() => handleCall(contact.phone)} 
                            className="bg-safe/20 text-safe px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-safe/30 transition-colors"
                          >
                            CALL
                          </button>
                       </div>
                    ))}
                    {user?.emergencyContacts?.length === 0 && (
                        <div className="text-center text-gray-500 py-4 text-sm">No contacts added</div>
                    )}
                 </div>
                 {isEditingProfile && (
                     <div className="mt-4 pt-2 border-t border-gray-700 text-center">
                        <span className="text-xs text-gray-500">Edit contacts in Account Settings</span>
                     </div>
                 )}
             </div>
         </div>
     </div>
  );

  const renderSettings = () => (
    <div className="p-6 h-full bg-charcoal text-white overflow-y-auto pb-24">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 pl-2">Preferences</h3>
          <div className="bg-[#2f3640] rounded-xl overflow-hidden border border-gray-700">
            <button 
                onClick={() => toggleSetting('notifications')}
                className="w-full flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-400" />
                <span>Notifications</span>
              </div>
              {settings.notifications ? (
                 <ToggleRight size={24} className="text-safe" />
              ) : (
                 <ToggleLeft size={24} className="text-gray-500" />
              )}
            </button>
            <button 
                onClick={() => toggleSetting('haptic')}
                className="w-full flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-gray-400" />
                <span>Haptic Feedback</span>
              </div>
              {settings.haptic ? (
                 <ToggleRight size={24} className="text-safe" />
              ) : (
                 <ToggleLeft size={24} className="text-gray-500" />
              )}
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center gap-3">
                <Moon size={18} className="text-gray-400" />
                <span>Theme</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">Dark</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 pl-2">Security & Data</h3>
          <div className="bg-[#2f3640] rounded-xl overflow-hidden border border-gray-700">
            <button 
                onClick={handleChangePassword}
                className="w-full flex items-center justify-between p-4 border-b border-gray-700 hover:bg-gray-700/50 active:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-gray-400" />
                <span>Change Password</span>
              </div>
              <ChevronRight size={16} className="text-gray-500" />
            </button>
            <button 
                onClick={handleDownloadData}
                disabled={downloading}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-700/50 active:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <Download size={18} className="text-gray-400" />
                <span>{downloading ? 'Preparing Download...' : 'Download My Data'}</span>
              </div>
              {!downloading && <ChevronRight size={16} className="text-gray-500" />}
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {passwordMessage && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2 animate-in slide-in-from-bottom">
                <Check size={18} className="text-green-400" />
                <span className="text-sm text-green-200">{passwordMessage}</span>
            </div>
        )}

        <div className="pt-4">
          <button 
            onClick={handleLogoutRequest}
            className="w-full py-4 bg-red-600/10 text-red-500 font-bold rounded-xl hover:bg-red-600/20"
          >
             Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  // --- Main Render ---

  // If in active emergency mode (and dispatching animation is done)
  if (myActiveEmergency && !isDispatching) {
    return (
      <ActiveEmergency 
        type={myActiveEmergency.type} 
        onClose={handleEmergencyEnd}
        onUpdateType={handleEmergencyUpdate}
        onLogout={handleLogoutRequest}
      />
    );
  }

  // If currently dispatching, show splash screen
  if (isDispatching) {
     return (
        <div className="h-screen w-full bg-emergency flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-24 h-24 rounded-full border-4 border-white border-t-transparent animate-spin mb-6"></div>
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter animate-pulse">Alerting...</h2>
           <p className="text-white/80 mt-2 font-bold">Acquiring Satellites & Responders</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-screen bg-charcoal text-white relative">
       
       {/* Tab Content */}
       <div className="flex-1 overflow-hidden relative">
          {currentTab === AppTab.HOME && renderHome()}
          {currentTab === AppTab.GUIDE && <ChatAssistant />}
          {currentTab === AppTab.PROFILE && renderProfile()}
          {currentTab === AppTab.SETTINGS && renderSettings()}
       </div>

       {/* Bottom Navigation */}
       <div className="h-16 bg-[#2f3640] border-t border-gray-700 flex justify-around items-center px-2 shrink-0 z-50">
          <NavButton 
            active={currentTab === AppTab.HOME} 
            icon={<Home size={24} />} 
            label="Home" 
            onClick={() => setCurrentTab(AppTab.HOME)} 
          />
          <NavButton 
            active={currentTab === AppTab.GUIDE} 
            icon={<MessageSquare size={24} />} 
            label="Assistant" 
            onClick={() => setCurrentTab(AppTab.GUIDE)} 
          />
          <NavButton 
            active={currentTab === AppTab.PROFILE} 
            icon={<User size={24} />} 
            label="Profile" 
            onClick={() => setCurrentTab(AppTab.PROFILE)} 
          />
          <NavButton 
            active={currentTab === AppTab.SETTINGS} 
            icon={<Settings size={24} />} 
            label="Settings" 
            onClick={() => setCurrentTab(AppTab.SETTINGS)} 
          />
       </div>

       {/* Logout Confirmation Overlay */}
       {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in">
            <div className="bg-[#2f3640] rounded-2xl p-6 w-full max-w-sm border border-red-500/50 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                    <Shield size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
                 <p className="text-gray-400 text-sm">
                   {myActiveEmergency 
                     ? "WARNING: You have an active SOS. Logging out will stop live tracking for responders." 
                     : "Are you sure you want to log out?"}
                 </p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-white hover:bg-gray-600 active:scale-95">Cancel</button>
                 <button 
                   onClick={() => { setShowLogoutConfirm(false); logoutUser(); onLogout(); }} 
                   className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 active:scale-95"
                 >
                   Logout
                 </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

const NavButton = ({ active, icon, label, onClick }: any) => (
  <button 
    onClick={() => { if(navigator.vibrate) navigator.vibrate(20); onClick(); }}
    className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
  >
    <div className={`p-1 rounded-xl transition-all ${active ? 'bg-white/10 -translate-y-1' : ''}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-bold ${active ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-300`}>{label}</span>
  </button>
);

export default GeneralApp;