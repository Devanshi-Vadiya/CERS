import React, { useState } from 'react';
import { ArrowLeft, Building, User, Mail, Lock, Shield, CheckCircle, Upload, MapPin, Check, Loader2, FileText } from 'lucide-react';
import { HospitalProfile } from '../types';
import { useEmergencySystem } from '../contexts/EmergencyContext';

interface HospitalSignUpFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

const HospitalSignUpFlow: React.FC<HospitalSignUpFlowProps> = ({ onBack, onComplete }) => {
  const { registerHospital } = useEmergencySystem();
  const [step, setStep] = useState(1);
  const [docUploaded, setDocUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<HospitalProfile>>({
    role: 'hospital',
    type: 'Hospital',
    resources: { ambulances: 0, doctors: 0, beds: 0 },
    serviceAreaRadius: 10,
    adminDetails: { name: '', phone: '', designation: '' }
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newHospital: HospitalProfile = {
      id: `HOSP-${Math.floor(Math.random() * 10000)}`,
      name: formData.name || 'Unknown Org',
      licenseNumber: formData.licenseNumber || 'PENDING',
      email: formData.email || '',
      password: formData.password || '',
      role: 'hospital',
      type: formData.type || 'Hospital',
      serviceAreaRadius: formData.serviceAreaRadius || 10,
      adminDetails: formData.adminDetails!,
      resources: formData.resources!,
      status: 'pending' // Requires verification
    };
    
    // Await to prevent race conditions
    await registerHospital(newHospital);
    
    setIsSubmitting(false);
    onComplete();
  };

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateAdmin = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      adminDetails: { ...prev.adminDetails!, [key]: value }
    }));
  };

  const handleUpload = () => {
      setUploading(true);
      setTimeout(() => {
          setUploading(false);
          setDocUploaded(true);
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-hospital-bg text-hospital-text flex flex-col font-sans">
      <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="text-gray-500 hover:text-hospital-primary transition-colors">
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-hospital-primary text-sm uppercase tracking-wider">Responder Registration • Step {step}/3</span>
      </div>

      <div className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col">
        {step === 1 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-hospital-primary mb-2">Organization Details</h2>
            <p className="text-gray-500 mb-8">Register your facility for emergency response.</p>
            
            <div className="space-y-4">
              <InputGroup icon={<Building/>} label="Organization Name" placeholder="Apollo Hospital" 
                value={formData.name || ''} onChange={e => updateForm('name', e.target.value)} />
              <InputGroup icon={<Shield/>} label="License Number" placeholder="HOSP-LIC-XXXX" 
                value={formData.licenseNumber || ''} onChange={e => updateForm('licenseNumber', e.target.value)} />
              
              <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Organization Type</label>
                 <div className="grid grid-cols-2 gap-3">
                   {['Hospital', 'Clinic', 'Ambulance', 'Government'].map(t => (
                     <button 
                       key={t}
                       onClick={() => updateForm('type', t)}
                       className={`p-3 rounded-xl border text-sm font-bold transition-all ${formData.type === t ? 'bg-hospital-primary text-white border-hospital-primary' : 'bg-white border-gray-300 text-gray-600'}`}
                     >
                       {t}
                     </button>
                   ))}
                 </div>
              </div>

              <InputGroup icon={<Mail/>} label="Official Email" placeholder="admin@hospital.com" 
                value={formData.email || ''} onChange={e => updateForm('email', e.target.value)} />
              <InputGroup icon={<Lock/>} label="Create Password" type="password" placeholder="••••••••" 
                value={formData.password || ''} onChange={e => updateForm('password', e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-hospital-primary mb-2">Admin Contact</h2>
            <p className="text-gray-500 mb-8">Person responsible for this account.</p>
            
            <div className="space-y-4">
              <InputGroup icon={<User/>} label="Administrator Name" placeholder="Dr. Rajesh Kumar"
                 value={formData.adminDetails?.name} onChange={e => updateAdmin('name', e.target.value)} />
              <InputGroup icon={<Shield/>} label="Designation" placeholder="Chief Medical Officer"
                 value={formData.adminDetails?.designation} onChange={e => updateAdmin('designation', e.target.value)} />
              <InputGroup icon={<Building/>} label="Mobile Number" placeholder="+91 99999 99999"
                 value={formData.adminDetails?.phone} onChange={e => updateAdmin('phone', e.target.value)} />
              
              <div 
                 onClick={!docUploaded ? handleUpload : undefined}
                 className={`mt-6 p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer
                    ${docUploaded 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-300 bg-gray-50 text-gray-500 hover:bg-white hover:border-hospital-primary'
                    }`}
              >
                 {uploading ? (
                     <>
                        <Loader2 size={32} className="mb-2 text-hospital-primary animate-spin" />
                        <span className="font-bold text-sm">Uploading...</span>
                     </>
                 ) : docUploaded ? (
                     <>
                        <CheckCircle size={32} className="mb-2 text-green-600" />
                        <span className="font-bold text-sm">Documents Verified</span>
                        <span className="text-xs">license_doc.pdf</span>
                     </>
                 ) : (
                     <>
                        <Upload size={32} className="mb-2 text-hospital-primary" />
                        <span className="font-bold text-sm">Upload Verification Docs</span>
                        <span className="text-xs">(Click to simulate upload)</span>
                     </>
                 )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold text-hospital-primary mb-2">System Setup</h2>
            <p className="text-gray-500 mb-8">Configure your emergency capabilities.</p>
            
            <div className="space-y-6">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Available Resources</label>
                  <div className="grid grid-cols-3 gap-4">
                     <ResourceInput label="Ambulances" value={formData.resources?.ambulances} 
                        onChange={v => setFormData(p => ({...p, resources: {...p.resources!, ambulances: parseInt(v) || 0}}))} />
                     <ResourceInput label="Doctors" value={formData.resources?.doctors} 
                        onChange={v => setFormData(p => ({...p, resources: {...p.resources!, doctors: parseInt(v) || 0}}))} />
                     <ResourceInput label="Beds" value={formData.resources?.beds} 
                        onChange={v => setFormData(p => ({...p, resources: {...p.resources!, beds: parseInt(v) || 0}}))} />
                  </div>
               </div>

               <div>
                 <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Service Radius (km)</label>
                 <input type="range" min="5" max="50" step="5" 
                   value={formData.serviceAreaRadius} 
                   onChange={(e) => updateForm('serviceAreaRadius', parseInt(e.target.value))}
                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-hospital-primary"
                 />
                 <div className="flex justify-between text-xs text-gray-500 mt-2 font-bold">
                    <span>5km</span>
                    <span className="text-hospital-primary text-lg">{formData.serviceAreaRadius}km</span>
                    <span>50km</span>
                 </div>
               </div>
               
               <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3 items-start">
                  <Shield className="text-yellow-600 shrink-0 mt-1" size={16} />
                  <p className="text-xs text-yellow-800">
                     <strong>Verification Required:</strong> Your account will be pending until our team verifies your license documents (24-48h).
                  </p>
               </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
           <button 
             onClick={handleNext}
             disabled={isSubmitting}
             className={`w-full py-4 bg-hospital-primary text-white rounded-xl font-bold text-lg hover:bg-blue-900 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-80' : ''}`}
           >
             {isSubmitting ? <Loader2 className="animate-spin" /> : step === 3 ? 'Submit for Verification' : 'Next Step'}
           </button>
           
           <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500 mb-2">Already have a hospital account?</p>
              <button 
                onClick={onComplete} // Reusing onComplete to go to login since it redirects to AuthScreen
                className="text-hospital-primary font-bold hover:underline"
              >
                Sign In Here
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup = ({ icon, label, type="text", placeholder, value, onChange }: any) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border border-gray-300 text-gray-800 focus:border-hospital-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const ResourceInput = ({ label, value, onChange }: any) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
     <span className="block text-2xl font-bold text-hospital-primary mb-1">
       <input type="number" value={value} onChange={e => onChange(e.target.value)} className="w-full text-center outline-none" placeholder="0" />
     </span>
     <span className="text-xs text-gray-500 uppercase font-bold">{label}</span>
  </div>
);

export default HospitalSignUpFlow;