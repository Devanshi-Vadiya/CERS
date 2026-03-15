import React, { useState } from 'react';
import { useHospitalComm } from '../contexts/HospitalCommContext';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import { 
  Network, Search, MapPin, AlertCircle, Building2, UserPlus, FileText, 
  Settings2, Activity, Send, Clock, CheckCircle, XCircle, Ambulance,
  MessageSquare, ChevronRight, Hash, Phone, Share2, ClipboardList, Info,
  Navigation, UserCheck, ShieldCheck
} from 'lucide-react';
import { HospitalProfile, HospitalAssistanceRequest } from '../types';

type CommView = 'directory' | 'sentRequests' | 'incomingRequests' | 'activeChats';

export const HospitalCommunicationCenter = () => {
  const { 
    hospitals, myRequests, incomingRequests, messages,
    updateFacilityData, sendAssistanceRequest, respondToRequest, updateRequestStatus, sendMessage 
  } = useHospitalComm();
  const { currentUser, activeEmergencies } = useEmergencySystem();

  const [activeTab, setActiveTab] = useState<CommView>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<HospitalAssistanceRequest | null>(null);

  // Facility update form state
  const me = currentUser as HospitalProfile;
  const [isUpdatingFacilities, setIsUpdatingFacilities] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    ambulances: me?.resources?.ambulances || 0,
    icuBeds: me?.icuBeds || 0,
    facilitiesText: (me?.facilities || []).join(', ')
  });

  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    caseId: '',
    requiredFacility: '',
    patientCondition: '',
    urgency: 'High' as 'High' | 'Critical' | 'Moderate',
    toHospitalId: '',
    toHospitalName: ''
  });

  // Chat state
  const [chatMessage, setChatMessage] = useState('');

  const filteredHospitals = hospitals.filter(h => 
    h.id !== me?.id && 
    (h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     h.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (h.facilities || []).some(f => f.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleUpdateFacilities = async () => {
    setIsUpdatingFacilities(true);
    await updateFacilityData(
      facilityForm.facilitiesText.split(',').map(f => f.trim()).filter(Boolean),
      facilityForm.icuBeds,
      facilityForm.ambulances
    );
    setIsUpdatingFacilities(false);
  };

  const handleCreateRequest = async () => {
    await sendAssistanceRequest(newRequest);
    setShowRequestForm(false);
    setActiveTab('sentRequests');
    setNewRequest({ 
      caseId: '', 
      requiredFacility: '', 
      patientCondition: '', 
      urgency: 'High',
      toHospitalId: '',
      toHospitalName: ''
    });
  };

  const RequestBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'Pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold border border-yellow-200">Pending</span>;
      case 'Accepted': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200">Accepted</span>;
      case 'Rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200">Rejected</span>;
      case 'Awaiting Response': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold border border-yellow-200">Pending</span>;
      case 'Facility Confirmed': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold border border-green-200">Accepted</span>;
      case 'Assistance Declined': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-200">Rejected</span>;
      case 'Patient Transfer In Progress': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold border border-blue-200">Transferring</span>;
      case 'Case Resolved': return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">Resolved</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <div>
            <h1 className="text-2xl font-black flex items-center gap-3 text-slate-800">
              <Network className="text-indigo-600" size={28} /> Communication Center
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Inter-hospital logistics and facility requests</p>
         </div>
         <button 
           onClick={() => setShowRequestForm(true)}
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
         >
           <AlertCircle size={18} /> Ask for Assistance
         </button>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Navigation Sidebar */}
        <div className="w-64 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
             <h3 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-2 px-2">Views</h3>
             <nav className="space-y-1">
               <button 
                 onClick={() => { setActiveTab('directory'); setSelectedRequest(null); }}
                 className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'directory' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 <span className="flex items-center gap-2"><Building2 size={16}/> Directory</span>
               </button>
              <button 
                onClick={() => { setActiveTab('sentRequests'); setSelectedRequest(null); }}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'sentRequests' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2"><Send size={16}/> Sent Requests</span>
              </button>
              <button 
                onClick={() => { setActiveTab('incomingRequests'); setSelectedRequest(null); }}
                className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'incomingRequests' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-2"><Activity size={16}/> Incoming Requests</span>
                {incomingRequests.filter(r => (r as any).requestStatus === 'Pending' || r.status === 'Pending' || r.status === 'Awaiting Response').length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{incomingRequests.filter(r => (r as any).requestStatus === 'Pending' || r.status === 'Pending' || r.status === 'Awaiting Response').length}</span>
                )}
              </button>
               <button 
                 onClick={() => setActiveTab('activeChats')}
                 className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'activeChats' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                 <span className="flex items-center gap-2"><MessageSquare size={16}/> Active Chats</span>
               </button>
             </nav>
          </div>

          {/* Quick Facility Updater */}
          <div className="p-6 bg-slate-50 mt-auto">
             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 flex items-center gap-1"><Settings2 size={12}/> My Availability</h4>
             <div className="space-y-3">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">ICU Beds</label>
                  <input type="number" 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 outline-none"
                    value={facilityForm.icuBeds}
                    onChange={(e) => setFacilityForm({...facilityForm, icuBeds: parseInt(e.target.value) || 0})}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Ambulances</label>
                  <input type="number" 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 outline-none"
                    value={facilityForm.ambulances}
                    onChange={(e) => setFacilityForm({...facilityForm, ambulances: parseInt(e.target.value) || 0})}
                  />
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Facilities (comma seq)</label>
                  <input type="text" 
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm focus:ring-1 outline-none"
                    value={facilityForm.facilitiesText}
                    onChange={(e) => setFacilityForm({...facilityForm, facilitiesText: e.target.value})}
                  />
               </div>
               <button 
                 onClick={handleUpdateFacilities} disabled={isUpdatingFacilities}
                 className="w-full bg-slate-800 text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-900 transition-all mt-2"
               >
                 {isUpdatingFacilities ? 'Updating...' : 'Update Status'}
               </button>
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative">
           
           {/* DIRECTORY VIEW */}
           {activeTab === 'directory' && (
             <div className="flex-1 flex flex-col min-h-0">
               <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                 <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                   <input 
                     type="text" placeholder="Search hospitals by name, city, or facility..." 
                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all text-sm font-medium"
                     value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
               </div>
               <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
                 {filteredHospitals.map(h => (
                   <div key={h.id} className="p-5 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all group">
                     <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                            <Building2 size={18} /> {h.name}
                          </h3>
                          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14}/> {h.city || 'Location N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ICU Beds</p>
                          <p className="font-black text-xl text-indigo-600">{h.icuBeds || 0}</p>
                        </div>
                     </div>
                     
                     <div className="flex flex-wrap gap-2 mb-4">
                       {h.facilities && h.facilities.map((f, i) => (
                         <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded bg-opacity-50 text-[10px] font-bold uppercase tracking-wider">{f}</span>
                       ))}
                       {(!h.facilities || h.facilities.length === 0) && <span className="text-xs text-slate-400 italic">No facilities listed</span>}
                     </div>

                     <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <Ambulance size={16}/> {h.resources?.ambulances || 0} Ambulances
                        </div>
                        <button 
                          onClick={() => {
                            setNewRequest({ 
                              ...newRequest, 
                              requiredFacility: '', 
                              toHospitalId: (h.id as any) || '', 
                              toHospitalName: h.name || '' 
                            });
                            setShowRequestForm(true);
                          }}
                          className="text-indigo-600 font-bold text-sm hover:underline"
                        >
                          Request Help
                        </button>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

          {/* INCOMING & SENT REQUESTS VIEW */}
          {(activeTab === 'incomingRequests' || activeTab === 'sentRequests') && !selectedRequest && (
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
               <div className="grid gap-4">
                {(activeTab === 'sentRequests' ? myRequests : incomingRequests).length === 0 ? (
                   <div className="text-center py-20">
                     <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                     <p className="text-slate-400 font-medium tracking-wide">No requests found in this folder.</p>
                   </div>
                 ) : (
                  (activeTab === 'sentRequests' ? myRequests : incomingRequests).map(req => (
                     <div key={req.id} 
                       onClick={() => setSelectedRequest(req)}
                       className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
                     >
                       <div className="flex items-center gap-6">
                        <div className="text-2xl font-black text-slate-200">#{(req as any).requestId ? String((req as any).requestId).slice(-4) : req.id.slice(-4)}</div>
                         <div>
                           <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-slate-800">
                              {(req as any).fromHospitalName || (req as any).requestingHospitalName} ⟶ {(req as any).toHospitalName || ''}
                            </h4>
                            {req.urgency === 'Critical' && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Critical</span>}
                           </div>
                          <p className="text-sm text-slate-500 w-64 truncate">Case: {req.caseId || '—'} • Need: {req.requiredFacility}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(((req as any).requestTimestamp || (req as any).timestamp)).toLocaleTimeString()}
                          </p>
                          <RequestBadge status={(req as any).requestStatus || req.status} />
                         </div>
                        {activeTab === 'incomingRequests' && (((req as any).requestStatus || req.status) === 'Pending' || ((req as any).requestStatus || req.status) === 'Awaiting Response') && (
                          <div className="hidden md:flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); respondToRequest(req.id, 'Accepted'); }}
                              className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); respondToRequest(req.id, 'Rejected'); }}
                              className="px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                         <ChevronRight className="text-slate-300" />
                       </div>
                     </div>
                   ))
                 )}
               </div>
             </div>
           )}

           {/* REQUEST DETAIL VIEW & CHAT INTEGRATION */}
           {selectedRequest && (
             <div className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedRequest(null)}
                      className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-all"
                    >
                      <XCircle size={20} />
                    </button>
                    <div>
                      <h2 className="font-bold text-xl text-slate-800">Assistance Request #{(((selectedRequest as any).requestId || selectedRequest.id) as string).slice(-6)}</h2>
                      <p className="text-sm text-slate-500">From: <span className="font-medium text-slate-700">{(selectedRequest as any).fromHospitalName || selectedRequest.requestingHospitalName}</span></p>
                    </div>
                  </div>
                  <RequestBadge status={(selectedRequest as any).requestStatus || selectedRequest.status} />
                </div>

                {/* Split Layout: Details | Chat */}
                <div className="flex-1 flex min-h-0 bg-slate-50 max-md:flex-col">
                   
                   {/* Details Panel */}
                   <div className="w-1/3 min-w-[300px] border-r border-slate-200 p-6 overflow-y-auto bg-white max-md:w-full">
                      <div className="space-y-6">
                         <div>
                           <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Required Facility</h4>
                           <p className="font-bold text-slate-800 p-3 bg-slate-50 rounded-xl border border-slate-100">{selectedRequest.requiredFacility}</p>
                         </div>
                         <div>
                           <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Patient Condition</h4>
                           <p className="text-sm text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">{selectedRequest.patientCondition}</p>
                         </div>
                         <div>
                           <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">Urgency Level</h4>
                           <span className={`px-3 py-1 rounded inline-block text-xs font-bold uppercase ${
                             selectedRequest.urgency === 'Critical' ? 'bg-red-100 text-red-700' : 
                             selectedRequest.urgency === 'High' ? 'bg-orange-100 text-orange-700' : 
                             'bg-yellow-100 text-yellow-700'
                           }`}>{selectedRequest.urgency}</span>
                         </div>

                         {activeTab === 'incomingRequests' && (((selectedRequest as any).requestStatus || selectedRequest.status) === 'Pending' || ((selectedRequest as any).requestStatus || selectedRequest.status) === 'Awaiting Response') && (
                           <div className="pt-6 border-t border-slate-100 space-y-3">
                              <button 
                                onClick={() => respondToRequest(selectedRequest.id, 'Accepted')}
                                className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all flex justify-center items-center gap-2"
                              >
                                <CheckCircle size={18}/> Accept Request
                              </button>
                              <button 
                                onClick={() => respondToRequest(selectedRequest.id, 'Rejected')}
                                className="w-full bg-white text-slate-600 border border-slate-200 font-bold py-3 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all flex justify-center items-center gap-2"
                              >
                                <XCircle size={18} /> Reject Request
                              </button>
                           </div>
                         )}

                         {/* Status Controls for Requesting Host */}
                         {activeTab === 'sentRequests' && selectedRequest.status === 'Accepted' && (
                           <div className="pt-6 border-t border-slate-100 space-y-3">
                              <p className="text-xs text-slate-500 mb-2 text-center">Confirmed by: <strong>{selectedRequest.respondingHospitalName}</strong></p>
                              <button 
                                onClick={() => updateRequestStatus(selectedRequest.id, 'Patient Transfer In Progress')}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex justify-center items-center gap-2"
                              >
                                <Ambulance size={18}/> Begin Transfer
                              </button>
                           </div>
                         )}

                         {activeTab === 'sentRequests' && selectedRequest.status === 'Patient Transfer In Progress' && (
                           <div className="pt-6 border-t border-slate-100 space-y-3">
                              <button 
                                onClick={() => updateRequestStatus(selectedRequest.id, 'Case Resolved')}
                                className="w-full bg-indigo-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-950 shadow-lg shadow-slate-200 transition-all flex justify-center items-center gap-2"
                              >
                                <CheckCircle size={18}/> Mark as Resolved
                              </button>
                           </div>
                         )}
                      </div>
                   </div>

                   {/* Chat Panel */}
                   <div className="flex-1 flex flex-col bg-slate-50/50 relative">
                    {['Accepted', 'Facility Confirmed', 'Patient Transfer In Progress', 'Case Resolved'].includes(((selectedRequest as any).requestStatus || selectedRequest.status)) ? (
                       <>
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2"><MessageSquare size={16} className="text-indigo-500"/> Coordination Link</h3>
                             <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                          </div>
                          <div className="flex items-center gap-2">
                             <button title="Emergency Hotline" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                               <Phone size={16} />
                             </button>
                             <button title="Share Location" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                               <Navigation size={16} />
                             </button>
                             <button title="Case Details" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                               <ClipboardList size={16} />
                             </button>
                          </div>
                        </div>

                        {/* Enhanced Feature Bar */}
                        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 flex gap-2 overflow-x-auto no-scrollbar">
                           <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                              <ShieldCheck size={12}/> Verify Resources
                           </button>
                           <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                              <UserCheck size={12}/> Confirm Staff
                           </button>
                           <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                              <Ambulance size={12}/> Dispatch Team
                           </button>
                           <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                              <Share2 size={12}/> Share Vitals
                           </button>
                           <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all">
                              <Info size={12}/> Protocol Guide
                           </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                           {messages[selectedRequest.id]?.map((msg) => {
                             const isMe = msg.senderId === me?.id;
                             const isSystem = (msg as any).isSystem || msg.senderId === 'system';
                             
                             if (isSystem) {
                               return (
                                 <div key={msg.id} className="flex justify-center my-4">
                                   <div className="bg-slate-100 px-4 py-1.5 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200">
                                     {msg.text}
                                   </div>
                                 </div>
                               );
                             }

                             return (
                               <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                 <span className="text-[10px] text-slate-400 font-bold mb-1 ml-1">{isMe ? 'You' : msg.senderName}</span>
                                 <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                                   isMe ? 'bg-indigo-600 text-white rounded-br-sm shadow-md' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                                 }`}>
                                   {msg.text}
                                 </div>
                                 <span className="text-[10px] text-slate-400 mt-1 mr-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                               </div>
                             );
                           })}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-200">
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (chatMessage.trim()) {
                              sendMessage(selectedRequest.id, chatMessage.trim());
                              setChatMessage('');
                            }
                          }} className="flex gap-2">
                            <input 
                              type="text" placeholder="Type a message..." 
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-indigo-500 text-sm"
                              value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                            />
                            <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                              <Send size={18} />
                            </button>
                          </form>
                        </div>
                       </>
                     ) : (
                       <div className="flex-1 flex items-center justify-center flex-col text-center p-8">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm mb-4">
                           <MessageSquare className="text-slate-300" size={24} />
                         </div>
                         <h3 className="font-bold text-slate-600 mb-1">Secure Channel Locked</h3>
                         <p className="text-sm text-slate-400 max-w-xs">Chat coordination becomes available once the facility request is Confirmed by a responding hospital.</p>
                       </div>
                     )}
                   </div>
                </div>
             </div>
           )}

           {/* ACTIVE CHATS LIST VIEW */}
           {activeTab === 'activeChats' && !selectedRequest && (
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
               <div className="grid gap-4">
                {[...myRequests, ...incomingRequests].filter(r => ['Accepted', 'Facility Confirmed', 'Patient Transfer In Progress'].includes(r.status)).length === 0 ? (
                   <div className="text-center py-20">
                     <MessageSquare className="mx-auto text-slate-200 mb-4" size={48} />
                     <p className="text-slate-400 font-medium tracking-wide">No active coordination chats.</p>
                   </div>
                 ) : (
                  [...myRequests, ...incomingRequests].filter(r => ['Accepted', 'Facility Confirmed', 'Patient Transfer In Progress'].includes(r.status)).map(req => (
                     <div key={req.id} 
                       onClick={() => setSelectedRequest(req)}
                       className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
                     >
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
                           <Hash className="text-indigo-500" size={20} />
                         </div>
                         <div>
                          <h4 className="font-bold text-slate-800">Coordination: #{(req.caseId || '').slice(-4)}</h4>
                          <p className="text-sm text-slate-500">{(req as any).fromHospitalName || req.requestingHospitalName} ⟷ {(req as any).toHospitalName || (req as any).respondingHospitalName || ''}</p>
                         </div>
                       </div>
                       <ChevronRight className="text-slate-300" />
                     </div>
                   ))
                 )}
               </div>
             </div>
           )}

        </div>
      </div>

      {/* NEW REQUEST MODAL */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">Facility Assistance Request</h3>
                <p className="text-sm text-slate-500">Send an emergency request to the hospital network.</p>
              </div>
              <button onClick={() => setShowRequestForm(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle className="text-slate-400" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Receiving Hospital</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all font-medium text-slate-700 appearance-none"
                  value={newRequest.toHospitalId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const h = hospitals.find(x => String(x.id) === id);
                    setNewRequest({
                      ...newRequest,
                      toHospitalId: id,
                      toHospitalName: h?.name || ''
                    });
                  }}
                >
                  <option value="" disabled>Select receiving hospital</option>
                  {hospitals.filter(h => h.id !== me?.id).map(h => (
                    <option key={String(h.id)} value={String(h.id)}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Reference Case</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all font-medium text-slate-700 appearance-none"
                  value={newRequest.caseId}
                  onChange={(e) => setNewRequest({...newRequest, caseId: e.target.value})}
                >
                  <option value="" disabled>Select an active emergency you accepted</option>
                  {/* Provide active cases the hospital owns */}
                  {activeEmergencies.map(e => (
                    <option key={e.id} value={e.id}>Case #{e.id.slice(-6)} - {e.type?.name}</option>
                  ))}
                  {activeEmergencies.length === 0 && <option value="manual-override">Manual Entry (No Active Cases)</option>}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Required Facility / Resource</label>
                <input 
                  type="text" placeholder="e.g. O- Blood, Neurosurgeon, Trauma ICU..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all"
                  value={newRequest.requiredFacility}
                  onChange={(e) => setNewRequest({...newRequest, requiredFacility: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Patient Condition Summary</label>
                <textarea 
                  rows={3} placeholder="Briefly describe the situation..."
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-indigo-500 outline-none transition-all resize-none"
                  value={newRequest.patientCondition}
                  onChange={(e) => setNewRequest({...newRequest, patientCondition: e.target.value})}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Urgency Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['High', 'Critical', 'Moderate'].map(level => (
                    <button 
                      key={level}
                      onClick={() => setNewRequest({...newRequest, urgency: level as any})}
                      className={`py-3 rounded-xl font-bold text-sm border transition-all ${
                        newRequest.urgency === level 
                          ? level === 'Critical' ? 'bg-red-500 text-white border-red-500' : 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleCreateRequest}
                disabled={!newRequest.toHospitalId || !newRequest.caseId || !newRequest.requiredFacility || !newRequest.patientCondition}
                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
              >
                Broadcast Network Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
