import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Activity,
  LogOut,
  Ban,
  List
} from 'lucide-react';

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'directory'>('pending');
  const [pendingHospitals, setPendingHospitals] = useState<any[]>([]);
  const [registeredHospitals, setRegisteredHospitals] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { updateHospitalStatus } = useEmergencySystem();

useEffect(() => {
  const qPending = query(collection(db, "hospitals"), where("status", "==", "pending"));
  const unPending = onSnapshot(qPending, (snapshot) => {
    setPendingHospitals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });

  const qRegistered = query(collection(db, "hospitals"), where("status", "in", ["verified", "rejected", "blacklisted"]));
  const unRegistered = onSnapshot(qRegistered, (snapshot) => {
    setRegisteredHospitals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });

  return () => { unPending(); unRegistered(); };
}, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-800">
            <Clock className="text-blue-600" size={32} /> Hospital Verification Queue
          </h1>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 bg-white text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 hover:text-red-600 transition-all shadow-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Clock size={20} /> Pending Approvals ({pendingHospitals.length})
          </button>
          <button 
            onClick={() => setActiveTab('directory')}
            className={`flex-1 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <List size={20} /> Registered Directory ({registeredHospitals.length})
          </button>
        </div>

        {activeTab === 'pending' && (
          <div className="grid gap-4">
          {pendingHospitals.map((hosp) => (
            <div key={hosp.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all">
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl"><Building2 className="text-blue-600" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{hosp.name || "Unknown Org"}</h3>
                    <p className="text-slate-500 text-sm">{hosp.adminDetails?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setExpandedId(expandedId === hosp.id ? null : hosp.id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    {expandedId === hosp.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                  
                  <button
                    disabled={updatingId === hosp.id}
                    onClick={async () => {
                      setUpdatingId(hosp.id);
                      await updateHospitalStatus(hosp.id, "verified");
                      setUpdatingId(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${updatingId === hosp.id ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white shadow-green-100"}`}
                  >
                    <CheckCircle size={18} /> {updatingId === hosp.id ? "Approving..." : "Approve"}
                  </button>

                  <button
                    disabled={updatingId === hosp.id}
                    onClick={async () => {
                      const reason = prompt("Enter rejection reason:");
                      if (!reason) return;
                      setUpdatingId(hosp.id);
                      await updateHospitalStatus(hosp.id, "rejected", reason);
                      setUpdatingId(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border transition-all ${updatingId === hosp.id ? "bg-red-100 text-red-300 cursor-not-allowed" : "bg-white text-red-600 hover:bg-red-50 border-red-100"}`}
                  >
                    <XCircle size={18} /> {updatingId === hosp.id ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>

              {/* 🟢 RE-ADDED: Vetting Details (ICU, License, etc.) */}
              {expandedId === hosp.id && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><FileText size={14} /> Licensing</h4>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100">
                        <p className="text-sm"><strong>License:</strong> {hosp.licenseNumber}</p>
                        <p className="text-sm"><strong>Admin:</strong> {hosp.adminDetails?.name}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Activity size={14} /> Resources</h4>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-center">
                        <div className="p-2 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400">Ambulances</p><p className="font-bold">{hosp.resources?.ambulances || 0}</p></div>
                        <div className="p-2 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400">ICU Beds</p><p className="font-bold">{hosp.resources?.icuBeds || 0}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {pendingHospitals.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <Building2 className="mx-auto text-slate-200 mb-4" size={64} />
              <p className="text-slate-400 font-medium text-lg">Your queue is empty.</p>
            </div>
          )}
        </div>
        )}

        {/* DIRECTORY VIEW */}
        {activeTab === 'directory' && (
          <div className="grid gap-4">
            {registeredHospitals.map((hosp) => (
              <div key={hosp.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all">
                <div className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      hosp.status === 'verified' ? 'bg-green-50' : 
                      hosp.status === 'blacklisted' ? 'bg-red-50' : 'bg-slate-50'
                    }`}>
                      <Building2 className={
                        hosp.status === 'verified' ? 'text-green-600' : 
                        hosp.status === 'blacklisted' ? 'text-red-500' : 'text-slate-400'
                      } />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        {hosp.name || "Unknown Org"}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                           hosp.status === 'verified' ? 'bg-green-100 text-green-700' : 
                           hosp.status === 'blacklisted' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {hosp.status}
                        </span>
                      </h3>
                      <p className="text-slate-500 text-sm">{hosp.adminDetails?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button onClick={() => setExpandedId(expandedId === hosp.id ? null : hosp.id)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                      {expandedId === hosp.id ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                    
                    {hosp.status === 'verified' && (
                      <button
                        disabled={updatingId === hosp.id}
                        onClick={async () => {
                          const reason = prompt("Enter REASON for Blacklisting. This bans them immediately:");
                          if (!reason) return;
                          setUpdatingId(hosp.id);
                          await updateHospitalStatus(hosp.id, "blacklisted", reason);
                          setUpdatingId(null);
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border transition-all ${updatingId === hosp.id ? "bg-red-100 text-red-300 cursor-not-allowed" : "bg-white text-red-600 hover:bg-red-50 border-red-200"}`}
                      >
                        <Ban size={18} /> {updatingId === hosp.id ? "Processing..." : "Blacklist"}
                      </button>
                    )}
                    
                    {hosp.status === 'blacklisted' && (
                      <button
                        disabled={updatingId === hosp.id}
                        onClick={async () => {
                           if(window.confirm("Are you sure you want to lift the blacklist?")) {
                             setUpdatingId(hosp.id);
                             await updateHospitalStatus(hosp.id, "verified");
                             setUpdatingId(null);
                           }
                        }}
                        className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${updatingId === hosp.id ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-900 text-white"}`}
                      >
                        <CheckCircle size={18} /> Re-instate
                      </button>
                    )}
                  </div>
                </div>

                {expandedId === hosp.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><FileText size={14} /> Licensing</h4>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100">
                          <p className="text-sm"><strong>License:</strong> {hosp.licenseNumber}</p>
                          <p className="text-sm"><strong>Admin:</strong> {hosp.adminDetails?.name}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><Activity size={14} /> Resources</h4>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-center">
                          <div className="p-2 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400">Ambulances</p><p className="font-bold">{hosp.resources?.ambulances || 0}</p></div>
                          <div className="p-2 bg-slate-50 rounded-xl"><p className="text-xs text-slate-400">ICU Beds</p><p className="font-bold">{hosp.resources?.icuBeds || 0}</p></div>
                        </div>
                      </div>
                      
                      {hosp.status === 'blacklisted' && hosp.rejectionReason && (
                         <div className="col-span-full mt-2 p-4 bg-red-50 border border-red-100 rounded-2xl">
                           <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Blacklist Reason</p>
                           <p className="text-sm text-red-700 italic">"{hosp.rejectionReason}"</p>
                         </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {registeredHospitals.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <List className="mx-auto text-slate-200 mb-4" size={64} />
                <p className="text-slate-400 font-medium text-lg">No registered hospitals found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;