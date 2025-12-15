import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import SignUpFlow from './components/SignUpFlow';
import HospitalSignUpFlow from './components/HospitalSignUpFlow';
import GeneralApp from './components/GeneralApp';
import HospitalDashboard from './components/HospitalDashboard';
import { AuthState, UserRole } from './types';
import { EmergencyProvider } from './contexts/EmergencyContext';

const AppContent: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);

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

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setAuthState('authenticated');
  };

  const handleSignUpComplete = () => {
    // After signup, go to login so they can sign in with new credentials
    setAuthState('login');
  };

  const handleLogout = () => {
    setAuthState('landing');
    setUserRole(null);
  };

  const handleBackToLanding = () => {
    setAuthState('landing');
    setUserRole(null);
  };

  // --- Render Logic ---

  if (authState === 'landing') {
    return (
      <LandingPage 
        onNavigate={(path) => {
           if (path === 'signup-general') navigateToGeneralSignUp();
           else if (path === 'signup-hospital') navigateToHospitalSignUp();
           else navigateToLogin();
        }} 
      />
    );
  }

  if (authState === 'signup-general') {
    return (
      <SignUpFlow 
        onBack={handleBackToLanding}
        onComplete={handleSignUpComplete}
      />
    );
  }

  if (authState === 'signup-hospital') {
    return (
       <HospitalSignUpFlow
         onBack={handleBackToLanding}
         onComplete={handleSignUpComplete}
       />
    );
  }

  if (authState === 'login') {
    return (
      <AuthScreen 
        onBack={handleBackToLanding}
        onLoginSuccess={handleLoginSuccess}
        onGoToSignUp={navigateToGeneralSignUp} // Default to general, but auth screen handles roles
      />
    );
  }

  if (authState === 'authenticated') {
    if (userRole === 'general') {
      return <GeneralApp onLogout={handleLogout} />;
    }
    if (userRole === 'hospital') {
      return <HospitalDashboard onLogout={handleLogout} />;
    }
  }

  return <div>Error: Unknown State</div>;
};

const App: React.FC = () => {
  return (
    <EmergencyProvider>
      <AppContent />
    </EmergencyProvider>
  );
};

export default App;
