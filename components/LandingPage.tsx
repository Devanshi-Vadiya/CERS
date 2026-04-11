import React, { useEffect } from 'react';
import { User, Building, Shield, HeartPulse, Siren, Settings } from 'lucide-react';

interface LandingPageProps {
  // 🟢 Added 'admin-login' and 'insurance' to supported paths
  onNavigate: (path: 'signup-general' | 'signup-hospital' | 'login' | 'admin-login' | 'insurance') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
   useEffect(() => {
      const path = window.location.pathname.replace('/', '');
      if (['about', 'features', 'contact'].includes(path)) {
         const element = document.getElementById(path);
         if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
         }
      }
   }, []);

   return (
      <div className="min-h-screen bg-charcoal text-white flex flex-col p-4 md:p-6 relative overflow-hidden">
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
             <div className="hidden md:flex items-center gap-6">
                <a href="/features" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="/about" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">About</a>
                <a href="/contact" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Contact</a>
             </div>
             <button 
               onClick={() => onNavigate('login')}
               className="text-sm font-bold text-white bg-emergency hover:bg-red-600 px-6 py-2 rounded-full shadow-lg shadow-emergency/20 transition-all"
             >
               Sign In
             </button>
          </div>

         <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full z-10">
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-center">
               Who Are You?
            </h1>
            <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
               Join the network saving lives during the Golden Hour. Select your role to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
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

               {/* Insurance / Protection Card */}
               <button 
                  onClick={() => onNavigate('insurance')}
                  className="group relative bg-gradient-to-br from-[#1a2a6c] to-[#b21f1f] p-8 rounded-3xl border-2 border-transparent hover:border-blue-400 text-left transition-all hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] overflow-hidden"
               >
                  {/* Accent pattern for insurance card */}
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Shield size={120} />
                  </div>
                  
                  <div className="bg-blue-400/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-blue-400 group-hover:bg-blue-400 group-hover:text-white transition-colors">
                     <Shield size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Insurance / Protection</h2>
                  <p className="text-blue-100/70 text-sm mb-6">Low-cost emergency cover for families and ambulance staff.</p>
                  <ul className="text-gray-300 text-sm space-y-2 mb-8">
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> From ₹10 / day</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> IRDAI Partner Insurers</li>
                     <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Cashless treatment</li>
                  </ul>
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                     Explore Plans <HeartPulse size={16} />
                  </div>
               </button>
            </div>
         </div>

         {/* Features Section */}
         <div id="features" className="relative z-10 mt-32 max-w-6xl mx-auto w-full">
            <h2 className="text-3xl font-black mb-12 text-center text-white">Advanced Response Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[
                  { title: "Real-time Tracking", desc: "Live GPS updates for responders and victims during the Golden Hour." },
                  { title: "AI Triage", desc: "Intelligent symptom assessment to prioritize critical cases instantly." },
                  { title: "Video Evidence", desc: "Secure video streaming from the scene to the emergency room." },
                  { title: "Inter-Hospital Comms", desc: "Seamless facility-to-facility coordination for faster transfers." }
               ].map((f, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                     <h3 className="font-bold text-lg mb-2 text-white">{f.title}</h3>
                     <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
               ))}
            </div>
         </div>

         {/* About Section */}
         <div id="about" className="relative z-10 mt-32 max-w-4xl mx-auto w-full text-center">
            <h2 className="text-3xl font-black mb-6 text-white">Our Mission</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
               CERS+ is an AI-driven emergency response network designed to eliminate delays in medical assistance. 
               By connecting victims, hospitals, and ambulances in a unified real-time ecosystem, we ensure that every second counts.
            </p>
         </div>

         {/* Contact Section */}
         <div id="contact" className="relative z-10 mt-32 mb-32 max-w-md mx-auto w-full text-center">
            <h2 className="text-3xl font-black mb-6 text-white">Get in Touch</h2>
            <p className="text-gray-400 mb-8">Have questions or want to partner with the CERS+ network?</p>
            <a href="mailto:support@cers-plus.com" className="inline-block bg-white text-charcoal font-black px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all">
               Contact Support
            </a>
         </div>

         {/* Footer Area */}
         <div className="mt-auto flex flex-col items-center gap-4 z-10 py-8 border-t border-white/5">
            <div className="text-gray-600 text-xs text-center">
               © 2026 CERS+ Emergency Response Network. All rights reserved.
            </div>

            <button
               onClick={() => onNavigate('admin-login')}
               className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest font-bold"
            >
               <Settings size={10} /> System Administration
            </button>
         </div>
      </div>
   );
};

export default LandingPage;