import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import SignUpFlow from './components/SignUpFlow';
import HospitalSignUpFlow from './components/HospitalSignUpFlow';
import GeneralApp from './components/GeneralApp';
import HospitalDashboard from './components/HospitalDashboard';
// 🟢 Added Imports for Password Reset and Admin Vetting
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import { AuthState, UserRole } from './types';
import { EmergencyProvider, useEmergencySystem } from './contexts/EmergencyContext';
// 🟢 Added Lucide-React Icons for Modals
import { CheckCircle, ShieldAlert, X, XCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const GOOGLE_MAPS_API_KEY = "AIzaSyCLFHS0iq15OzWFKJcOOlD925NhKyu3mOc";

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
              if (error) setError(null);
            }}
          />
          <input
            type="password"
            placeholder="Admin Password"
            className={`w-full p-4 bg-slate-50 rounded-2xl border outline-none transition-all ${error ? 'border-red-200' : 'border-slate-100 focus:border-blue-500'}`}
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              if (error) setError(null);
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

// @ts-ignore
class GlobalErrorBoundary extends React.Component<any, any> {
  state: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("🛑 CRITICAL APP CRASH:", error, errorInfo); }
  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-800 p-8 rounded-3xl border border-red-500/20 max-w-md shadow-2xl">
            <h1 className="text-3xl font-black text-red-500 mb-4">System Interrupted</h1>
            <p className="text-slate-300 mb-6 leading-relaxed">The application encountered a runtime error that would normally cause a blank screen.</p>
            <div className="bg-black/30 p-4 rounded-xl mb-6 text-left overflow-auto max-h-32">
              {/* @ts-ignore */}
              <code className="text-xs text-red-400 font-mono italic">{this.state.error?.message || "Unknown Runtime Error"}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg"
            >
              Force Component Restart
            </button>
          </div>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);

  // 🟢 Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const { logoutUser, currentUser } = useEmergencySystem();

  const isResetPath = window.location.pathname === '/reset-password';
  const isAdminPath = window.location.pathname === '/admin-panel';

  // 🟢 Session Restoration: If we have a user in context, put them back into 'authenticated' state
  useEffect(() => {
    if (currentUser && authState === 'landing') {
      console.log("🔄 Session Restored:", currentUser.role);
      setUserRole(currentUser.role);
      setAuthState('authenticated');
    }
  }, [currentUser, authState]);

  // 🟢 Proactive Permission Fetching on Launch
  useEffect(() => {
    const initPermissions = async () => {
      try {
        const { EmergencyService } = await import('./services/EmergencyService');
        await EmergencyService.requestAllPermissions();
      } catch (err) {
        console.warn('Initial permission sequence skipped:', err);
      }
    };
    initPermissions();
  }, []);

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

  // --- Render Logic ---

  if (isResetPath) {
    return <ResetPassword />;
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
    <GlobalErrorBoundary>
      <EmergencyProvider>
        <AppContent />
      </EmergencyProvider>
    </GlobalErrorBoundary>
  );
};

export default App;