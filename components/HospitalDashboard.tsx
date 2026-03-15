// @ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import {
  Activity, Users, Clock, AlertTriangle, MapPin, Radio, Shield,
  Video, Phone, Loader2, Ambulance, CheckCircle, Filter, Download,
  Plus, Inbox, LayoutDashboard, ClipboardList, Package, UserCheck,
  LogOut, Search, XCircle, TrendingUp, Heart, MessageSquare
} from "lucide-react";

import { useEmergencySystem } from '../contexts/EmergencyContext';
import { HospitalProfile } from '../types';
import { CommandCenterDashboard } from './CommandCenterDashboard';
import { HospitalCommunicationCenter } from './HospitalCommunicationCenter';

interface HospitalDashboardProps {
  onLogout?: () => void;
}

type DashboardView = 'overview' | 'cases' | 'resources' | 'staff' | 'analytics' | 'communication';

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ onLogout }) => {
  // --- 1. HOOKS ---
  const { 
    activeEmergencies,
    logoutUser,
    currentUser,
    assignHospital,
    updateEmergencyStatus,
    resolveEmergency 
  } = useEmergencySystem();

  const hospital = currentUser as HospitalProfile;
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const prevIncidentIds = useRef<Set<string>>(new Set());
const [resourceCounts, setResourceCounts] = useState({ staff: 0, beds: 0, fleet: 0 });
  const [staffDetails, setStaffDetails] = useState<{ name: string, dept: string }[]>([]);
const [assigningIncident, setAssigningIncident] = useState<any | null>(null);
  const [assignmentForm, setAssignmentForm] = useState({ eta: '', doctor: '' });
const [dischargingIncident, setDischargingIncident] = useState<any | null>(null);
const [viewingVideo, setViewingVideo] = useState<any | null>(null); // holds the incident whose video is being viewed

const liveIncidents = useMemo(() => {
  return activeEmergencies.filter(e => {
    // 1. Always keep 'active', 'assigned', 'dispatched', and 'arrived' cases visible
    const isLive = ['active', 'assigned', 'dispatched', 'arrived'].includes(e.status);
    
    // 2. Hide if hospital rejected it
    const hasRejected = hospital?.id && e.respondedHospitals?.[hospital.id]?.status === 'rejected';
    if (hasRejected) return false;

    // 3. Show if unassigned (active) or if it's already taken by THIS specific hospital
    const isAvailableOrMine = !e.assignedHospitalId || e.assignedHospitalId === hospital?.id;

    return isLive && isAvailableOrMine;
  });
}, [activeEmergencies, hospital?.id]);

  const filteredIncidents = useMemo(() => {
    return liveIncidents.filter(inc =>
      (inc.userProfile?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.type?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inc.location?.address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [liveIncidents, searchQuery]);

  // --- 3. DYNAMIC ANALYTICS (REPLACED DUMMY DATA) ---
  const incidentClassification = useMemo(() => {
    const counts = { Cardiac: 0, Accident: 0, Respiratory: 0, Other: 0 };
    activeEmergencies.forEach(e => {
      const typeName = e.type?.name?.toLowerCase() || '';
      if (typeName.includes('heart') || typeName.includes('cardiac')) counts.Cardiac++;
      else if (typeName.includes('accident') || typeName.includes('bleeding')) counts.Accident++;
      else if (typeName.includes('breathing') || typeName.includes('respiratory')) counts.Respiratory++;
      else counts.Other++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [activeEmergencies]);

  const liveStatusTrend = useMemo(() => {
    return [
      { name: 'Active', count: activeEmergencies.filter(e => e.status === 'active').length },
      { name: 'Assigned', count: activeEmergencies.filter(e => e.status === 'assigned' || e.status === 'enroute').length },
      { name: 'Dispatched', count: activeEmergencies.filter(e => e.status === 'dispatched').length },
      { name: 'Arrived', count: activeEmergencies.filter(e => e.status === 'arrived').length },
    ];
  }, [activeEmergencies]);

  const COLORS = ['#4F46E5', '#EF4444', '#10B981', '#F59E0B'];

  // --- 4. ALERT SYSTEM ---
  useEffect(() => {
    const currentIds = new Set(liveIncidents.map(e => e.id));
    let hasNew = false;
    currentIds.forEach(id => { if (!prevIncidentIds.current.has(id)) hasNew = true; });

    if (hasNew) {
      playAlertSound();
      if (Notification.permission === "granted") {
        new Notification("🚨 NEW SOS RECEIVED", { body: "Emergency signal detected." });
      }
    }
    prevIncidentIds.current = currentIds;
  }, [liveIncidents]);
  


  // Inside HospitalDashboard before the return statement
const busyResources = useMemo(() => {
  // Count incidents that have been accepted by THIS hospital
  const currentAssignments = activeEmergencies.filter(
    e => e.assignedHospitalId === hospital?.id && e.status !== 'resolved'
  );

  return {
    ambulances: currentAssignments.length,
    staff: currentAssignments.length // Assuming 1 doctor per active case
  };
}, [activeEmergencies, hospital?.id]);

// Calculate current availability
const availableAmbulances = Math.max(0, (hospital?.resources?.ambulances || 0) - busyResources.ambulances);
const availableStaff = Math.max(0, (hospital?.resources?.doctors || 0) - busyResources.staff);


// 1. Ensure this state is at the top of your component
const [shiftHistory, setShiftHistory] = useState<any[]>([]);

// 2. The Assignment Handler
const handleAccept = (incident: any) => {
  setAssigningIncident(incident); 
};

// 3. Confirm Assignment (Saving the manual textbox name)
const confirmAssignment = async () => {
  if (!assigningIncident) return;
  setLoadingAction(assigningIncident.id);

  const typedDoctorName = assignmentForm.doctor; // Capture the name from the textbox

  // 🟢 CRITICAL: Physically attach the name to the local object for the report
  assigningIncident.assignedDoctor = typedDoctorName;

  const success = await assignHospital(assigningIncident.id, hospital.id, assignmentForm.eta, { 
    assignedDoctor: typedDoctorName 
  });
  
  if (!success) {
    alert("This emergency request has already been accepted by another hospital.");
  }
  
  setAssigningIncident(null);
  setAssignmentForm(prev => ({ ...prev, eta: '' })); // Don't clear doctor name yet
  setLoadingAction(null);
};

const handleReject = async (incidentId: string) => {
  if (!hospital?.id) return;
  await rejectEmergencyRequest(incidentId, hospital.id);
};


// --- ACTION HANDLERS ---

// 1. Trigger the branded confirmation modal
const initiateEndEmergency = (incident: any) => {
  setDischargingIncident(incident); 
};

// 2. Final logic executed when "Confirm Discharge" is clicked in your custom UI
const confirmDischarge = async () => {
  if (!dischargingIncident) return;
  setLoadingAction(dischargingIncident.id);

  // Capture doctor name immediately for the report archive
  const doctorName = dischargingIncident.assignedDoctor || assignmentForm.doctor || 'On-Duty Officer';

  setShiftHistory(prev => [...prev, { 
    ...dischargingIncident, 
    assignedDoctor: doctorName, 
    status: 'resolved' 
  }]);

  await resolveEmergency(dischargingIncident.id);
  
  // Cleanup
  setDischargingIncident(null);
  setLoadingAction(null);
  setAssignmentForm({ eta: '', doctor: '' }); 
};
  
  if (!currentUser || currentUser.role !== 'hospital') return null;

  // --- 5. ACTION HANDLERS ---
  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const handleLogout = () => { logoutUser(); onLogout?.(); };

  // --- 6. RENDER HELPERS ---
  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && <p className="text-xs text-green-500 flex items-center gap-1 mt-2"><TrendingUp size={12}/> {trend}</p>}
      </div>
      <div className={`p-4 rounded-xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
    </div>
  );

 const generateShiftReport = () => {
  // Combine live and archived cases so nothing is missing
  const allShiftIncidents = [...activeEmergencies, ...shiftHistory];

  const reportWindow = window.open('', '_blank');
  if (reportWindow) {
    reportWindow.document.write(`
      <html>
        <head>
          <title>CERS+ Official Shift Handover</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 60px; color: #1e293b; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 5px solid #4f46e5; padding-bottom: 30px; margin-bottom: 50px; }
            .logo-icon { background: #ef4444; color: white; padding: 12px; border-radius: 14px; font-weight: 900; font-size: 20px; text-align: center; width: 30px; }
            .logo-text { font-size: 34px; font-weight: 900; color: #1e1b4b; letter-spacing: -1.5px; }
            .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; color: #4f46e5; margin: 40px 0 15px 0; display: flex; align-items: center; gap: 10px; }
            .section-title::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 12px; overflow: hidden; border: 1px solid #f1f5f9; }
            th { text-align: left; background: #f8fafc; padding: 16px; font-size: 11px; color: #64748b; text-transform: uppercase; }
            td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
            .status-chip { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 900; }
            .footer-grid { margin-top: 100px; text-align: right; }
            .signature-box { border-top: 2px solid #1e293b; padding-top: 15px; display: inline-block; width: 300px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div class="logo-icon">✚</div>
              <div>
                <div class="logo-text">CERS+ <span style="font-size: 12px; color: #6366f1; font-weight: 400;">PRO</span></div>
                <div style="font-size: 11px; color: #94a3b8; font-weight: 600;">DAILY EMERGENCY LOGGING SYSTEM</div>
              </div>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 26px; font-weight: 800; color: #1e293b; margin: 0;">${hospital?.name || 'City General Hospital'}</h2>
              <div style="font-size: 11px; color: #64748b; margin-top: 5px;">SHIFT REPORT • ${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="section-title">Case Outcomes & Medical Assignments</div>
          <table>
            <thead>
              <tr>
                <th>Incident ID</th>
                <th>Emergency Type / Patient</th>
                <th>Assigned Officer (Manual Entry)</th>
                <th>Location Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allShiftIncidents.map(inc => `
                <tr>
                  <td style="font-family: monospace; font-weight: 700; color: #64748b;">#${inc.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div style="font-weight: 800; color: #1e293b;">${inc.type?.name || 'Critical SOS'}</div>
                    <div style="font-size: 11px; color: #94a3b8;">Ref: ${inc.userProfile?.name || 'Anonymous Patient'}</div>
                  </td>
                  <td style="font-weight: 700; color: #4f46e5;">
                    ${inc.assignedDoctor || 'On-Duty Officer'}
                  </td>
                  <td style="font-size: 12px;">${inc.location?.address || 'Surat, Gujarat, India'}</td>
                  <td>
                    <span class="status-chip" style="background: ${inc.status === 'resolved' ? '#ecfdf5' : '#fff7ed'}; color: ${inc.status === 'resolved' ? '#059669' : '#c2410c'};">
                      ${inc.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-grid">
            <div class="signature-box">
              <div style="font-size: 12px; font-weight: 800; color: #1e293b;">Signature of Chief Medical Officer</div>
              <div style="font-size: 10px; color: #94a3b8; font-weight: 400; margin-top: 4px;">Digitally Authenticated via CERS+ Shift Protocol</div>
              <div style="margin-top: 15px; font-family: 'Courier New', monospace; font-size: 10px; color: #cbd5e1;">CERT-ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
            </div>
          </div>
          
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    reportWindow.document.close();
  }
};
  
 return (
  <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
  <aside className="w-72 bg-indigo-950 text-white flex flex-col shadow-2xl">
  <div className="p-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-red-500 rounded-lg"><Activity size={24} /></div>
      <h1 className="font-black text-2xl tracking-tight">CERS+ <span className="text-xs font-normal text-indigo-300">PRO</span></h1>
    </div>
    <nav className="space-y-2">
      {[
        { id: 'overview', icon: LayoutDashboard, label: 'Command Center' },
        { id: 'communication', icon: MessageSquare, label: 'Comms Network' },
        { id: 'cases', icon: ClipboardList, label: 'Active SOS' },
        { id: 'resources', icon: Ambulance, label: 'Fleet & Beds' },
        { id: 'staff', icon: UserCheck, label: 'Medical Staff' },
        { id: 'analytics', icon: TrendingUp, label: 'Data Insights' },
      ].map(item => (
        <button
          key={item.id}
          onClick={() => setCurrentView(item.id as DashboardView)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id ? 'bg-indigo-600 shadow-lg' : 'hover:bg-indigo-900/50 text-indigo-200'}`}
        >
          <item.icon size={20} /> {item.label}
        </button>
      ))}
    </nav>
  </div>

  {/* 🟢 Unified Bottom Section: Removes the gap between buttons */}
  <div className="mt-auto p-6 border-t border-indigo-900/50 space-y-4">
    <button 
      onClick={generateShiftReport}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-all border border-emerald-500/20"
    >
      <Download size={20} /> <span className="text-sm font-bold">Download Report</span>
    </button>

    <button 
      onClick={handleLogout} 
      className="flex items-center gap-3 text-red-400 hover:text-red-300 px-4 py-2 w-full transition-colors group"
    >
      <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" /> 
      <span className="font-bold">Sign Out</span>
    </button>
  </div>
</aside>

    <main className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-gray-100 p-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{hospital?.name || 'Emergency Center'}</h2>
          <div className="flex items-center gap-2 text-sm text-green-500"><Radio size={12} className="animate-pulse"/> System Online</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search incidents..." 
              className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl w-64 focus:ring-2 ring-indigo-500 transition-all"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard 
    title="Active SOS" 
    value={liveIncidents.length} 
    icon={AlertTriangle} 
    color="bg-red-500" 
    trend="Live Updates" 
  />
  <StatCard 
    title="Ambulances" 
    value={availableAmbulances} // 🟢 Now dynamic
    icon={Ambulance} 
    color="bg-blue-500" 
    trend="Available Fleet" 
  />
  <StatCard 
    title="Staff On-Duty" 
    value={availableStaff} // 🟢 Now dynamic
    icon={Users} 
    color="bg-indigo-500" 
    trend="Ready" 
  />
  <StatCard 
    title="Total Managed Today" 
    value={shiftHistory.length} // 🟢 Counts cases from your archive
    icon={Clock} 
    color="bg-green-500" 
    trend="Shift History" 
  />
</div>

        {/* --- 1. COMMAND CENTER (OVERVIEW) --- */}
{currentView === 'overview' && (
  <CommandCenterDashboard />
)}
{/* --- 2. ACTIVE SOS (REAL-TIME QUEUE) --- */}
{currentView === 'cases' && (
  <div className="space-y-6 animate-in slide-in-from-left duration-500">
    <div className="bg-white p-8 rounded-3xl border-l-8 border-red-500 shadow-sm flex justify-between items-center">
      <div>
        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Active SOS Queue</h3>
        <p className="text-slate-500 font-medium">Monitoring {liveIncidents.length} live emergency signals</p>
      </div>
      <AlertTriangle size={48} className="text-red-100" />
    </div>
    <div className="grid grid-cols-1 gap-4">
      {filteredIncidents.map((incident) => (
        <div key={incident.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="text-3xl font-black text-slate-100">#{incident.id.slice(-4)}</div>
            <div>
              <h4 className="font-bold text-xl text-slate-800">{incident.type?.name}</h4>
              <p className="text-slate-500 italic text-sm">{incident.location?.address}</p>
            </div>
          </div>
          <div className="flex gap-3">
             {!incident.assignedHospitalId ? (
              <div className="flex gap-3">
                 <button onClick={() => handleReject(incident.id)} className="px-6 py-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all">Reject</button>
                 <button onClick={() => handleAccept(incident)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all">Emergency Accept</button>
              </div>
             ) : (
               <>
                 {incident.videoEvidence && (
                   <button
                     onClick={() => setViewingVideo(incident)}
                     className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all text-sm animate-pulse"
                   >
                     <Video size={16} /> View Evidence
                   </button>
                 )}
                 <button onClick={() => initiateEndEmergency(incident)} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all"><XCircle size={24}/></button>
               </>
             )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{/* --- 3. FLEET & BEDS (DYNAMIC RESOURCE GRID) --- */}
{currentView === 'resources' && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right duration-500">
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h3 className="font-bold text-xl text-slate-800 mb-8 flex items-center gap-3">
        <Ambulance className="text-indigo-600" /> Ambulance Fleet
      </h3>
      <div className="space-y-4">
        {/* Uses real hospital resources */}
        {Array.from({ length: hospital?.resources?.ambulances || 0 }).map((_, i) => (
          <div key={i} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-black text-slate-700">UNIT-0{i + 1}</span>
            <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">Standby</span>
          </div>
        ))}
      </div>
    </div>
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
      <h3 className="font-bold text-xl text-slate-800 mb-8 flex items-center gap-3 text-left">
        <Activity className="text-red-500" /> ER Capacity
      </h3>
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: hospital?.resources?.beds || 0 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl border-2 border-green-100 bg-green-50/50 flex items-center justify-center font-black text-xs text-green-600">{i + 1}</div>
        ))}
      </div>
    </div>
  </div>
)}

{/* --- 4. MEDICAL STAFF (PERSONNEL TABLE) --- */}
{currentView === 'staff' && (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
      <h3 className="font-bold text-xl text-slate-800">Medical Personnel Roster</h3>
      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-bold">{hospital?.resources?.doctors || 0} Staff Active</div>
    </div>
    <table className="w-full text-left">
      <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
        <tr>
          <th className="px-8 py-4">Name</th>
          <th className="px-8 py-4">Department</th>
          <th className="px-8 py-4">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        <tr className="hover:bg-slate-50 transition-colors">
          <td className="px-8 py-6 font-bold text-slate-800">{hospital?.adminDetails?.name || 'Administrator'}</td>
          <td className="px-8 py-6 text-slate-500 italic">Emergency Medicine</td>
          <td className="px-8 py-6"><span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-600">Admin On-Duty</span></td>
        </tr>
      </tbody>
    </table>
  </div>
)}
       </div>
        {assigningIncident && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-black text-slate-800">Assign Emergency</h3>
          <p className="text-sm text-slate-500">Case ID: #{assigningIncident.id.slice(-6)}</p>
        </div>
        <button onClick={() => setAssigningIncident(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <XCircle className="text-slate-400" size={24} />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Ambulance ETA (min)</label>
          <input 
            type="text" placeholder="e.g., 8 min"
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all"
            value={assignmentForm.eta}
            onChange={(e) => setAssignmentForm({...assignmentForm, eta: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Assign Medical Staff</label>
          {/* Inside your Assign Emergency Modal */}
<div>
  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">
    Assign Medical Officer (Manual Entry)
  </label>
  <input 
    type="text" 
    placeholder="Enter Doctor's Full Name"
    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all"
    value={assignmentForm.doctor}
    onChange={(e) => setAssignmentForm({...assignmentForm, doctor: e.target.value})}
  />
</div>
        </div>

        <button 
          onClick={() => confirmAssignment()}
          disabled={!assignmentForm.eta || !assignmentForm.doctor}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all mt-4"
        >
          Confirm Assignment
        </button>
      </div>
    </div>
  </div>
       )}

{/* --- NEW COMMUNICATION CENTER VIEW --- */}
{currentView === 'communication' && (
  <div className="h-[calc(100vh-[180px])] -m-8 p-8 overflow-y-auto">
    <HospitalCommunicationCenter />
  </div>
)}

       {/* --- CUSTOM DISCHARGE CONFIRMATION BOX --- */}
{dischargingIncident && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="text-red-500" size={40} />
      </div>
      
      <h3 className="text-xl font-black text-slate-800 mb-2">Confirm Discharge?</h3>
      <p className="text-sm text-slate-500 mb-8 leading-relaxed">
        You are about to end the emergency for <span className="font-bold text-slate-700">#${dischargingIncident.id.slice(-6).toUpperCase()}</span>. This action will archive the case to your shift report.
      </p>

      <div className="flex flex-col gap-3">
        <button 
          onClick={confirmDischarge}
          className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
        >
          Yes, Discharge Patient
        </button>
        <button 
          onClick={() => setDischargingIncident(null)}
          className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </main>

      {/* ─── 🎥 VIDEO EVIDENCE MODAL ─── */}
      {viewingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1e293b] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-700">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <Video className="text-red-400" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg">Scene Evidence</h3>
                  <p className="text-slate-400 text-xs">
                    Case #{viewingVideo.id.slice(-6).toUpperCase()} 
                    {' · '}
                    {viewingVideo.type?.name || 'Emergency'}
                    {' · '}
                    {viewingVideo.location?.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingVideo(null)}
                className="p-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black relative">
              {viewingVideo.videoEvidence?.url ? (
                <video
                  src={viewingVideo.videoEvidence.url}
                  controls
                  autoPlay
                  className="w-full max-h-[420px] object-contain"
                />
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                  <Video size={48} className="mb-3 opacity-30" />
                  <p className="font-bold">Video not available</p>
                  <p className="text-xs mt-1 text-slate-600">The patient's video may still be uploading</p>
                </div>
              )}

              {/* Timestamp overlay */}
              {viewingVideo.videoEvidence && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-2 py-1 rounded-lg text-[10px] text-white font-mono border border-white/10">
                  🔴 REC · {new Date(viewingVideo.videoEvidence.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Evidence Metadata */}
            <div className="p-6 grid grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Duration</p>
                <p className="text-white font-black text-xl">
                  {viewingVideo.videoEvidence?.duration
                    ? `${viewingVideo.videoEvidence.duration}s`
                    : '—'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Patient</p>
                <p className="text-white font-black text-sm truncate">
                  {viewingVideo.userProfile?.name || 'Unknown'}
                </p>
              </div>
              <div className="bg-slate-800 rounded-2xl p-4 text-center">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Blood Group</p>
                <p className="text-red-400 font-black text-xl">
                  {viewingVideo.userProfile?.medicalInfo?.bloodGroup || '—'}
                </p>
              </div>
            </div>

            {/* Important notice about Blob URL limitation */}
            <div className="mx-6 mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-2">
              <AlertTriangle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-yellow-300 text-[10px] leading-relaxed">
                <strong>Live Session Video:</strong> This evidence is streamed directly from the patient's device during the active emergency session. 
                It will not be available after the case is discharged. Download or screenshot if needed for records.
              </p>
            </div>

          </div>
        </div>
      )}
  </div>
);
};

export default HospitalDashboard;