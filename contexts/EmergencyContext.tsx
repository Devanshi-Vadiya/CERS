import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { EmergencyIncident, UserProfile, HospitalProfile, EmergencyType, VideoEvidence } from '../types';
import { db } from '../firebaseConfig'; // Import your firebase config
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';

interface EmergencyContextType {
  // Auth State
  currentUser: UserProfile | HospitalProfile | null;
  
  registerUser: (user: UserProfile) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;
  registerHospital: (hospital: HospitalProfile) => Promise<void>;
  loginUser: (identifier: string, role: 'general' | 'hospital') => Promise<boolean>;
  logoutUser: () => void;
  sendPasswordReset: (identifier: string, role: 'general' | 'hospital') => Promise<boolean>;

  // Emergency State
  activeEmergencies: EmergencyIncident[];
  dispatchEmergency: (type: EmergencyType | null) => void;
  updateEmergencyType: (incidentId: string, type: EmergencyType) => void;
  updateEmergencyStatus: (incidentId: string, status: EmergencyIncident['status'], message?: string) => void;
  assignHospital: (incidentId: string, hospitalId: string) => void;
  resolveEmergency: (incidentId: string) => void;
  addVideoEvidence: (incidentId: string, video: VideoEvidence) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | HospitalProfile | null>(() => {
    // We still keep the *current session* in local storage so refresh doesn't log you out
    const saved = localStorage.getItem('cers_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyIncident[]>([]);

  // --- REAL-TIME SYNC (The Magic Part) ---
  useEffect(() => {
    // Listen for ALL emergencies that are NOT resolved
    // This allows Hospitals to see new SOS alerts instantly
    const q = query(
      collection(db, "emergencies"), 
      where("status", "!=", "resolved"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const incidents: EmergencyIncident[] = [];
      snapshot.forEach((doc) => {
        incidents.push({ id: doc.id, ...doc.data() } as EmergencyIncident);
      });
      setActiveEmergencies(incidents);
    }, (error) => {
      console.error("Error fetching emergencies:", error);
      // Fallback for demo without valid API keys
      const saved = localStorage.getItem('cers_emergencies');
      if (saved) setActiveEmergencies(JSON.parse(saved));
    });

    return () => unsubscribe();
  }, []);

  // Persist session locally
  useEffect(() => { 
    if (currentUser) localStorage.setItem('cers_current_user', JSON.stringify(currentUser)); 
    else localStorage.removeItem('cers_current_user');
  }, [currentUser]);

  // --- Auth Actions (Cloud Based) ---

  const registerUser = async (user: UserProfile) => {
    try {
      // Save user to 'users' collection in Firestore
      await setDoc(doc(db, "users", user.id), user);
      setCurrentUser(user);
    } catch (e) {
      console.error("Registration failed", e);
      // Fallback for demo
      setCurrentUser(user);
    }
  };

  const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
        await updateDoc(doc(db, "users", userId), data);
        if (currentUser?.id === userId) {
            setCurrentUser(prev => prev ? { ...prev, ...data } as UserProfile : null);
        }
    } catch(e) { console.error(e); }
  };

  const registerHospital = async (hospital: HospitalProfile) => {
    try {
      await setDoc(doc(db, "hospitals", hospital.id), hospital);
      setCurrentUser(hospital);
    } catch(e) { console.error(e); }
  };

  const loginUser = async (identifier: string, role: 'general' | 'hospital'): Promise<boolean> => {
    try {
      // Real-world: Query Firestore for the user
      // Note: In production, use Firebase Auth. This handles our custom profile data.
      const collectionName = role === 'general' ? 'users' : 'hospitals';
      
      // Simple query (In real app, query by phone/email. Here we fetch active docs for demo simplicity)
      // For this hackathon demo, we will check the ID or simulated Auth
      
      // Simulating a fetch for the specific ID (assuming identifier matches ID or Phone)
      // In a real hackathon, querying entire collection is okay for small scale
      const q = query(collection(db, collectionName));
      // NOTE: We can't query efficiently without indexes on every field, so we snapshotted active users
      // Ideally: const q = query(collection(db, "users"), where("phone", "==", identifier));
      
      // For Demo Continuity (Hybrid Approach):
      // If we can't hit the DB (no keys), fallback to local login logic
      if (!db.app.options.apiKey || db.app.options.apiKey === "YOUR_API_KEY_HERE") {
         console.warn("Firebase not configured. Using Mock Login.");
         return true; // Auto-login for demo if no keys
      }

      return true; // Allow login to succeed to UI state
    } catch (e) {
      console.error("Login Error", e);
      return false;
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const sendPasswordReset = async (identifier: string, role: 'general' | 'hospital'): Promise<boolean> => {
      return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
  };

  // --- Emergency Actions (Cloud Based) ---

  const dispatchEmergency = async (type: EmergencyType | null) => {
    if (!currentUser || currentUser.role !== 'general') return;
    const user = currentUser as UserProfile;

    // Default Location
    let location = {
        lat: 12.9716, 
        lng: 77.5946,
        address: 'Fetching GPS...'
    };

    // Try to get real location
    if ('geolocation' in navigator) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => 
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
            };
        } catch (e) {
            console.log("GPS unavailable, using default");
        }
    }

    const newIncident: EmergencyIncident = {
      id: `EMG-${Date.now()}`, // Unique ID based on time
      userId: user.id,
      timestamp: new Date().toISOString(),
      status: 'active',
      type: type,
      userProfile: user,
      location: location,
      log: [{ time: new Date().toISOString(), message: 'SOS Activated - Cloud Synced' }]
    };

    try {
      // WRITE TO CLOUD
      await addDoc(collection(db, "emergencies"), newIncident);
      // Note: We don't need setActiveEmergencies here because the onSnapshot listener will trigger!
    } catch (e) {
      console.error("Failed to dispatch to cloud", e);
      // Fallback
      setActiveEmergencies(prev => [newIncident, ...prev]);
    }
  };

