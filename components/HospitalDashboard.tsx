import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { 
  Activity, Users, Clock, AlertTriangle, MapPin, Radio, Shield, 
  LayoutDashboard, ClipboardList, Package, UserCheck, Search, LogOut, Phone, Inbox, Ambulance, CheckCircle, Video, Loader2, Filter, ChevronDown, Download, Plus
} from 'lucide-react';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import { HospitalProfile } from '../types';

interface HospitalDashboardProps {
  onLogout?: () => void;
}

const resourceData = [
  { name: 'Active', value: 8, color: '#27AE60' },
  { name: 'Busy', value: 4, color: '#F39C12' },
  { name: 'Maintenance', value: 2, color: '#C0392B' },
];

const analyticsData = [
  { name: 'Mon', calls: 12 },
  { name: 'Tue', calls: 19 },
  { name: 'Wed', calls: 15 },
  { name: 'Thu', calls: 22 },
  { name: 'Fri', calls: 30 },
  { name: 'Sat', calls: 45 },
  { name: 'Sun', calls: 38 },
];

const STAFF_ROSTER = [
  { id: 1, name: 'Dr. Sarah Smith', role: 'Trauma Surgeon', status: 'On Duty', shift: '08:00 - 20:00' },
  { id: 2, name: 'Dr. Mike Ross', role: 'Cardiologist', status: 'On Duty', shift: '09:00 - 21:00' },
  { id: 3, name: 'Nurse Joy', role: 'Head Nurse', status: 'Break', shift: '07:00 - 19:00' },
  { id: 4, name: 'Paramedic John', role: 'Ambulance Unit 4', status: 'Dispatched', shift: '12:00 - 00:00' },
];

