// @ts-nocheck
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { EmergencyIncident, UserProfile, HospitalProfile, EmergencyType, VideoEvidence } from '../types';
import { db } from '../firebaseConfig'; 
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  setDoc,
  orderBy
} from 'firebase/firestore';

interface EmergencyContextType {
  currentUser: UserProfile | HospitalProfile | null;
  
  registerUser: (user: UserProfile) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  registerHospital: (hospital: HospitalProfile) => Promise<void>;
  loginUser: (identifier: string, role: 'general' | 'hospital') => Promise<boolean>;
  logoutUser: () => void;
  sendPasswordReset: (identifier: string, role: 'general' | 'hospital') => Promise<boolean>;

  activeEmergencies: EmergencyIncident[];
  dispatchEmergency: (type: EmergencyType | null) => Promise<void>;
  updateEmergencyType: (incidentId: string, type: EmergencyType | null) => Promise<void>;
  updateEmergencyStatus: (incidentId: string, status: EmergencyIncident['status'], message?: string) => Promise<void>;
  assignHospital: (incidentId: string, hospitalId: string) => Promise<void>;
  resolveEmergency: (incidentId: string) => Promise<void>;
  addVideoEvidence: (incidentId: string, video: VideoEvidence) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | HospitalProfile | null>(() => {
    try {
      const saved = localStorage.getItem('cers_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyIncident[]>([]);
  
  // Track the snapshot listener to unsubscribe if we go offline/fallback
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Detect Demo Mode (No valid API Key or Placeholders)
  const isDemo = !db?.app?.options?.apiKey || 
                 db?.app?.options?.apiKey === "YOUR_API_KEY_HERE" ||
                 db?.app?.options?.projectId === "YOUR_PROJECT_ID";

  // Helper for Demo Data Persistence
  const updateLocalState = (updater: (prev: EmergencyIncident[]) => EmergencyIncident[]) => {
      setActiveEmergencies(prev => {
          const newState = updater(prev);
          localStorage.setItem('cers_emergencies', JSON.stringify(newState));
          return newState;
      });
  };

  // --- REAL-TIME SYNC ---
  useEffect(() => {
    if (isDemo) {
        // Load mock data if local storage is empty
        const saved = localStorage.getItem('cers_emergencies');
        if (saved) {
           setActiveEmergencies(JSON.parse(saved));
        }
        return;
    }

    try {
      const q = query(
        collection(db, "emergencies"), 
        where("status", "!=", "resolved"),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot: any) => {
        const incidents: EmergencyIncident[] = [];
        snapshot.forEach((doc: any) => {
          incidents.push({ id: doc.id, ...doc.data() } as EmergencyIncident);
        });
        setActiveEmergencies(incidents);
      }, (error: any) => {
        console.error("Firestore Error (Switching to offline mode):", error);
        // Fallback for demo/offline if listener fails
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        const saved = localStorage.getItem('cers_emergencies');
        if (saved) setActiveEmergencies(JSON.parse(saved));
      });

      unsubscribeRef.current = unsubscribe;

      return () => {
          if (unsubscribeRef.current) unsubscribeRef.current();
      };
    } catch (err) {
      console.error("Firebase Init Error:", err);
    }
  }, [isDemo]);

  // Persist session
  useEffect(() => { 
    if (currentUser) localStorage.setItem('cers_current_user', JSON.stringify(currentUser)); 
    else localStorage.removeItem('cers_current_user');
  }, [currentUser]);

  // --- Auth Actions ---

  const registerUser = async (user: UserProfile) => {
    if (isDemo) {
        setCurrentUser(user);
        return;
    }
    try {
      await setDoc(doc(db, "users", user.id), user);
      setCurrentUser(user);
    } catch (e) {
      console.error("Registration failed", e);
      setCurrentUser(user);
    }
  };

  const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, ...data } as UserProfile : null);
    }
    if (isDemo) return;
    try {
        await updateDoc(doc(db, "users", userId), data);
    } catch(e) { console.error(e); }
  };

  const registerHospital = async (hospital: HospitalProfile) => {
    if (isDemo) {
        setCurrentUser(hospital);
        return;
    }
    try {
      await setDoc(doc(db, "hospitals", hospital.id), hospital);
      setCurrentUser(hospital);
    } catch(e) { console.error(e); }
  };

  const loginUser = async (identifier: string, role: 'general' | 'hospital'): Promise<boolean> => {
     // Simulate Network
     await new Promise(r => setTimeout(r, 800));

     if (role === 'general') {
        // 1. Try Local Storage Recovery
        const saved = localStorage.getItem('cers_current_user');
        if (saved) {
             const parsed = JSON.parse(saved);
             if (parsed.role === 'general') {
                 setCurrentUser(parsed);
                 return true;
             }
        }

        // 2. Demo User Creation
        const mockUser: UserProfile = {
            id: 'USR-DEMO-' + Math.floor(Math.random() * 1000),
            name: 'Demo User',
            phone: identifier,
            role: 'general',
            email: 'user@cers.com',
            medicalInfo: {
                bloodGroup: 'O+',
                allergies: 'None',
                conditions: 'None',
                medications: 'None'
            },
            emergencyContacts: [
                { name: 'Family Contact', phone: '1234567890', relation: 'Family' }
            ]
        };
        setCurrentUser(mockUser);
        return true;
     } else {
         const mockHospital: HospitalProfile = {
            id: 'HOSP-DEMO',
            name: 'City General Hospital',
            licenseNumber: 'LIC-001',
            email: identifier,
            role: 'hospital',
            type: 'Hospital',
            serviceAreaRadius: 15,
            adminDetails: { name: 'Admin', phone: '1234567890', designation: 'Manager' },
            resources: { ambulances: 5, doctors: 10, beds: 50 },
            status: 'verified'
         };
         setCurrentUser(mockHospital);
         return true;
     }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const sendPasswordReset = async (identifier: string, role: 'general' | 'hospital'): Promise<boolean> => {
      return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
  };

  // --- Emergency Actions ---

  const dispatchEmergency = async (type: EmergencyType | null) => {
    if (!currentUser || currentUser.role !== 'general') {
        console.error("No active general user found for dispatch");
        return;
    }
    const user = currentUser as UserProfile;

    // 1. Get Location (with timeout default)
    let location = {
        lat: 12.9716, 
        lng: 77.5946,
        address: 'Fetching GPS...'
    };

    try {
        if ('geolocation' in navigator) {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => 
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
            );
            location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            };
        }
    } catch (e) {
        console.log("GPS unavailable/timeout, using default");
    }

    const newIncident: EmergencyIncident = {
      id: `EMG-${Date.now()}`, 
      userId: user.id,
      timestamp: new Date().toISOString(),
      status: 'active',
      type: type,
      userProfile: user,
      location: location,
      log: [{ time: new Date().toISOString(), message: 'SOS Activated' }]
    };

    // 2. CRITICAL: Update Local State IMMEDIATELY (Optimistic UI)
    // This ensures the UI transitions to "Active Emergency" even if network is slow/broken
    updateLocalState(prev => [newIncident, ...prev]);

    // 3. Try to sync to Cloud
    if (!isDemo) {
        try {
          await addDoc(collection(db, "emergencies"), newIncident);
        } catch (e) {
          console.error("Failed to dispatch to cloud", e);
          
          // If cloud write fails, disconnect the listener so it doesn't overwrite our local state with stale/empty data
          if (unsubscribeRef.current) {
             unsubscribeRef.current();
             unsubscribeRef.current = null;
          }
          // We don't need to re-update local state because we did it optimistically at step 2
        }
    }
  };

  const updateEmergencyType = async (incidentId: string, type: EmergencyType | null) => {
    if (isDemo || !unsubscribeRef.current) {
        updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, type: type } : e));
        return;
    }
    try {
        await updateDoc(doc(db, "emergencies", incidentId), { type: type });
    } catch (e) { 
        console.error(e);
        // Fallback
        updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, type: type } : e));
    }
  };

  const updateEmergencyStatus = async (incidentId: string, status: EmergencyIncident['status'], message?: string) => {
    if (isDemo || !unsubscribeRef.current) {
        updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, status: status } : e));
        return;
    }
    try {
        await updateDoc(doc(db, "emergencies", incidentId), { status: status });
    } catch(e) { console.error(e); }
  };

  const assignHospital = async (incidentId: string, hospitalId: string) => {
    if (isDemo || !unsubscribeRef.current) {
        updateLocalState(prev => prev.map(e => e.id === incidentId ? { 
            ...e, 
            status: 'assigned',
            assignedHospitalId: hospitalId,
            ambulanceEta: '7 mins'
        } : e));
        return;
    }
    try {
        await updateDoc(doc(db, "emergencies", incidentId), {
            status: 'assigned',
            assignedHospitalId: hospitalId,
            ambulanceEta: '7 mins'
        });
    } catch(e) { console.error(e); }
  };

  const addVideoEvidence = async (incidentId: string, video: VideoEvidence) => {
    if (isDemo || !unsubscribeRef.current) {
        updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, videoEvidence: video } : e));
        return;
    }
    try {
        await updateDoc(doc(db, "emergencies", incidentId), { videoEvidence: video });
    } catch(e) { console.error(e); }
  }

  const resolveEmergency = async (incidentId: string) => {
    if (isDemo || !unsubscribeRef.current) {
        updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, status: 'resolved' } : e));
        return;
    }
    try {
        await updateDoc(doc(db, "emergencies", incidentId), { status: 'resolved' });
    } catch(e) { console.error(e); }
  };

  return (
    <EmergencyContext.Provider value={{
      currentUser,
      registerUser,
      updateUserProfile,
      registerHospital,
      loginUser,
      logoutUser,
      sendPasswordReset,
      activeEmergencies,
      dispatchEmergency,
      updateEmergencyType,
      updateEmergencyStatus,
      assignHospital,
      addVideoEvidence,
      resolveEmergency
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergencySystem = () => {
  const context = useContext(EmergencyContext);
  if (context === undefined) {
    throw new Error('useEmergencySystem must be used within an EmergencyProvider');
  }
  return context;
};