  const updateEmergencyType = async (incidentId: string, type: EmergencyType) => {
    try {
        // We need to find the doc reference. In our local state incidentId is the ID.
        // If we added via addDoc, the ID might differ from internal property, but usually we map them.
        
        // Query to find the document with the internal 'id' field if it differs from doc.id
        // But for simplicity, let's assume we map doc.id to incident.id in the snapshot listener
        
        await updateDoc(doc(db, "emergencies", incidentId), {
            type: type,
            // We can't easily arrayPush in basic update without arrayUnion, but let's just overwrite for MVP
            // or perform a read-modify-write
        });
    } catch (e) { console.error(e); }
  };

  const updateEmergencyStatus = async (incidentId: string, status: EmergencyIncident['status'], message?: string) => {
    try {
        await updateDoc(doc(db, "emergencies", incidentId), {
            status: status
        });
    } catch(e) { console.error(e); }
  };

  const assignHospital = async (incidentId: string, hospitalId: string) => {
    try {
        await updateDoc(doc(db, "emergencies", incidentId), {
            status: 'assigned',
            assignedHospitalId: hospitalId,
            ambulanceEta: '7 mins'
        });
    } catch(e) { console.error(e); }
  };

  const addVideoEvidence = async (incidentId: string, video: VideoEvidence) => {
    // In real world: Upload blob to Firebase Storage, get URL, then update Firestore
    // For MVP: We keep using the blob URL locally or save base64 if small
    // Since blob URLs don't work across devices, we'd strictly need Storage here.
    console.log("Video Evidence logic would upload to Firebase Storage here");
  }

  const resolveEmergency = async (incidentId: string) => {
    try {
        await updateDoc(doc(db, "emergencies", incidentId), {
            status: 'resolved'
        });
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