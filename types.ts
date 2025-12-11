export type UserRole = 'general' | 'hospital' | null;

export type AuthState = 'landing' | 'login' | 'signup-general' | 'signup-hospital' | 'authenticated';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  role: 'general';
  dob?: string;
  gender?: string;
  medicalInfo?: {
    bloodGroup: string;
    allergies: string;
    conditions: string;
    medications: string;
  };
  emergencyContacts?: {
    name: string;
    phone: string;
    relation: string;
  }[];
  permissions?: {
    location: boolean;
    camera: boolean;
    contacts: boolean;
  };
}

export interface HospitalProfile {
  id: string;
  name: string;
  licenseNumber: string;
  email: string;
  password?: string;
  role: 'hospital';
  serviceAreaRadius: number;
  type: 'Hospital' | 'Clinic' | 'Ambulance' | 'Government';
  adminDetails: {
    name: string;
    phone: string;
    designation: string;
  };
  resources: {
    ambulances: number;
    doctors: number;
    beds: number;
  };
  status: 'pending' | 'verified';
}

export interface VideoEvidence {
  id: string;
  url: string; // Blob URL
  timestamp: string;
  duration: number;
  emergencyType: string;
  location: LocationData;
}

export interface EmergencyIncident {
  id: string;
  userId: string;
  timestamp: string;
  status: 'active' | 'assigned' | 'dispatched' | 'arrived' | 'resolved';
  type: EmergencyType | null; 
  userProfile: UserProfile; 
  location: LocationData;
  log: {
    time: string;
    message: string;
  }[];
  videoEvidence?: VideoEvidence;
  assignedHospitalId?: string;
  ambulanceEta?: string;
}

export enum EmergencyCategory {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  MODERATE = 'MODERATE'
}

export interface EmergencyType {
  id: string;
  name: string;
  icon: string; 
  category: EmergencyCategory;
  instructions: string[];
  do: string[];
  dont: string[];
  color: string;
}

export interface Volunteer {
  id: string;
  name: string;
  distance: string; 
  role: 'First Responder' | 'Doctor' | 'Civilian';
  rating: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum AppTab {
  HOME = 'HOME',
  GUIDE = 'GUIDE',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS',
  DASHBOARD = 'DASHBOARD',
  CASES = 'CASES',
  RESOURCES = 'RESOURCES',
  STAFF = 'STAFF'
}

export enum AppMode {
  NORMAL = 'NORMAL',
  SOS_CONFIRMATION = 'SOS_CONFIRMATION',
  SELECT_EMERGENCY = 'SELECT_EMERGENCY',
  ACTIVE_EMERGENCY = 'ACTIVE_EMERGENCY',
  CHAT = 'CHAT'
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}
