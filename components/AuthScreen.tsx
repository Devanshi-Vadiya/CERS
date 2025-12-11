import React, { useState } from 'react';
import { UserRole } from '../types';
import { ArrowLeft, User, Lock, Building, Phone, AlertTriangle, Loader2, CheckCircle, Mail, Key, Sparkles } from 'lucide-react';
import { useEmergencySystem } from '../contexts/EmergencyContext';

interface AuthScreenProps {
  onBack: () => void;
  onLoginSuccess: (role: UserRole) => void;
  onGoToSignUp: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onLoginSuccess, onGoToSignUp }) => {
  const { loginUser, sendPasswordReset } = useEmergencySystem();
  
  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [role, setRole] = useState<'general' | 'hospital'>('general');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot Password State
  const [resetInput, setResetInput] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
        setError('Please enter all credentials');
        return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
        const success = loginUser(phone, role);
        setIsLoading(false);
        if (success) {
          if (navigator.vibrate) navigator.vibrate(50);
          onLoginSuccess(role);
        } else {
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          setError(role === 'general' ? 'User not found. Try 9999999999' : 'Hospital ID/Email not found. Try admin@hospital.com');
        }
    }, 1000);
  };

  const fillDemoCredentials = () => {
      if (role === 'general') {
          setPhone('9999999999');
          setPassword('demo123');
      } else {
          setPhone('admin@hospital.com');
          setPassword('admin');
      }
      setError('');
  };

  const handleResetPassword = async () => {
      if (!resetInput) {
          setError(`Please enter your ${isGeneral ? 'mobile number' : 'email'}`);
          return;
      }
      setIsLoading(true);
      setError('');
      
      const success = await sendPasswordReset(resetInput, role);
      setIsLoading(false);
      
      if (success) {
          setResetSent(true);
      } else {
          setError('Could not find account. Please verify details.');
      }
  };

  const isGeneral = role === 'general';
  const themeColor = isGeneral ? 'emergency' : 'hospital-primary';
  const bgClass = isGeneral ? 'bg-emergency' : 'bg-hospital-primary';
  const textClass = isGeneral ? 'text-emergency' : 'text-hospital-primary';

  // --- FORGOT PASSWORD VIEW ---
  if (view === 'forgot-password') {
      return (
        <div className={`min-h-screen flex flex-col ${isGeneral ? 'bg-charcoal text-white' : 'bg-hospital-bg text-hospital-text'}`}>
            <div className="p-6">
                <button onClick={() => { setView('login'); setResetSent(false); setError(''); setResetInput(''); }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={20} /> Back to Login
                </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
                <div className="w-full bg-[#2f3640] p-8 rounded-3xl shadow-xl text-center border border-gray-700">
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Key size={32} className="text-gray-300" />
                    </div>
                    
                    {!resetSent ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
                            <p className="text-gray-400 text-sm mb-8">Enter your registered {isGeneral ? 'phone number' : 'email'} and we'll send you instructions to reset it.</p>
                            
                            {error && (
                              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl flex items-center gap-2 mb-4 text-left">
                                 <AlertTriangle className="text-red-500 shrink-0" size={16} />
                                 <span className="text-xs text-red-500 font-bold">{error}</span>
                              </div>
                            )}

                            <div className="space-y-6 text-left">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                                        {isGeneral ? 'Mobile Number' : 'Official Email'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            {isGeneral ? <Phone size={18} className="text-gray-400" /> : <Mail size={18} className="text-gray-400" />}
                                        </div>
                                        <input
                                            type={isGeneral ? "tel" : "email"}
                                            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-700 bg-transparent text-white focus:border-emergency outline-none transition-colors"
                                            placeholder={isGeneral ? "+1 (555) 000-0000" : "admin@hospital.com"}
                                            value={resetInput}
                                            onChange={(e) => setResetInput(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleResetPassword}
                                    disabled={isLoading}
                                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2
                                        ${isGeneral ? 'bg-emergency' : 'bg-hospital-primary'} text-white ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Send Reset Link'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in zoom-in duration-300">
                             <div className="mb-6 flex justify-center">
                                <CheckCircle size={64} className="text-green-500" />
                             </div>
                             <h2 className="text-2xl font-bold text-white mb-2">Check your Inbox</h2>
                             <p className="text-gray-400 text-sm mb-8">
                               We have sent password reset instructions to <span className="text-white font-bold">{resetInput}</span>.
                             </p>
                             <button
                                onClick={() => setView('login')}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
  }

  // --- LOGIN VIEW ---
  return (
    <div className={`min-h-screen flex flex-col ${isGeneral ? 'bg-charcoal text-white' : 'bg-hospital-bg text-hospital-text'}`}>
      
      {/* Header */}
      <div className="p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full">
        
        {/* Role Toggles */}
        <div className="flex bg-black/10 p-1 rounded-full mb-8">
           <button 
             onClick={() => setRole('general')}
             className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isGeneral ? 'bg-emergency text-white shadow-lg' : 'text-gray-500'}`}
           >
             User Login
           </button>
           <button 
             onClick={() => setRole('hospital')}
             className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isGeneral ? 'bg-hospital-primary text-white shadow-lg' : 'text-gray-500'}`}
           >
             Hospital Staff
           </button>
        </div>

        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full ${bgClass} flex items-center justify-center mb-4 shadow-lg`}>
            {isGeneral ? <User size={40} className="text-white" /> : <Building size={40} className="text-white" />}
          </div>
          <h1 className="text-3xl font-bold mb-2">{isGeneral ? 'Welcome Back' : 'Responder Portal'}</h1>
          <p className="text-gray-500">{isGeneral ? 'Log in to access your safety network' : 'Secure access for authorized personnel only'}</p>
        </div>

        <div className={`w-full ${isGeneral ? 'bg-[#2f3640]' : 'bg-white'} p-8 rounded-3xl shadow-xl transition-colors duration-300`}>
          <div className="space-y-6">
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
                 <AlertTriangle className="text-red-500 shrink-0" size={20} />
                 <div className="text-sm text-red-500">
                    <p className="font-bold">Login Failed</p>
                    <p>{error}</p>
                 </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    {isGeneral ? 'Mobile Number' : 'Hospital ID / Email'}
                  </label>
                  <button 
                    onClick={fillDemoCredentials} 
                    className={`text-xs font-bold flex items-center gap-1 ${textClass} hover:opacity-80`}
                  >
                    <Sparkles size={12}/> Fill Demo
                  </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  {isGeneral ? <Phone size={18} className="text-gray-400" /> : <Building size={18} className="text-gray-400" />}
                </div>
                <input
                  type={isGeneral ? "tel" : "text"}
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 bg-transparent focus:outline-none transition-colors
                    ${isGeneral 
                      ? 'border-gray-700 focus:border-emergency text-white' 
                      : 'border-gray-200 focus:border-hospital-primary text-gray-800'
                    }`}
                  placeholder={isGeneral ? "9999999999" : "admin@hospital.com"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 bg-transparent focus:outline-none transition-colors
                    ${isGeneral 
                      ? 'border-gray-700 focus:border-emergency text-white' 
                      : 'border-gray-200 focus:border-hospital-primary text-gray-800'
                    }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2
                ${bgClass} text-white ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24}/> : 'LOG IN'}
            </button>
          </div>

          <div className="mt-6 text-center space-y-4">
            <button 
                onClick={() => setView('forgot-password')}
                className={`text-sm font-medium ${textClass} hover:underline`}
            >
              Forgot Password?
            </button>
            
            {isGeneral && (
              <div className="pt-4 border-t border-gray-700/50">
                 <p className="text-gray-500 text-sm mb-2">Don't have an account?</p>
                 <button 
                   onClick={onGoToSignUp}
                   className="text-white font-bold hover:underline"
                 >
                   Sign Up Now
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