type DashboardView = 'overview' | 'cases' | 'resources' | 'staff' | 'analytics';

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onLogout }) => {
  const { activeEmergencies, logoutUser, currentUser, assignHospital, updateEmergencyStatus } = useEmergencySystem();
  
  // UI State
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Context for alerting
  const audioContextRef = useRef<AudioContext | null>(null);
  const prevIncidentCount = useRef(0);

  // Safety check to prevent crash on logout
  if (!currentUser || currentUser.role !== 'hospital') {
      return null;
  }
  
  const hospital = currentUser as HospitalProfile;

  // Filter incidents
  const liveIncidents = activeEmergencies.filter(e => 
      e.status !== 'resolved' && 
      (e.status === 'active' || e.assignedHospitalId === hospital.id)
  );

  // Search Logic (Fixed null crash)
  const filteredIncidents = liveIncidents.filter(inc => 
    (inc.userProfile.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inc.type?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inc.location.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sound Effect Effect
  useEffect(() => {
    if (liveIncidents.length > prevIncidentCount.current) {
        playAlertSound();
    }
    prevIncidentCount.current = liveIncidents.length;
  }, [liveIncidents.length]);

  const playAlertSound = () => {
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  const handleLogout = () => {
    logoutUser();
    if (onLogout) onLogout();
  };

  const handleAction = async (incidentId: string, action: () => void) => {
    setLoadingAction(incidentId);
    setTimeout(() => {
        action();
        setLoadingAction(null);
    }, 800);
  };

  const handleAccept = (incidentId: string) => {
    handleAction(incidentId, () => assignHospital(incidentId, hospital.id));
  };

  const handleDispatch = (incidentId: string) => {
    handleAction(incidentId, () => updateEmergencyStatus(incidentId, 'dispatched', 'Ambulance dispatched from HQ'));
  };

  const handleArrived = (incidentId: string) => {
    handleAction(incidentId, () => updateEmergencyStatus(incidentId, 'arrived', 'Ambulance arrived at scene'));
  };

  // --- RENDER HELPERS ---

  const renderIncidentCard = (incident: any) => {
    const isAssigned = incident.status !== 'active';
    const isLoading = loadingAction === incident.id;
    return (
      <div key={incident.id} className="p-4 rounded-xl border border-gray-100 hover:border-l-4 hover:border-l-hospital-primary hover:shadow-md transition-all bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top duration-300">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isAssigned ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
              {isAssigned ? incident.status.toUpperCase() : incident.type?.category || 'PENDING'}
            </span>
            <span className="text-xs font-mono text-gray-400">{incident.id}</span>
            <span className="text-xs text-gray-400">• {new Date(incident.timestamp).toLocaleTimeString()}</span>
          </div>
          <h4 className="font-bold text-gray-800 text-lg">{incident.type?.name || 'Unspecified Emergency'}</h4>
          <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Users size={12} /> {incident.userProfile.name} ({incident.userProfile.medicalInfo?.bloodGroup || 'N/A'})
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <MapPin size={12} /> {incident.location.address}
              </p>
              {incident.videoEvidence && (
                <p className="text-sm text-blue-600 font-bold flex items-center gap-2 cursor-pointer hover:underline" onClick={() => window.alert("Opening Secure Video Feed...")}>
                  <Video size={12} /> Video Evidence Available
                </p>
              )}
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="text-right">
            <div className="text-xl font-bold text-hospital-primary">3m</div>
            <div className="text-xs text-gray-400">ETA</div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.location.href=`tel:${incident.userProfile.phone}`} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200">
              <Phone size={18} />
            </button>
            
            {!isAssigned && (
                <button 
                  onClick={() => handleAccept(incident.id)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-hospital-primary text-white text-sm font-bold shadow-sm hover:bg-blue-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16}/> : 'Accept Case'}
                </button>
            )}

            {incident.status === 'assigned' && (
                <button 
                  onClick={() => handleDispatch(incident.id)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-bold shadow-sm hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16}/> : <><Ambulance size={16} /> Dispatch</>}
                </button>
            )}

            {incident.status === 'dispatched' && (
                <button 
                  onClick={() => handleArrived(incident.id)}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-bold shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16}/> : <><CheckCircle size={16} /> Arrived</>}
                </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(currentView) {
      case 'cases':
        return (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-700 text-lg">Active Case Log</h3>
                <div className="flex gap-2">
                   <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"><Filter size={16}/> Filter</button>
                   <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"><Download size={16}/> Export</button>
                </div>
             </div>
             <div className="space-y-4">
               {filteredIncidents.length > 0 ? filteredIncidents.map(renderIncidentCard) : (
                  <div className="text-center py-12 text-gray-400">No active cases match your search.</div>
               )}
             </div>
          </div>
        );
      case 'resources':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Ambulance size={20}/> Fleet Status</h3>
                 <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                       <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="font-medium text-gray-600">Unit #{i}</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-bold ${i < 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                             {i < 3 ? 'DISPATCHED' : 'AVAILABLE'}
                          </span>
                       </div>
                    ))}
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Package size={20}/> Equipment</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Defibrillators</span> <span className="font-bold">12</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Oxygen Tanks</span> <span className="font-bold">45</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Wheelchairs</span> <span className="font-bold">20</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Stretchers</span> <span className="font-bold">8</span></div>
                 </div>
              </div>
          </div>
        );
      case 'staff':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-lg">Duty Roster</h3>
                <button className="px-4 py-2 bg-hospital-primary text-white text-sm rounded-lg font-bold flex items-center gap-2"><Plus size={16}/> Add Staff</button>
             </div>
             <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider">
                   <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Shift</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {STAFF_ROSTER.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                         <td className="p-4 font-bold text-gray-700">{staff.name}</td>
                         <td className="p-4 text-gray-500">{staff.role}</td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                               staff.status === 'On Duty' ? 'bg-green-100 text-green-700' : 
                               staff.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                               {staff.status}
                            </span>
                         </td>
                         <td className="p-4 text-gray-400 font-mono">{staff.shift}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        );
      case 'analytics':
        return (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <h3 className="font-bold text-gray-700 mb-6">Weekly Emergency Calls</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                          <Tooltip />
                          <Line type="monotone" dataKey="calls" stroke="#1A5276" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                       </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                 <h3 className="font-bold text-gray-700 mb-6">Response Time Analysis</h3>
                 <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                    Chart data loading...
                 </div>
              </div>
           </div>
        );
      case 'overview':
      default:
        return (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard 
                 title="Active Emergencies" 
                 value={liveIncidents.length.toString()} 
                 icon={<AlertTriangle className={liveIncidents.length > 0 ? "text-red-500" : "text-gray-400"}/>} 
                 trend={liveIncidents.length > 0 ? "Action Required" : "All clear"} 
                 onClick={() => setCurrentView('cases')}
              />
              <StatCard title="Ambulances Available" value="3/12" icon={<Activity className="text-blue-500"/>} trend="Low Stock" onClick={() => setCurrentView('resources')} />
              <StatCard title="Staff Online" value="8" icon={<Users className="text-green-500"/>} trend="Shift A" onClick={() => setCurrentView('staff')} />
              <StatCard title="Avg Response" value="4m 12s" icon={<Clock className="text-purple-500"/>} trend="-30s" onClick={() => setCurrentView('analytics')} />
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
              
              {/* Left Column: Active Cases (Real Data Only) */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Radio size={16} className={liveIncidents.length > 0 ? "text-red-500 animate-pulse" : "text-gray-400"} /> Live Incoming Feed
                  </h3>
                  <button onClick={() => setCurrentView('cases')} className="text-xs font-bold text-hospital-primary hover:underline">View All</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
                  {filteredIncidents.length === 0 ? (
                    // Empty State
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
                       <div className="bg-gray-100 p-6 rounded-full">
                          <Inbox size={48} />
                       </div>
                       <div className="text-center">
                          <h4 className="font-bold text-gray-600 text-lg">No Active Emergencies</h4>
                          <p className="text-sm max-w-xs mx-auto mt-2">The dashboard shows data only when a CERS+ user presses SOS in your service area.</p>
                       </div>
                    </div>
                  ) : (
                    // Live Data
                    filteredIncidents.map(renderIncidentCard)
                  )}
                </div>
              </div>

              {/* Right Column: Resource Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-gray-700">Resource Allocation</h3>
                </div>
                <div className="p-4 flex-1">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={resourceData} 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value"
                        >
                          {resourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 mt-4">
                    {resourceData.map((item) => (
                      <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                          <span className="text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-800">{item.value} Units</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setCurrentView('resources')} className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Manage Resources</button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-hospital-bg text-hospital-text font-sans overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-hospital-primary text-white shadow-2xl z-20 transition-all">
        <div className="p-6 border-b border-white/10 flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('overview')}>
          <div className="bg-white text-hospital-primary p-2 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">CERS+ PRO</h1>
            <p className="text-xs text-white/60">Command Center</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 space-y-2 px-3">
          <NavItem icon={<LayoutDashboard size={20}/>} label="Overview" active={currentView === 'overview'} onClick={() => setCurrentView('overview')} />
          <NavItem icon={<ClipboardList size={20}/>} label="Active Cases" badge={liveIncidents.length > 0 ? liveIncidents.length.toString() : undefined} active={currentView === 'cases'} onClick={() => setCurrentView('cases')} />
          <NavItem icon={<Package size={20}/>} label="Resources" active={currentView === 'resources'} onClick={() => setCurrentView('resources')} />
          <NavItem icon={<UserCheck size={20}/>} label="Staff Roster" active={currentView === 'staff'} onClick={() => setCurrentView('staff')} />
          <NavItem icon={<Activity size={20}/>} label="Analytics" active={currentView === 'analytics'} onClick={() => setCurrentView('analytics')} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-white/80 hover:text-white w-full p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header (Visible only on small screens) */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-30 shrink-0">
             <div className="flex items-center gap-3" onClick={() => setCurrentView('overview')}>
                <div className="bg-hospital-primary text-white p-1.5 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                   <h1 className="font-bold text-sm tracking-tight text-hospital-primary">CERS+ PRO</h1>
                   <p className="text-[10px] text-gray-500">Mobile Command</p>
                </div>
             </div>
             
             <button 
                onClick={handleLogout}
                className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                title="Sign Out"
             >
                <LogOut size={20} />
             </button>
        </header>

        {/* Desktop Header (Hidden on small screens) */}
        <header className="hidden lg:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 shadow-sm shrink-0">
          <div className="flex items-center gap-4 w-96 relative">
            <Search size={20} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search patients, cases, or staff..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border-transparent focus:bg-white focus:border-hospital-primary focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{hospital.adminDetails.name}</p>
                  <p className="text-xs text-gray-500">{hospital.adminDetails.designation}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-hospital-primary text-white flex items-center justify-center font-bold text-sm border-2 border-blue-100">
                  {hospital.adminDetails.name.charAt(0)}
               </div>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-hospital-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">{currentView.replace('-', ' ')}</h2>
                <span className="text-sm text-gray-500">Live Sync Active • {hospital.name}</span>
              </div>
              {currentView !== 'overview' && (
                 <button onClick={() => setCurrentView('overview')} className="text-sm font-bold text-hospital-primary hover:underline">Back to Overview</button>
              )}
            </div>

            {renderContent()}

          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, badge, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-white/10 text-white font-bold shadow-inner' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    {badge && <span className="bg-hospital-alert text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{badge}</span>}
  </button>
);

const StatCard = ({ title, value, icon, trend, onClick }: any) => (
  <div onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all hover:border-hospital-primary group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">{icon}</div>
      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{trend}</span>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-800 mb-1 group-hover:text-hospital-primary transition-colors">{value}</h3>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
    </div>
  </div>
);

export default HospitalDashboard;