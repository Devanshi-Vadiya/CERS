// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef
} from 'react';
import {
  EmergencyIncident,
  UserProfile,
  HospitalProfile,
  EmergencyType,
  VideoEvidence
} from '../types';
import * as faceapi from 'face-api.js';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';



interface EmergencyContextType {
  // --- Auth & Session State ---
  currentUser: UserProfile | HospitalProfile | null;

  // --- Enhanced Security Auth Actions ---
  registerHospital: (hospital: HospitalProfile & { password: string }) => Promise<void>;
  updateHospitalStatus: (hospitalId: string, status: 'verified' | 'rejected', reason?: string) => Promise<void>;
  loginUser: (identifier: string, role: 'general' | 'hospital', password?: string) => Promise<boolean>;
  loginWithFace: (descriptor: Float32Array) => Promise<boolean>;
  logoutUser: () => void;
  initiatePasswordReset: () => void;
  sendPasswordReset: (phone: string, newPassword: string) => Promise<void>;

  // --- Profile Management ---
  registerUser: (user: UserProfile) => Promise<void>;
  updateUserProfile: (userId: string, data: Partial<UserProfile>) => Promise<void>;

  // --- Emergency Operations (Live Sync) ---
  activeEmergencies: EmergencyIncident[];
  dispatchEmergency: (type: EmergencyType | null, coords?: { lat: number, lng: number }) => Promise<void>;
  updateEmergencyType: (incidentId: string, type: EmergencyType | null) => Promise<void>;
  updateEmergencyStatus: (incidentId: string, status: EmergencyIncident['status'], message?: string) => Promise<void>;
  assignHospital: (incidentId: string, hospitalId: string, eta: string, extraData?: any) => Promise<void>;
  rejectEmergency: (incidentId: string) => Promise<void>;
  resolveEmergency: (incidentId: string) => Promise<void>;
  addVideoEvidence: (incidentId: string, video: VideoEvidence) => void;
  updateEmergencyLocation: (incidentId: string, lat: number, lng: number) => Promise<void>;
  updateAmbulanceLocation: (incidentId: string, lat: number, lng: number) => Promise<void>;
  allHospitals: HospitalProfile[];
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [currentUser, setCurrentUser] = useState<UserProfile | HospitalProfile | null>(() => {
    try {
      const saved = sessionStorage.getItem('cers_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyIncident[]>([]);
  const [allHospitals, setAllHospitals] = useState<HospitalProfile[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const isDemo = false;

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
      const saved = localStorage.getItem('cers_emergencies');
      if (saved) setActiveEmergencies(JSON.parse(saved));
      return;
    }

    try {
      const q = query(
        collection(db, "emergencies"),
        where("status", "in", ["active", "assigned", "enroute", "dispatched", "arrived"]),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const incidents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as EmergencyIncident[];

        console.log("📡 Cloud Sync: Processing Live Feed...");
        setActiveEmergencies(incidents);
      }, (error) => {
        console.error("Firestore Listener Error (Check Index!):", error);
      });

      unsubscribeRef.current = unsubscribe;
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase Connection Error:", err);
    }
  }, [isDemo]);

  // 🏥 SYNC ALL HOSPITALS
  useEffect(() => {
    if (isDemo) return;

    const q = query(
      collection(db, "hospitals"),
      where("status", "==", "verified")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const hospitals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HospitalProfile[];
      setAllHospitals(hospitals);
    });

    return () => unsubscribe();
  }, [isDemo]);

  // Persist session
  useEffect(() => {
    if (currentUser) sessionStorage.setItem('cers_current_user', JSON.stringify(currentUser));
    else sessionStorage.removeItem('cers_current_user');
  }, [currentUser]);

  // --- Auth Actions ---

  const initiatePasswordReset = () => {
    window.open('/reset-password', '_blank');
  };

  const sendPasswordReset = async (phone: string, newPassword: string) => {
    try {
      const q = query(
        collection(db, "hospitals"),
        where("adminDetails.phone", "==", phone)
      );

      const snap = await getDocs(q);
      if (snap.empty) {
        alert("🚫 No hospital found with this phone number");
        return;
      }

      await updateDoc(snap.docs[0].ref, {
        password: newPassword,
        passwordLastChanged: new Date().toISOString()
      });

      alert("✅ Password updated. You may close this tab.");
      setTimeout(() => window.close(), 1500);
    } catch {
      alert("System error during reset");
    }
  };

  const registerUser = async (userData: UserProfile) => {
    try {
      const docRef = await addDoc(collection(db, "users"), {
        ...userData,
        role: "general",
        createdAt: new Date().toISOString(),
      });

      const user = {
        ...userData,
        id: docRef.id,
        role: "general",
      };

      setCurrentUser(user);
      sessionStorage.setItem("cers_current_user", JSON.stringify(user));
    } catch (error) {
      console.error("User signup error:", error);
      alert("User signup failed");
    }
  };

