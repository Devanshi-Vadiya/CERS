import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { 
  Radio, Clock, CheckCircle, XCircle, Ambulance, Activity, ShieldAlert
} from 'lucide-react';
import { EmergencyIncident } from '../types';

export const CommandCenterDashboard = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);

  useEffect(() => {
    // Listen to ALL emergencies for command center
    const q = query(
      collection(db, "emergencies"), 
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EmergencyIncident[];
      
      setIncidents(data);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-100 text-red-700 border-red-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'dispatched': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'arrived': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'resolved': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getResponseBadge = (status: string) => {
    switch(status) {
      case 'pending': return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1"><Clock size={10}/> Pending</span>;
      case 'accepted': return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"><CheckCircle size={10}/> Accepted</span>;
      case 'rejected': return <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><XCircle size={10}/> Rejected</span>;
      default: return null;
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <div>
            <h1 className="text-2xl font-black flex items-center gap-3 text-slate-800">
              <ShieldAlert className="text-red-600" size={28} /> Network Command Center
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Live monitoring of hospital responses & emergency dispatching</p>
         </div>
         <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            <Radio size={14} className="animate-pulse" /> Live Broadcast Active
         </div>
      </div>

      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 relative">
        {incidents.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-sm">
             <Activity className="mx-auto text-slate-200 mb-4" size={64} />
             <p className="text-slate-400 font-medium text-lg">No active emergency broadcasts.</p>
           </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               {/* Header Section */}
               <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-xl flex items-center justify-center ${incident.status === 'active' ? 'bg-red-100/50' : 'bg-slate-100'}`}>
                        <Activity className={incident.status === 'active' ? 'text-red-500 animate-pulse' : 'text-slate-500'} size={24} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                           #{incident.id.slice(-6).toUpperCase()} 
                           <span className="text-slate-400 text-sm font-normal">• {incident.type?.name || 'Emergency'}</span>
                        </h3>
                        <p className="text-sm text-slate-500">{incident.userProfile?.name} • {incident.location?.address}</p>
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${getStatusColor(incident.status)}`}>
                        {incident.status}
                     </span>
                     <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={10} /> {new Date(incident.timestamp).toLocaleTimeString()}
                     </span>
                  </div>
               </div>

               {/* Responses Section */}
               <div className="p-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Live Hospital Broadcast Responses</h4>
                  
                  {(!incident.respondedHospitals || Object.keys(incident.respondedHospitals).length === 0) ? (
                     <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No broadcast data recorded for this request.
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {(Object.entries(incident.respondedHospitals) as [string, { status: string, timestamp: string }][]).map(([hospitalId, response]) => (
                           <div key={hospitalId} className={`p-4 rounded-2xl border transition-all ${
                              response.status === 'accepted' ? 'bg-green-50 border-green-200 shadow-sm' : 
                              response.status === 'rejected' ? 'bg-red-50/30 border-red-100 opacity-70' : 
                              'bg-white border-slate-200 shadow-sm'
                           }`}>
                              <div className="flex justify-between items-center mb-1">
                                 <span className="font-bold text-slate-700 text-sm truncate pr-2">Hosp. ID: {hospitalId.slice(0, 6).toUpperCase()}</span>
                                 {getResponseBadge(response.status)}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                 Responded: {new Date(response.timestamp).toLocaleTimeString()}
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Dispatch Info */}
                  {incident.assignedHospitalId && (
                     <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Ambulance size={20} /></div>
                           <div>
                              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-0.5">Primary Responder Locked</p>
                              <p className="font-bold text-indigo-900 text-sm">Hospital ID: {incident.assignedHospitalId.slice(0, 6).toUpperCase()}</p>
                           </div>
                        </div>
                        {incident.ambulanceEta && (
                           <div className="text-right">
                              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-0.5">ETA</p>
                              <p className="font-bold text-indigo-900 text-lg">{incident.ambulanceEta}</p>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
