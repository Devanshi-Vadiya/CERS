import React from 'react';
import { 
  Shield, User, MapPin, Phone, CreditCard, 
  Clock, Activity, Download, MessageCircle, 
  HelpCircle, ChevronRight, ArrowUpRight, 
  Calendar, CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import { UserProfile, EmergencyIncident } from '../types';

interface InsuranceDashboardProps {
  user: UserProfile;
  emergencies: EmergencyIncident[];
  onBack: () => void;
  onUpgrade: () => void;
}

const InsuranceDashboard: React.FC<InsuranceDashboardProps> = ({ user, emergencies, onBack, onUpgrade }) => {
  // Mock policy data (in a real app, this would come from a context or API)
  const hasActivePolicy = true;
  const policy = {
    name: 'Family Emergency Shield',
    id: 'POL-CERS-88291',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    ambulanceLimit: '₹25,000',
    hospitalLimit: '₹3,00,000',
    membersCovered: 4
  };

  const isCovered = (dateStr: string) => {
    if (!hasActivePolicy) return false;
    const date = new Date(dateStr);
    return date >= new Date(policy.startDate) && date <= new Date(policy.endDate);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={onBack} className="text-slate-400 hover:text-blue-600 transition-colors mr-2">
                <Shield size={24} className="text-blue-600" />
              </button>
              <h1 className="text-2xl font-black text-slate-900">My Insurance & Emergency Overview</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">View your coverage, emergency history, and quick actions in one place.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {hasActivePolicy ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 font-bold text-sm">
                <CheckCircle size={16} /> Covered till {new Date(policy.endDate).toLocaleDateString()}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full border border-red-100 font-bold text-sm">
                <AlertCircle size={16} /> Not Covered
              </div>
            )}
            <button 
              onClick={onUpgrade}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              {hasActivePolicy ? 'Upgrade Plan' : 'Buy Plan'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Top Row: Patient Info & Policy Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Patient Info Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-slate-100 p-3 rounded-2xl text-slate-600">
                <User size={24} />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Patient Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Name</span>
                <span className="text-sm font-bold text-slate-800">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Details</span>
                <span className="text-sm font-bold text-slate-800">{user.gender || '—'}, {user.dob ? (new Date().getFullYear() - new Date(user.dob).getFullYear()) : '—'} Yrs</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Location</span>
                <span className="text-sm font-bold text-slate-800">Surat, Gujarat</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contact</span>
                <span className="text-sm font-bold text-slate-800">{user.phone}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aadhaar</span>
                <span className="text-sm font-bold text-slate-800">XXXX-XXXX-1234</span>
              </div>
            </div>
          </div>

          {/* Current Policy Card */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Shield size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-white/10 p-3 rounded-2xl text-blue-400">
                  <CreditCard size={24} />
                </div>
                <h2 className="text-lg font-black tracking-tight">Current Active Policy</h2>
              </div>

              {hasActivePolicy ? (
                <>
                  <div className="mb-8">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Plan Name</p>
                    <h3 className="text-2xl font-black mb-1">{policy.name}</h3>
                    <p className="text-slate-400 text-xs font-bold">Policy ID: {policy.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Ambulance</p>
                      <p className="font-bold text-sm">{policy.ambulanceLimit}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Hospitalisation</p>
                      <p className="font-bold text-sm">{policy.hospitalLimit}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3 rounded-xl transition-all border border-white/10">
                      View Full Policy
                    </button>
                    <button onClick={onUpgrade} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/50">
                      Upgrade Plan
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 mb-6">You don't have an active protection plan.</p>
                  <button onClick={onUpgrade} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all">
                    Explore Plans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency History Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Activity size={24} className="text-blue-600" /> Recent Emergency Cases (via CERS+)
            </h2>
            <button className="text-xs font-bold text-blue-600 hover:underline">View All History</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ambulance</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Hospital</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {emergencies.slice(0, 5).map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-800">{new Date(incident.timestamp).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(incident.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-600">{incident.type?.name || 'Emergency'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-slate-500">{incident.assignedHospitalId ? 'YES' : 'NO'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-800 truncate max-w-[150px] inline-block">Apollo Hospital</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                        incident.status === 'resolved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {isCovered(incident.timestamp) ? (
                        <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Covered</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Not Covered</span>
                      )}
                    </td>
                  </tr>
                ))}
                {emergencies.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-medium">No emergency records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Area */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <span className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <Download size={18} className="text-blue-500" /> Download Policy PDF
              </span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <span className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <MessageCircle size={18} className="text-blue-500" /> Insurance Support
              </span>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group">
              <span className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <TrendingUp size={18} className="text-blue-500" /> Start Claim Help
              </span>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500" />
            </button>
          </div>

          {/* Recommended Upgrade Strip */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Recommended Upgrade</h3>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-100">
              <div className="flex-1">
                <div className="bg-white/20 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Higher Hospital Limit</div>
                <h4 className="text-xl font-black mb-2">Max Protection Plan</h4>
                <p className="text-blue-100 text-sm font-medium leading-relaxed">Upgrade to ₹5,00,000 hospitalisation cover. Highly recommended based on your recent activity in high-risk zones.</p>
              </div>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className="text-center mb-2">
                  <span className="text-3xl font-black">₹999</span>
                  <span className="text-blue-200 text-sm font-bold ml-1">/mo</span>
                </div>
                <button onClick={onUpgrade} className="bg-white text-blue-700 px-8 py-3 rounded-xl font-black text-sm hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InsuranceDashboard;