  const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
    try {
      await updateDoc(doc(db, "users", userId), data);
      setCurrentUser(prev => prev ? { ...prev, ...data } : prev);
    } catch (err) {
      console.error("Profile update failed", err);
    }
  };

  const registerHospital = async (hospitalData: HospitalProfile & { password: string }) => {
    if (isDemo) {
      alert("Database Connection Required");
      return;
    }

    try {
      await addDoc(collection(db, "hospitals"), {
        ...hospitalData,
        role: "hospital",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      alert("✅ Application Submitted! Please wait for admin approval before logging in.");
    } catch (error) {
      console.error("Signup Error:", error);
      alert("❌ Signup failed. Please try again.");
    }
  };

  const loginUser = async (
    identifier: string,
    role: 'general' | 'hospital',
    password?: string
  ): Promise<boolean> => {
    try {
      if (role === 'general') {
        const q = query(collection(db, "users"), where("phone", "==", identifier));
        const snap = await getDocs(q);
        if (snap.empty) {
          alert("❌ User not registered");
          return false;
        }
        const user = { ...snap.docs[0].data(), id: snap.docs[0].id };
        setCurrentUser(user as UserProfile);
        return true;
      }

      // 🏥 HOSPITAL LOGIN
      const q = query(collection(db, "hospitals"), where("email", "==", identifier));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert("❌ Hospital not registered");
        return false;
      }

      const hospital = { ...snap.docs[0].data(), id: snap.docs[0].id };

      if (hospital.password !== password) {
        alert("❌ Incorrect password");
        return false;
      }

      if (hospital.status === 'pending') {
        alert("⏳ Access Denied: Your application is still under review.");
        return false;
      }

      if (hospital.status === 'rejected') {
        alert(`🚫 Registration Rejected: ${hospital.rejectionReason || "No reason provided."}`);
        return false;
      }

      setCurrentUser(hospital);
      sessionStorage.setItem("cers_current_user", JSON.stringify(hospital));
      return true;

    } catch (err) {
      console.error("Login Error:", err);
      return false;
    }
  };

  const loginWithFace = async (descriptor: Float32Array): Promise<boolean> => {
    try {
      // 1. Fetch reference images of Dhvanit
      const img1 = await faceapi.fetchImage('/dhvanit_face_1.jpg');
      const img2 = await faceapi.fetchImage('/dhvanit_face_2.jpg');

      const det1 = await faceapi.detectSingleFace(img1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      const det2 = await faceapi.detectSingleFace(img2, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();

      let matched = false;
      const threshold = 0.55;

      const checkMatch = (refDesc?: Float32Array) => {
        if (!refDesc) return false;
        let distance = 0;
        for (let i = 0; i < descriptor.length; i++) {
          distance += Math.pow(descriptor[i] - refDesc[i], 2);
        }
        return Math.sqrt(distance) < threshold;
      };

      if ((det1 && checkMatch(det1.descriptor)) || (det2 && checkMatch(det2.descriptor))) {
        matched = true;
      }

      if (matched) {
        // Login successful, set user to the first general user or a specific one
        const q = query(collection(db, "users"), where("role", "==", "general"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const bestUser = { ...snap.docs[0].data(), id: snap.docs[0].id } as UserProfile;
          setCurrentUser(bestUser);
        } else {
          // Mock user if DB is empty for demo purposes
          const mockUser = {
            id: 'user_dhvan',
            name: 'Dhvanit Kanabar',
            phone: '9999999999',
            role: 'general',
          };
          setCurrentUser(mockUser as UserProfile);
        }
        return true;
      }

      alert("❌ Face not recognized or registered.");
      return false;
    } catch (error) {
      console.error("Face login error:", error);
      alert("Error processing face login.");
      return false;
    }
  };

  // --- Session Management ---

  const updateHospitalStatus = async (
    hospitalId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ) => {
    try {
      // Use the Firestore document ID directly (passed from AdminDashboard as doc.id)
      console.log("Updating hospital ID:", hospitalId);

      const hospitalDocRef = doc(db, "hospitals", hospitalId);

      const updateData: any = {
        status: status,
        updatedAt: new Date().toISOString()
      };

      if (status === 'rejected' && reason) {
        updateData.rejectionReason = reason;
      }

      await updateDoc(hospitalDocRef, updateData);
      alert(`✅ Hospital ${status} successfully.`);

    } catch (error) {
      console.error("❌ Firestore Update Error:", error);
      alert("❌ Failed to update hospital status.");
    }
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('cers_current_user');
    sessionStorage.removeItem('cers_current_user');
    if (isDemo) {
      localStorage.removeItem('cers_emergencies');
    }
  };

  // --- Emergency Actions ---

  // ✅ UPDATED: Gets real GPS + reverse geocodes to exact area name via OpenStreetMap
  const dispatchEmergency = async (type: EmergencyType | null, manualCoords?: { lat: number, lng: number }) => {
    if (!currentUser || currentUser.role !== 'general') return;

    // Step 1: Get real GPS coordinates from the device
    const getLocation = (): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve({ lat: 21.1702, lng: 72.8311 }); // Fallback: Surat
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 21.1702, lng: 72.8311 }), // Fallback on denial/timeout
          { enableHighAccuracy: true, timeout: 6000 }
        );
      });
    };

    // Step 2: Reverse geocode coords → precise area name (free, no API key)
    const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        const a = data.address || {};

        // Build: "Neighbourhood, City District, City" — most precise first
        const parts = [
          a.neighbourhood || a.suburb || a.village || a.hamlet || a.road,
          a.city_district || a.county,
          a.city || a.town || a.state_district,
        ].filter(Boolean);

        return parts.length > 0 ? parts.join(', ') : (data.display_name || 'Location detected');
      } catch {
        return 'Location detected';
      }
    };

    const coords = manualCoords || await getLocation();
    const address = await reverseGeocode(coords.lat, coords.lng);

    const incident: EmergencyIncident = {
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      status: 'active',
      type,
      userProfile: currentUser,
      location: { lat: coords.lat, lng: coords.lng, address },
      log: [{ time: new Date().toISOString(), message: 'SOS Activated' }]
    };

    if (!isDemo) {
      await addDoc(collection(db, "emergencies"), incident);
    } else {
      updateLocalState(prev => [{ id: `EMG-${Date.now()}`, ...incident }, ...prev]);
    }
  };

  const resolveEmergency = async (incidentId: string) => {
    updateLocalState(prev => prev.filter(e => e.id !== incidentId));
    if (!isDemo) {
      await updateDoc(doc(db, "emergencies", incidentId), {
        status: 'resolved',
        endedAt: new Date().toISOString()
      });
    }
  };

  const assignHospital = async (incidentId: string, hospitalId: string, eta: string, extraData?: any) => {
    try {
      const data = {
        status: 'assigned',
        assignedHospitalId: hospitalId,
        ambulanceEta: eta,
        ...extraData
      };

      // 🛡️ Firestore Sanitization: updateDoc crashes on 'undefined' values
      const sanitizedData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, ...data } : e));

      if (!isDemo) {
        await updateDoc(doc(db, "emergencies", incidentId), sanitizedData);
      }

      console.log(`✅ Incident ${incidentId} assigned successfully.`);
    } catch (error) {
      console.error("❌ Firestore Assignment Error:", error);
      throw error;
    }
  };

  const updateEmergencyStatus = async (incidentId: string, status: any) => {
    updateLocalState(prev => prev.map(e => e.id === incidentId ? { ...e, status } : e));
    if (!isDemo) await updateDoc(doc(db, "emergencies", incidentId), { status });
  };

  const updateEmergencyLocation = async (incidentId: string, lat: number, lng: number) => {
    if (!isDemo) {
      await updateDoc(doc(db, "emergencies", incidentId), {
        location: { lat, lng, updatedAt: new Date().toISOString() }
      });
    }
  };

  const updateAmbulanceLocation = async (incidentId: string, lat: number, lng: number) => {
    if (!isDemo) {
      await updateDoc(doc(db, "emergencies", incidentId), {
        ambulanceLocation: { lat, lng, updatedAt: new Date().toISOString() }
      });
    }
  };

  const updateEmergencyType = async (incidentId: string, type: EmergencyType | null) => {
    if (!isDemo) await updateDoc(doc(db, 'emergencies', incidentId), { type });
  };

  const rejectEmergency = async (incidentId: string) => {
    if (!isDemo) await updateDoc(doc(db, 'emergencies', incidentId), { status: 'rejected' });
    else updateLocalState(prev => prev.filter(e => e.id !== incidentId));
  };

  const addVideoEvidence = async (incidentId: string, video: VideoEvidence) => {
    if (!isDemo) await updateDoc(doc(db, 'emergencies', incidentId), { videoEvidence: video });
  };

  return (
    <EmergencyContext.Provider value={{
      currentUser,
      registerUser,
      updateUserProfile,
      registerHospital,
      loginUser,
      loginWithFace,
      logoutUser,
      initiatePasswordReset,
      sendPasswordReset,
      updateHospitalStatus,
      activeEmergencies,
      dispatchEmergency,
      updateEmergencyType,
      updateEmergencyStatus,
      assignHospital,
      rejectEmergency,
      resolveEmergency,
      addVideoEvidence,
      updateEmergencyLocation,
      updateAmbulanceLocation,
      allHospitals
    }}>
      {children}
    </EmergencyContext.Provider>
  );
};

// Named export for the hook
export const useEmergencySystem = () => {
  const context = useContext(EmergencyContext);
  if (!context) throw new Error('useEmergencySystem must be used within EmergencyProvider');
  return context;
};
