import React, { useState } from 'react';
import { ArrowLeft, User, Phone, Mail, Lock, Heart, Shield, CheckCircle, Calendar, Plus, Trash2, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { useEmergencySystem } from '../contexts/EmergencyContext';

interface SignUpFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

const SignUpFlow: React.FC<SignUpFlowProps> = ({ onBack, onComplete }) => {
  const { registerUser } = useEmergencySystem();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    role: 'general',
    medicalInfo: { bloodGroup: '', allergies: 'None', conditions: 'None', medications: 'None' },
    emergencyContacts: [{ name: '', phone: '', relation: '' }],
    permissions: { location: false, camera: false, contacts: false }
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const newUser: UserProfile = {
      id: `USR-${Math.floor(Math.random() * 10000)}`,
      name: formData.name || 'Unknown',
      phone: formData.phone || '',
      email: formData.email,
      role: 'general',
      medicalInfo: formData.medicalInfo,
      emergencyContacts: formData.emergencyContacts,
      permissions: formData.permissions
    };
    
    // Await registration to ensure state is updated
    await registerUser(newUser);
    
    setIsSubmitting(false);
    onComplete();
  };

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateMedical = (key: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      medicalInfo: { ...prev.medicalInfo!, [key]: value } 
    }));
  };

  const updateContact = (index: number, key: string, value: string) => {
    const newContacts = [...(formData.emergencyContacts || [])];
    newContacts[index] = { ...newContacts[index], [key]: value };
    setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
  };

  const addContact = () => {
    if ((formData.emergencyContacts?.length || 0) < 5) {
      setFormData(prev => ({
        ...prev,
        emergencyContacts: [...(prev.emergencyContacts || []), { name: '', phone: '', relation: '' }]
      }));
    }
  };

  const togglePermission = (key: keyof typeof formData.permissions) => {
     setFormData(prev => ({
       ...prev,
       permissions: { ...prev.permissions!, [key]: !prev.permissions![key] }
     }));
  }

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col">
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <span className="font-bold text-gray-500 text-sm">STEP {step} OF 4</span>
      </div>

      <div className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col">
        {step === 1 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold mb-2">Personal Details</h2>
            <p className="text-gray-400 mb-8">Let's get your account set up.</p>
            
            <div className="space-y-4">
              <InputGroup icon={<User/>} label="Full Name" placeholder="John Doe" 
                value={formData.name || ''} onChange={e => updateForm('name', e.target.value)} />
              <InputGroup icon={<Phone/>} label="Mobile Number" placeholder="+91 99999 99999" 
                value={formData.phone || ''} onChange={e => updateForm('phone', e.target.value)} />
              <InputGroup icon={<Mail/>} label="Email" placeholder="john@example.com" 
                value={formData.email || ''} onChange={e => updateForm('email', e.target.value)}/>
              <InputGroup icon={<Calendar/>} label="Date of Birth" placeholder="DD/MM/YYYY" 
                value={formData.dob || ''} onChange={e => updateForm('dob', e.target.value)}/>
              <InputGroup icon={<Lock/>} label="Password" type="password" placeholder="••••••••" 
                value={formData.password || ''} onChange={e => updateForm('password', e.target.value)}/>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold mb-2">Medical Profile</h2>
            <p className="text-gray-400 mb-8">Critical for emergency response.</p>
            
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Blood Group</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                      <button
                        key={bg}
                        onClick={() => updateMedical('bloodGroup', bg)}
                        className={`p-2 rounded-lg border text-sm font-bold ${formData.medicalInfo?.bloodGroup === bg ? 'bg-emergency border-emergency text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
               </div>
               <InputGroup icon={<Heart/>} label="Allergies" placeholder="Peanuts, Penicillin..." 
                  value={formData.medicalInfo?.allergies} onChange={e => updateMedical('allergies', e.target.value)} />
               <InputGroup icon={<Shield/>} label="Medical Conditions" placeholder="Asthma, Diabetes..." 
                  value={formData.medicalInfo?.conditions} onChange={e => updateMedical('conditions', e.target.value)} />
               <InputGroup icon={<Plus/>} label="Current Medications" placeholder="Insulin, Inhaler..." 
                  value={formData.medicalInfo?.medications} onChange={e => updateMedical('medications', e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold mb-2">Emergency Contacts</h2>
            <p className="text-gray-400 mb-8">We will notify them when you press SOS.</p>
            
            <div className="space-y-6">
               {formData.emergencyContacts?.map((contact, idx) => (
                 <div key={idx} className="bg-[#2f3640] p-4 rounded-xl border border-gray-700 relative">
                    <h4 className="font-bold text-gray-400 text-xs uppercase mb-3">Contact {idx + 1}</h4>
                    <div className="space-y-3">
                       <input 
                         className="w-full bg-transparent border-b border-gray-600 focus:border-emergency outline-none py-1 text-white" 
                         placeholder="Name"
                         value={contact.name}
                         onChange={e => updateContact(idx, 'name', e.target.value)}
                       />
                       <div className="flex gap-3">
                          <input 
                            className="flex-1 bg-transparent border-b border-gray-600 focus:border-emergency outline-none py-1 text-white" 
                            placeholder="Phone"
                            value={contact.phone}
                            onChange={e => updateContact(idx, 'phone', e.target.value)}
                          />
                          <input 
                            className="flex-1 bg-transparent border-b border-gray-600 focus:border-emergency outline-none py-1 text-white" 
                            placeholder="Relation"
                            value={contact.relation}
                            onChange={e => updateContact(idx, 'relation', e.target.value)}
                          />
                       </div>
                    </div>
                 </div>
               ))}
               
               <button 
                 onClick={addContact} 
                 className="w-full py-3 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
               >
                 <Plus size={16} /> Add Another Contact
               </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-bold mb-2">Permissions</h2>
            <p className="text-gray-400 mb-8">Enable features for full protection.</p>
            
            <div className="space-y-4">
               <PermissionToggle 
                 title="Location Access" 
                 desc="Required to share coordinates with ambulance" 
                 active={formData.permissions?.location}
                 onToggle={() => togglePermission('location')}
               />
               <PermissionToggle 
                 title="Camera & Microphone" 
                 desc="For emergency video evidence recording" 
                 active={formData.permissions?.camera}
                 onToggle={() => togglePermission('camera')}
               />
               <PermissionToggle 
                 title="Contacts Access" 
                 desc="To quickly add family members" 
                 active={formData.permissions?.contacts}
                 onToggle={() => togglePermission('contacts')}
               />
            </div>

            <div className="mt-8 p-4 bg-safe/10 rounded-xl border border-safe/20 flex items-center gap-3">
               <CheckCircle className="text-safe" />
               <span className="text-sm text-gray-300">I agree to Terms & Privacy Policy</span>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
           <button 
             onClick={handleNext}
             disabled={isSubmitting}
             className={`w-full py-4 bg-emergency rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-80' : ''}`}
           >
             {isSubmitting ? <Loader2 className="animate-spin" /> : step === 4 ? 'Complete Sign Up' : 'Next Step'}
           </button>
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
        className="w-full pl-12 pr-4 py-4 rounded-xl bg-[#2f3640] border border-gray-700 text-white focus:border-emergency outline-none transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const PermissionToggle = ({ title, desc, active, onToggle }: any) => (
  <div 
    onClick={onToggle}
    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${active ? 'bg-white/10 border-emergency' : 'bg-[#2f3640] border-gray-700'}`}
  >
     <div>
       <h4 className={`font-bold ${active ? 'text-white' : 'text-gray-400'}`}>{title}</h4>
       <p className="text-xs text-gray-500">{desc}</p>
     </div>
     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'bg-emergency border-emergency' : 'border-gray-500'}`}>
        {active && <CheckCircle size={14} className="text-white" />}
     </div>
  </div>
);

export default SignUpFlow;