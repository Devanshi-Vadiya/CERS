import React from 'react';
import { User, Building, LogIn, Shield, HeartPulse, Siren } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: 'signup-general' | 'signup-hospital' | 'login') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emergency opacity-10 blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-trust opacity-10 blur-[100px]"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-12">
         <div className="flex items-center gap-2">
            <div className="bg-emergency p-2 rounded-lg">
               <HeartPulse size={24} className="text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter">CERS<span className="text-emergency">+</span></span>
         </div>
         <button 
           onClick={() => onNavigate('login')}
           className="text-sm font-bold text-gray-300 hover:text-white border border-gray-600 px-4 py-2 rounded-full"
         >
           Sign In
         </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full z-10">
         <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
            Who Are You?
         </h1>
         <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
            Join the network saving lives during the Golden Hour. Select your role to get started.
         </p>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* General Public Card */}
            <button 
               onClick={() => onNavigate('signup-general')}
               className="group relative bg-gradient-to-br from-[#2f3640] to-[#1e272e] p-8 rounded-3xl border-2 border-transparent hover:border-emergency text-left transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,71,87,0.2)]"
            >
               <div className="bg-emergency/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-emergency group-hover:bg-emergency group-hover:text-white transition-colors">
                  <User size={32} />
               </div>
               <h2 className="text-2xl font-bold mb-2">General Public</h2>
               <ul className="text-gray-400 text-sm space-y-2 mb-8">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Need emergency help</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Protect family & friends</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div> Personal safety tools</li>
               </ul>
               <div className="flex items-center gap-2 text-emergency font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                  Get Help Now <Shield size={16} />
               </div>
            </button>

            {/* Hospital/Responder Card */}
            <button 
               onClick={() => onNavigate('signup-hospital')}
               className="group relative bg-gradient-to-br from-white to-gray-100 p-8 rounded-3xl border-2 border-transparent hover:border-hospital-primary text-left transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(55,66,250,0.3)]"
            >
               <div className="bg-hospital-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-hospital-primary group-hover:bg-hospital-primary group-hover:text-white transition-colors">
                  <Building size={32} />
               </div>
               <h2 className="text-2xl font-bold mb-2 text-gray-800">Responder / Hospital</h2>
               <ul className="text-gray-600 text-sm space-y-2 mb-8">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Hospital staff & Doctors</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Ambulance services</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div> Emergency volunteers</li>
               </ul>
               <div className="flex items-center gap-2 text-hospital-primary font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                  Provide Help <Siren size={16} />
               </div>
            </button>
         </div>
      </div>

      <div className="mt-12 text-center text-gray-600 text-xs z-10">
        © 2024 CERS+ Emergency Response Network. All rights reserved.
      </div>
    </div>
  );
};

export default LandingPage;
