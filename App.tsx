import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import SignUpFlow from './components/SignUpFlow';
import HospitalSignUpFlow from './components/HospitalSignUpFlow';
import GeneralApp from './components/GeneralApp';
import HospitalDashboard from './components/HospitalDashboard';
// 🟢 Added Imports for Password Reset, Admin Vetting, and Insurance
import ResetPassword from './components/ResetPassword'; 
import AdminDashboard from './components/AdminDashboard';
import InsurancePage from './components/InsurancePage';
import InsuranceDashboard from './components/InsuranceDashboard';
import { AuthState, UserRole } from './types';
import { EmergencyProvider, useEmergencySystem } from './contexts/EmergencyContext';
import { HospitalCommProvider } from './contexts/HospitalCommContext';
// 🟢 Added Lucide-React Icons for Modals
import { CheckCircle, ShieldAlert, X, XCircle } from 'lucide-react';

// --- 🟢 Custom Success Modal Component ---
const SuccessModal = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
    <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full text-center border-b-8 border-green-500 transform transition-all scale-100">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="text-green-600" size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Success!</h2>
      <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
      <button 
        onClick={onClose}
        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
      >
        Continue to Login
      </button>
    </div>
  </div>
);

// --- 🟢 Custom Admin Login Modal Component (No Alerts) ---
const AdminLoginModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    // 🔴 Logic: admin / admin123
    if (user === "admin" && pass === "admin123") {
      setError(null);
      onSuccess();
    } else {
      setError("Invalid Admin Credentials. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl max-w-sm w-full border-b-8 border-blue-600 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
        <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-blue-600" size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">Admin Access</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-pulse">
            <XCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <input 
            type="text" 
            placeholder="Admin Username" 
            className={`w-full p-4 bg-slate-50 rounded-2xl border outline-none transition-all ${error ? 'border-red-200' : 'border-slate-100 focus:border-blue-500'}`}
            value={user}
            onChange={(e) => {
                setUser(e.target.value);
                if(error) setError(null);
            }}
          />
          <input 
            type="password" 
            placeholder="Admin Password" 
             className={`w-full p-4 bg-slate-50 rounded-2xl border outline-none transition-all ${error ? 'border-red-200' : 'border-slate-100 focus:border-blue-500'}`}
            value={pass}
            onChange={(e) => {
                setPass(e.target.value);
                if(error) setError(null);
            }}
          />
        </div>
        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
        >
          Secure Login
        </button>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  
  // 🟢 Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  const [isAdminAuth, setIsAdminAuth] = useState(false); 
  const { logoutUser } = useEmergencySystem();

  const isResetPath = window.location.pathname === '/reset-password'; 
  const isAdminPath = window.location.pathname === '/admin-panel';
  const isInsurancePath = window.location.pathname === '/insurance';
  const isInsuranceDashboardPath = window.location.pathname === '/insurance/dashboard';

  // --- Router Handlers ---

  const navigateToLogin = () => {
    setAuthState('login');
  };

  const navigateToGeneralSignUp = () => {
    setAuthState('signup-general');
  };

  const navigateToHospitalSignUp = () => {
    setAuthState('signup-hospital');
  };

  const navigateToInsurance = () => {
    if (userRole === 'general') {
      setAuthState('insurance-dashboard');
      window.history.pushState({}, '', '/insurance/dashboard');
    } else {
      setAuthState('insurance');
      window.history.pushState({}, '', '/insurance');
    }
  };

  const handleAdminAuthTrigger = () => {
    setShowAdminModal(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuth(true);
    setShowAdminModal(false);
    window.history.pushState({}, '', '/admin-panel'); 
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setAuthState('authenticated');
  };

  const handleSignUpComplete = (type: 'general' | 'hospital') => {
    if (type === 'hospital') {
      setModalMessage("Application Submitted! Please wait for admin approval before logging in.");
    } else {
      setModalMessage("Your account has been created. You can now log in with your credentials.");
    }
    setShowSuccessModal(true);
  };

  const closeAndGoToLogin = () => {
    setShowSuccessModal(false);
    setAuthState('login'); 
  };

  const handleLogout = () => {
    setAuthState('landing');
    setUserRole(null);
    setIsAdminAuth(false);
    window.history.pushState({}, '', '/'); 
    logoutUser(); 
  };

  const handleBackToLanding = () => {
    setAuthState('landing');
    setUserRole(null);
    setIsAdminAuth(false);
    window.history.pushState({}, '', '/'); 
  };

  const navigateToInsurancePlans = () => {
    setAuthState('insurance');
    window.history.pushState({}, '', '/insurance');
  };

  // --- Render Logic ---

  const { currentUser, activeEmergencies } = useEmergencySystem();

  if (isResetPath) {
    return <ResetPassword />; 
  }

  if (isInsurancePath || authState === 'insurance') {
    return <InsurancePage onBack={handleBackToLanding} onGetCovered={() => setAuthState('login')} />;
  }

  if (isInsuranceDashboardPath || authState === 'insurance-dashboard') {
    if (userRole === 'general' && currentUser) {
      return (
        <InsuranceDashboard 
          user={currentUser as UserProfile} 
          emergencies={activeEmergencies} 
          onBack={handleBackToLanding} 
          onUpgrade={navigateToInsurancePlans}
        />
      );
    } else {
      // If not logged in or wrong role, redirect to public insurance page
      return <InsurancePage onBack={handleBackToLanding} onGetCovered={() => setAuthState('login')} />;
    }
  }

  if (isAdminPath || isAdminAuth) {
    return isAdminAuth ? (
      <AdminDashboard onLogout={handleLogout} /> 
    ) : (
      <LandingPage 
        onNavigate={(path) => {
           if (path === 'signup-general') navigateToGeneralSignUp();
           else if (path === 'signup-hospital') navigateToHospitalSignUp();
           else if (path === 'admin-login') handleAdminAuthTrigger();
           else if (path === 'insurance') navigateToInsurance();
           else navigateToLogin();
        }} 
      />
    );
  }

  return (
    <>
      {/* 🟢 Modals Layer */}
      {showSuccessModal && (
        <SuccessModal message={modalMessage} onClose={closeAndGoToLogin} />
      )}
      {showAdminModal && (
        <AdminLoginModal 
          onClose={() => setShowAdminModal(false)} 
          onSuccess={handleAdminLoginSuccess} 
        />
      )}

      {authState === 'landing' && (
        <LandingPage 
          onNavigate={(path) => {
             if (path === 'signup-general') navigateToGeneralSignUp();
             else if (path === 'signup-hospital') navigateToHospitalSignUp();
             else if (path === 'admin-login') handleAdminAuthTrigger();
             else if (path === 'insurance') navigateToInsurance();
             else navigateToLogin();
          }} 
        />
      )}

      {authState === 'signup-general' && (
        <SignUpFlow 
          onBack={handleBackToLanding}
          onComplete={() => handleSignUpComplete('general')}
        />
      )}

      {authState === 'signup-hospital' && (
        <HospitalSignUpFlow
          onBack={handleBackToLanding}
          onComplete={() => handleSignUpComplete('hospital')}
        />
      )}

      {authState === 'login' && (
        <AuthScreen 
          onBack={handleBackToLanding}
          onLoginSuccess={handleLoginSuccess}
          onGoToSignUp={navigateToGeneralSignUp} 
        />
      )}

      {authState === 'authenticated' && (
        <>
          {userRole === 'general' && <GeneralApp onLogout={handleLogout} />}
          {userRole === 'hospital' && <HospitalDashboard onLogout={handleLogout} />}
        </>
      )}

      {!['landing', 'signup-general', 'signup-hospital', 'login', 'authenticated'].includes(authState) && (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
            <h1 className="text-2xl font-bold text-red-600">Error: Unknown State</h1>
            <button onClick={handleBackToLanding} className="mt-4 text-blue-600 underline">Return Home</button>
          </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  return (
    <EmergencyProvider>
      <HospitalCommProvider>
        <AppContent />
      </HospitalCommProvider>
    </EmergencyProvider>
  );
};

export default App;