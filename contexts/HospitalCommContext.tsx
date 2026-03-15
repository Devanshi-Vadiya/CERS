import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebaseConfig';
import { 
  collection, query, where, orderBy, onSnapshot, 
  addDoc, updateDoc, doc, Timestamp, serverTimestamp
} from 'firebase/firestore';
import { HospitalAssistanceRequest, InterHospitalMessage, HospitalProfile } from '../types';
import { useEmergencySystem } from './EmergencyContext';

interface HospitalCommContextType {
  hospitals: HospitalProfile[];
  myRequests: HospitalAssistanceRequest[];
  incomingRequests: HospitalAssistanceRequest[];
  messages: { [requestId: string]: InterHospitalMessage[] };
  
  updateFacilityData: (facilities: string[], icuBeds: number, ambulances: number) => Promise<void>;
  sendAssistanceRequest: (data: Partial<HospitalAssistanceRequest>) => Promise<void>;
  respondToRequest: (requestId: string, status: HospitalAssistanceRequest['status']) => Promise<void>;
  updateRequestStatus: (requestId: string, status: HospitalAssistanceRequest['status']) => Promise<void>;
  sendMessage: (requestId: string, text: string) => Promise<void>;
}

const HospitalCommContext = createContext<HospitalCommContextType | null>(null);

export const useHospitalComm = () => {
  const context = useContext(HospitalCommContext);
  if (!context) throw new Error("useHospitalComm must be used within HospitalCommProvider");
  return context;
};

