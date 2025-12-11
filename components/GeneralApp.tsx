import React, { useState, useEffect } from 'react';
import SOSButton from './SOSButton';
import ActiveEmergency from './ActiveEmergency';
import ChatAssistant from './ChatAssistant';
import { AppMode, AppTab, EmergencyType, UserProfile } from '../types';
import { Home, MessageSquare, User, Phone, Settings, Shield, ChevronRight, Bell, Moon, Lock, LogOut, ToggleLeft, ToggleRight, Smartphone, Eye, Download, Edit2, Save, X, Plus, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useEmergencySystem } from '../contexts/EmergencyContext';

interface GeneralAppProps {
  onLogout: () => void;
}

const GeneralApp: React.FC<GeneralAppProps> = ({ onLogout }) => {
  const { currentUser, logoutUser, dispatchEmergency, activeEmergencies, updateEmergencyType, resolveEmergency, updateUserProfile } = useEmergencySystem();
  
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.HOME);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
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

  const user = currentUser as UserProfile;
  const myActiveEmergency = activeEmergencies.find(e => e.userId === currentUser?.id && e.status !== 'resolved');

  // --- Handlers ---
  const handleSOSClick = () => {
    dispatchEmergency(null);
  };

  const handleEmergencyUpdate = (type: EmergencyType | null) => {
    if (myActiveEmergency && type) {
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
      medicalInfo: { ...prev.medicalInfo!, [field]: value }
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
                              value={editForm.medicalInfo?.bloodGroup} 
                              onChange={(e) => updateMedicalField('bloodGroup', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Conditions</span>
                           <input 
                              value={editForm.medicalInfo?.conditions} 
                              onChange={(e) => updateMedicalField('conditions', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Medications</span>
                           <input 
                              value={editForm.medicalInfo?.medications} 
                              onChange={(e) => updateMedicalField('medications', e.target.value)}
                              className="bg-black/20 border border-gray-600 rounded p-2 text-white" 
                           />
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-gray-400 text-xs">Allergies</span>
                           <input 
                              value={editForm.medicalInfo?.allergies} 
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
            className="w-full py-4 bg-red-600/10 text-red-500 font-bold rounded-xl border border-red-600/30 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            LOGOUT
          </button>
          <p className="text-center text-xs text-gray-600 mt-4">
            Version 2.5.0 • CERS+ Emergency Systems
          </p>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-[#2f3640] rounded-2xl p-6 w-full max-w-sm border border-red-500/50 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                    <Shield size={24} />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-2">Warning: Active Emergency</h3>
                 <p className="text-gray-400 text-sm">You have an active SOS alert. Logging out will stop real-time tracking updates for responders.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-700 rounded-xl font-bold text-white hover:bg-gray-600">Cancel</button>
                 <button onClick={() => { logoutUser(); onLogout(); }} className="flex-1 py-3 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700">Logout Anyway</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );

  // Full Screen Emergency Overlay
  if (myActiveEmergency) {
    return (
      <div className="fixed inset-0 z-50 bg-charcoal">
         <ActiveEmergency 
            type={myActiveEmergency.type} 
            onClose={handleEmergencyEnd} 
            onUpdateType={handleEmergencyUpdate}
            onLogout={() => { logoutUser(); onLogout(); }}
         />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-charcoal font-sans text-white overflow-hidden">
      
      {/* Desktop Sidebar (Visible > md) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#151b20] border-r border-gray-800 pt-8 pb-4 px-4 z-20">
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-black text-white tracking-tighter">
            CERS<span className="text-emergency">+</span>
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Personal Safety</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <NavButton 
            icon={<Home size={20}/>} 
            label="SOS Dashboard" 
            active={currentTab === AppTab.HOME} 
            onClick={() => setCurrentTab(AppTab.HOME)} 
          />
          <NavButton 
            icon={<MessageSquare size={20}/>} 
            label="First Aid Guide" 
            active={currentTab === AppTab.GUIDE} 
            onClick={() => setCurrentTab(AppTab.GUIDE)} 
          />
          <NavButton 
            icon={<User size={20}/>} 
            label="Medical ID" 
            active={currentTab === AppTab.PROFILE} 
            onClick={() => setCurrentTab(AppTab.PROFILE)} 
          />
          <NavButton 
            icon={<Settings size={20}/>} 
            label="Settings" 
            active={currentTab === AppTab.SETTINGS} 
            onClick={() => setCurrentTab(AppTab.SETTINGS)} 
          />
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full h-full max-w-4xl mx-auto md:max-w-none md:mx-0">
        
        {/* Mobile Header */}
        <header className="md:hidden px-6 py-4 flex justify-between items-center bg-charcoal/90 backdrop-blur sticky top-0 z-10 border-b border-gray-800">
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-safe animate-pulse"></div>
             <span className="text-safe font-bold text-xs tracking-wider">SECURE</span>
           </div>
           <Settings size={20} className="text-gray-500" onClick={() => setCurrentTab(AppTab.SETTINGS)} />
        </header>

        {/* Tab Content Render */}
        <div className="flex-1 overflow-hidden relative">
          {currentTab === AppTab.HOME && renderHome()}
          {currentTab === AppTab.GUIDE && <ChatAssistant />}
          {currentTab === AppTab.PROFILE && renderProfile()}
          {currentTab === AppTab.SETTINGS && renderSettings()}
        </div>

        {/* Mobile Bottom Nav (Hidden on Desktop) */}
        <nav className="md:hidden bg-[#151b20] border-t border-gray-800 px-6 py-3 flex justify-between items-center z-50 pb-safe">
            <MobileNavButton 
              icon={<Home size={24} />} 
              label="SOS" 
              active={currentTab === AppTab.HOME} 
              onClick={() => setCurrentTab(AppTab.HOME)}
              color="text-emergency"
            />
            <MobileNavButton 
              icon={<MessageSquare size={24} />} 
              label="Guide" 
              active={currentTab === AppTab.GUIDE} 
              onClick={() => setCurrentTab(AppTab.GUIDE)}
              color="text-trust"
            />
            <MobileNavButton 
              icon={<User size={24} />} 
              label="ID" 
              active={currentTab === AppTab.PROFILE} 
              onClick={() => setCurrentTab(AppTab.PROFILE)}
              color="text-white"
            />
            <MobileNavButton 
              icon={<Settings size={24} />} 
              label="Menu" 
              active={currentTab === AppTab.SETTINGS} 
              onClick={() => setCurrentTab(AppTab.SETTINGS)}
              color="text-gray-400"
            />
        </nav>
      </main>
    </div>
  );
};

// Helper Components
const NavButton = ({ icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
      ${active ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
  >
    {icon}
    {label}
  </button>
);

const MobileNavButton = ({ icon, label, active, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${active ? color : 'text-gray-600'}`}
  >
    {React.cloneElement(icon, { strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default GeneralApp;
