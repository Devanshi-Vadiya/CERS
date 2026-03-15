# CERS+ (Emergency Response System)

CERS+ is a professional-grade Emergency Response System built to bridge the gap between patients, hospitals, and responders in real-time. It leverages AI-driven dispatch, live satellite tracking, and automated ETAs to minimize response times and save lives.

## 🚀 Key Features

### 🚑 For Patients (General App)
- **One-Tap SOS**: Instantly alerts the nearest hospital and emergency contacts.
- **Live Tracking**: See the ambulance's real-time position on a map as it approaches your location.
- **AI First-Aid Assistant**: Integrated Gemini AI provides instant medical guidance while waiting for responders.
- **Video Evidence**: Securely record and upload incident videos to assist medical teams.
- **Offline SMS Support**: Automatic fallback to SMS alerts when internet connectivity is unavailable.

### 🏥 For Hospitals (Dashboard)
- **Automated Dispatch**: Zero manual entry for ETAs. The system uses Google Maps AI to calculate travel times based on real-time traffic.
- **Ambulance Tracking**: Monitor the live location of assigned ambulances directly from the dashboard.
- **Resource Management**: Manage ICU bed availability and ambulance fleet status.
- **Interactive Map**: View patient location, ambulance route, and hospital proximity in a single synchronized interface.

### 🛠️ For Administrators
- **Hospital Vetting**: Secure queue for verifying and approving new hospital registrations.
- **System Audit**: Monitor active emergencies and response patterns.

## 💻 Tech Stack

- **Frontend**: React 19 (TypeScript), Vite, Tailwind CSS
- **Backend/Database**: Firebase (Firestore, Authentication)
- **AI/ML**: Google Gemini API (First-Aid Guidance)
- **Maps/GIS**: 
  - Google Maps JavaScript API (Display)
  - Google Maps Distance Matrix API (AI Traffic/ETA)
- **Mobile Infrastructure**: Capacitor 8 (Camera, Geolocation, Network, SMS)
- **Data Visualization**: Recharts (Operational Metrics)

## 🛠️ Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd CERS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `firebaseConfig.ts` and ensure your Google Maps API Key is configured in `components/TrackingMap.tsx` and `services/MapService.ts`.

### 4. Running the App
```bash
# Web Development
npm run dev

# Android Deployment
npx cap sync android
npx cap open android
```

## 🔑 Required API Permissions

To enable full functionality, ensure the following are configured in your Google Cloud Console:
- **Maps JavaScript API** (For live map rendering)
- **Distance Matrix API** (For AI-driven ETA calculations)
- **Generative Language API** (For Gemini AI Assistant)

## 🏗️ Project Structure
- `/components`: UI Components (HospitalDashboard, TrackingMap, SOSButton, etc.)
- `/contexts`: Global State Management (EmergencyContext)
- `/services`: Exterior API integrations (Gemini, Google Maps)
- `/types.ts`: Centralized TypeScript definitions

---
*CERS+ Emergency Infrastructure v3.1 (Stable)*