export const HospitalCommProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useEmergencySystem();
  const isHospital = currentUser?.role === 'hospital';
  const hospitalData = currentUser as HospitalProfile | null;

  const [hospitals, setHospitals] = useState<HospitalProfile[]>([]);
  const [myRequests, setMyRequests] = useState<HospitalAssistanceRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<HospitalAssistanceRequest[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: InterHospitalMessage[] }>({});

  // 1. Listen to verified hospitals
  useEffect(() => {
    if (!isHospital) return;
    const q = query(collection(db, "hospitals"), where("status", "==", "verified"));
    const unsub = onSnapshot(q, (snapshot) => {
      setHospitals(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HospitalProfile)));
    });
    return () => unsub();
  }, [isHospital]);

  // 2. Listen to Requests (Sent and Received)
  useEffect(() => {
    if (!isHospital || !hospitalData?.id) {
      console.log("HospitalComm: No hospital session active yet");
      return;
    }

    const myId = hospitalData.id;
    const myName = hospitalData.name;
    console.log(`HospitalComm: Listening for requests targeting ID: ${myId} or Name: ${myName}`);

    // Fetch all requests - we'll filter on the client to be 100% sure we don't miss anything
    // due to field name mismatches or missing indexes
    const q = query(collection(db, "hospital_requests"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const allDocs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...d.data() 
      } as HospitalAssistanceRequest));

      console.log(`HospitalComm: Received ${allDocs.length} total requests from system`);

      // SENT: Requests sent BY me
      const sent = allDocs.filter(req => 
        req.fromHospitalId === myId || 
        req.requestingHospitalId === myId ||
        (req as any).senderId === myId
      );

      // INCOMING: Requests sent TO me
      const incoming = allDocs.filter(req => 
        req.toHospitalId === myId || 
        (req as any).receivingHospitalId === myId ||
        // Fallback: If IDs don't match for some reason, check name
        (req.toHospitalName && req.toHospitalName.toLowerCase() === myName.toLowerCase())
      );

      console.log(`HospitalComm: Filter Results -> Sent: ${sent.length}, Incoming: ${incoming.length}`);

      // Sort both by timestamp
      const sortByTime = (a: any, b: any) => {
        const timeA = a.requestTimestamp || a.timestamp || '';
        const timeB = b.requestTimestamp || b.timestamp || '';
        return timeB.localeCompare(timeA);
      };

      setMyRequests(sent.sort(sortByTime));
      setIncomingRequests(incoming.sort(sortByTime));
    }, (err) => {
      console.error("HospitalComm: Snapshot listener error:", err);
    });

    return () => unsub();
  }, [isHospital, hospitalData?.id, hospitalData?.name]);

  // 3. Listen to messages for active requests
  useEffect(() => {
    if (!isHospital || !hospitalData?.id) return;
    
    // Combine IDs of requests we are involved in
    const activeReqIds = [...myRequests, ...incomingRequests]
      .filter(req => req.status === 'Accepted' || req.status === 'Patient Transfer In Progress')
      .map(req => req.id);

    if (activeReqIds.length === 0) return;

    const unsubs: (() => void)[] = [];

    activeReqIds.forEach(reqId => {
      const q = query(
        collection(db, "hospital_requests", reqId, "messages"),
        orderBy("timestamp", "asc")
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InterHospitalMessage));
        setMessages(prev => ({ ...prev, [reqId]: msgs }));
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, [myRequests, incomingRequests, isHospital, hospitalData?.id]);

  // Actions
  const updateFacilityData = async (facilities: string[], icuBeds: number, ambulances: number) => {
    if (!hospitalData?.id) return;
    console.log("HospitalComm: Updating facilities for", hospitalData.id);
    await updateDoc(doc(db, "hospitals", hospitalData.id), {
      facilities,
      icuBeds,
      'resources.ambulances': ambulances
    });
  };

  const sendAssistanceRequest = async (data: Partial<HospitalAssistanceRequest>) => {
    if (!hospitalData?.id) return;
    
    console.log("HospitalComm: Sending assistance request to", data.toHospitalId);
    
    const payload: any = {
      ...data,
      // Essential fields for both new and old logic
      fromHospitalId: hospitalData.id,
      fromHospitalName: hospitalData.name,
      fromHospitalLocation: hospitalData.address || 'Unknown',
      
      // Ensure these are explicitly set even if not in data
      toHospitalId: (data as any).toHospitalId || '',
      toHospitalName: (data as any).toHospitalName || '',
      
      requestStatus: 'Pending',
      requestTimestamp: new Date().toISOString(),
      
      // Legacy compatibility
      requestingHospitalId: hospitalData.id,
      requestingHospitalName: hospitalData.name,
      requestingHospitalLocation: hospitalData.address || 'Unknown',
      status: 'Pending',
      timestamp: new Date().toISOString()
    };

    try {
      const ref = await addDoc(collection(db, "hospital_requests"), payload);
      await updateDoc(ref, { requestId: ref.id });
      console.log("HospitalComm: Request sent successfully with ID:", ref.id);
    } catch (err) {
      console.error("HospitalComm: Failed to send request:", err);
      throw err;
    }
  };

  const respondToRequest = async (requestId: string, status: HospitalAssistanceRequest['status']) => {
    if (!hospitalData?.id) return;
    console.log(`HospitalComm: Responding to request ${requestId} with status ${status}`);
    
    await updateDoc(doc(db, "hospital_requests", requestId), { 
      status, 
      requestStatus: status,
      respondingHospitalId: hospitalData.id,
      respondingHospitalName: hospitalData.name,
      respondedTimestamp: new Date().toISOString()
    });

    // Auto-send a system message to the chat
    const messageText = status === 'Accepted' 
      ? `✅ Request Accepted by ${hospitalData.name}. Coordination channel is now open.`
      : `❌ Request Declined by ${hospitalData.name}.`;

    await addDoc(collection(db, "hospital_requests", requestId, "messages"), {
      requestId,
      senderId: 'system',
      senderName: 'System Notification',
      text: messageText,
      timestamp: new Date().toISOString(),
      isSystem: true
    });
  };

  const updateRequestStatus = async (requestId: string, status: HospitalAssistanceRequest['status'], extraData?: any) => {
    console.log(`HospitalComm: Updating status of ${requestId} to ${status}`);
    await updateDoc(doc(db, "hospital_requests", requestId), { 
      status, 
      requestStatus: status,
      ...extraData,
      lastUpdated: new Date().toISOString()
    });

    // Optional: Add a system message for major status changes
    if (status === 'Patient Transfer In Progress') {
      await addDoc(collection(db, "hospital_requests", requestId, "messages"), {
        requestId,
        senderId: 'system',
        senderName: 'System Notification',
        text: `🚑 Patient transfer has been initiated.`,
        timestamp: new Date().toISOString(),
        isSystem: true
      });
    }
  };

  const sendMessage = async (requestId: string, text: string) => {
    if (!hospitalData?.id) return;
    await addDoc(collection(db, "hospital_requests", requestId, "messages"), {
      requestId,
      senderId: hospitalData.id,
      senderName: hospitalData.name,
      text,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <HospitalCommContext.Provider value={{
      hospitals, myRequests, incomingRequests, messages,
      updateFacilityData, sendAssistanceRequest, respondToRequest, updateRequestStatus, sendMessage
    }}>
      {children}
    </HospitalCommContext.Provider>
  );
};
