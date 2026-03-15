import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  ArrowLeft, User, Lock, Building, Phone,
  AlertTriangle, Loader2, CheckCircle, Mail,
  Key, Sparkles, X, XCircle, ShieldCheck
} from 'lucide-react';
import { useEmergencySystem } from '../contexts/EmergencyContext';
import FaceScanner from './FaceScanner';

interface AuthScreenProps {
  onBack: () => void;
  onLoginSuccess: (role: UserRole) => void;
  onGoToSignUp: () => void;
}

// --- 🟢 Custom Pop-up Toast Component ---
const NotificationToast = ({
  message,
  type,
  onClose
}: {
  message: string,
  type: 'error' | 'success',
  onClose: () => void
}) => (
  <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm animate-in slide-in-from-top duration-300">
    <div className={`mx-4 p-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border-b-4 ${type === 'success' ? 'bg-green-600 border-green-800' : 'bg-red-600 border-red-800'
      } text-white`}>
      {type === 'success' ? <CheckCircle size={24} /> : <XCircle size={24} />}
      <span className="flex-1 text-sm">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg">
        <X size={20} />
      </button>
    </div>
  </div>
);

const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onLoginSuccess, onGoToSignUp }) => {
  const { loginUser, loginWithFace, initiatePasswordReset } = useEmergencySystem();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showFaceScanner, setShowFaceScanner] = useState(false);

  const [view, setView] = useState<'login' | 'forgot-password'>('login');
  const [role, setRole] = useState<'general' | 'hospital'>('general');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [resetInput, setResetInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // 🟢 Custom Pop-up State
  const [notification, setNotification] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);

  // 🟢 Helper to trigger Pop-up instead of alert()
  const showPopup = (msg: string, type: 'error' | 'success' = 'error') => {
    setNotification({ msg, type });
    // Auto-hide after 4 seconds
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      showPopup('Please enter all credentials'); // 🟢 Replaced alert
      return;
    }

    setIsLoading(true);

    try {
      const success = await loginUser(phone, role, password);
      setIsLoading(false);

      if (success) {
        setFailedAttempts(0);
        if (navigator.vibrate) navigator.vibrate(50);
        onLoginSuccess(role);
      } else {
        // 🟢 Handle failures with Pop-ups instead of alerts
        const newCount = failedAttempts + 1;
        setFailedAttempts(newCount);

        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (newCount >= 3) {
          showPopup("🚫 Too many failed attempts. Please reset your password.");
        } else {
          // Checks for specific role failures
          showPopup(role === 'general'
            ? 'User not found. Please sign up first.'
            : 'Hospital not registered or incorrect credentials.');
        }
      }
    } catch (e) {
      setIsLoading(false);
      showPopup("An unexpected error occurred. Please try again.");
    }
  };

  const fillDemoCredentials = () => {
    if (role === 'general') {
      setPhone('9999999999');
      setPassword('demo123');
    } else {
      setPhone('admin@hospital.com');
      setPassword('admin');
    }
  };

  const handleResetPassword = () => {
    initiatePasswordReset();
    showPopup("Password reset page opened in a new tab", "success"); // 🟢 Replaced alert
    setView('login');
  };

  const handleFaceLogin = async (descriptor: Float32Array) => {
    setIsLoading(true);
    setShowFaceScanner(false);
    showPopup("Verifying face ID...", "success");

    try {
      const success = await loginWithFace(descriptor);
      setIsLoading(false);
      if (success) {
        if (navigator.vibrate) navigator.vibrate(50);
        onLoginSuccess('general');
      } else {
        showPopup("Face ID not recognized.");
      }
    } catch (e) {
      setIsLoading(false);
      showPopup("Face ID login failed.");
    }
  };

  const isGeneral = role === 'general';
  const bgClass = isGeneral ? 'bg-emergency' : 'bg-hospital-primary';
  const textClass = isGeneral ? 'text-emergency' : 'text-hospital-primary';

  // --- FORGOT PASSWORD VIEW ---
  if (view === 'forgot-password') {
    return (
      <div className={`min-h-screen flex flex-col ${isGeneral ? 'bg-charcoal text-white' : 'bg-hospital-bg text-hospital-text'}`}>
        {/* Pop-up Layer */}
        {notification && (
          <NotificationToast
            message={notification.msg}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="p-6">
          <button onClick={() => { setView('login'); setResetSent(false); setResetInput(''); }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
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
                <p className="text-gray-400 text-sm mb-8">Enter your registered {isGeneral ? 'phone number' : 'email'} to reset.</p>

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
                <p className="text-gray-400 text-sm mb-8">Instructions sent to <span className="text-white font-bold">{resetInput}</span>.</p>
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

      {/* 🟢 Pop-up Notification Layer */}
      {notification && (
        <NotificationToast
          message={notification.msg}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

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
            className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${isGeneral ? 'bg-emergency text-white shadow-lg' : 'text-gray-500'}`}
          >
            User Login
          </button>
          <button
            onClick={() => setRole('hospital')}
            className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${!isGeneral ? 'bg-hospital-primary text-white shadow-lg' : 'text-gray-500'}`}
          >
            Hospital Staff
          </button>
        </div>

        <div className="text-center mb-8">
          <div className={`w-20 h-20 mx-auto rounded-full ${bgClass} flex items-center justify-center mb-4 shadow-lg`}>
            {isGeneral ? <User size={40} className="text-white" /> : <Building size={40} className="text-white" />}
          </div>
          <h1 className="text-3xl font-bold mb-2">{isGeneral ? 'Welcome Back' : 'Responder Portal'}</h1>
          <p className="text-gray-500">{isGeneral ? 'Log in for safety' : 'Authorized personnel only'}</p>
        </div>

        <div className={`w-full ${isGeneral ? 'bg-[#2f3640]' : 'bg-white'} p-8 rounded-3xl shadow-xl transition-colors duration-300`}>
          <div className="space-y-6">

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  {isGeneral ? 'Mobile Number' : 'Email'}
                </label>
                <button
                  onClick={fillDemoCredentials}
                  className={`text-xs font-bold flex items-center gap-1 ${textClass} hover:opacity-80`}
                >
                  <Sparkles size={12} /> Fill Demo
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
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2
                ${bgClass} text-white ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'LOG IN'}
            </button>

            {isGeneral && (
              <button
                onClick={() => setShowFaceScanner(true)}
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-bold text-lg border-2 border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 transform active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck size={24} />
                FACE ID LOGIN
              </button>
            )}
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
                <p className="text-gray-500 text-sm mb-2">New here?</p>
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

      {showFaceScanner && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <FaceScanner
            mode="login"
            onCancel={() => setShowFaceScanner(false)}
            onScanSuccess={handleFaceLogin}
          />
        </div>
      )}
    </div>
  );
};

export default AuthScreen;