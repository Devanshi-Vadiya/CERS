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
  LogOut
} from 'lucide-react';

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [pendingHospitals, setPendingHospitals] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { updateHospitalStatus } = useEmergencySystem();

useEffect(() => {
  const q = query(
    collection(db, "hospitals"),
    where("status", "==", "pending")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const hospitals = snapshot.docs.map((document) => {
      const data = document.data();

      return {
        ...data,
        firestoreId: document.id // REAL Firestore ID
      };
    });

    setPendingHospitals(hospitals);
  });

  return () => unsubscribe();
}, []);



  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
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

        <div className="grid gap-4 mt-8">
          {pendingHospitals.map((hosp) => (
            <div key={hosp.firestoreId} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all">
              <div className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl"><Building2 className="text-blue-600" /></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{hosp.name || "Unknown Org"}</h3>
                    <p className="text-slate-500 text-sm">{hosp.adminDetails?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setExpandedId(expandedId === hosp.firestoreId ? null : hosp.firestoreId)} 
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                  >
                    {expandedId === hosp.firestoreId ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  
                  <div className="h-8 w-[1px] bg-slate-100 mx-2" />
                  
                  <button
                    disabled={updatingId === hosp.firestoreId}
                    onClick={async () => {
                      setUpdatingId(hosp.firestoreId);
                      await updateHospitalStatus(hosp.firestoreId, "verified");
                      setUpdatingId(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${
                      updatingId === hosp.firestoreId 
                        ? "bg-green-300 cursor-not-allowed" 
                        : "bg-green-600 hover:bg-green-700 text-white shadow-green-100"
                    }`}
                  >
                    <CheckCircle size={18} /> {updatingId === hosp.firestoreId ? "Approving..." : "Approve"}
                  </button>

                  <button
                    disabled={updatingId === hosp.firestoreId}
                    onClick={async () => {
                      const reason = prompt("Enter rejection reason:");
                      if (!reason) return;
                      setUpdatingId(hosp.firestoreId);
                      await updateHospitalStatus(hosp.firestoreId, "rejected", reason);
                      setUpdatingId(null);
                    }}
                    className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border transition-all ${
                      updatingId === hosp.firestoreId 
                        ? "bg-red-100 text-red-300 cursor-not-allowed" 
                        : "bg-white text-red-600 hover:bg-red-50 border-red-100"
                    }`}
                  >
                    <XCircle size={18} /> {updatingId === hosp.firestoreId ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>

              {expandedId === hosp.firestoreId && (
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
      </div>
    </div>
  );
};

export default AdminDashboard;