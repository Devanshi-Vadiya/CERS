<div align="center">

<!-- Animated banner using capsule renders + SVG -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=CERS%2B&fontSize=80&fontColor=fff&fontAlignY=38&desc=Community%20Emergency%20Response%20System&descAlignY=60&descAlign=50&animation=fadeIn" width="100%"/>

<br/>

<!-- Live badges -->
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0d1117)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0d1117)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-ff9100?style=for-the-badge&logo=firebase&logoColor=white&labelColor=0d1117)
![Vite](https://img.shields.io/badge/Vite-6.x-646cff?style=for-the-badge&logo=vite&logoColor=white&labelColor=0d1117)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285f4?style=for-the-badge&logo=google&logoColor=white&labelColor=0d1117)

<br/>

> **A real-time, AI-powered emergency response platform** that connects victims, hospitals, and first responders — instantly.

<br/>

[![🚨 Live Demo](https://img.shields.io/badge/🚨_Live_Demo-Click_Here-FF4757?style=for-the-badge)](http://localhost:5174)

</div>

---

## ⚡ What is CERS+?

CERS+ (**Community Emergency Response System Plus**) is a full-stack web application that digitizes emergency response. When every second counts, CERS+ bridges the gap between people in distress and the nearest medical responders — with real-time GPS, AI triage, video evidence, and live ambulance tracking.

```
🧑 Victim / Bystander  ──▶  📡 CERS+ Platform  ──▶  🏥 Hospital Dashboard
        │                          │                         │
     One Tap SOS            Firestore Sync             Accept & Dispatch
     Guest Report           Live Location               Ambulance Fleet
     AI Chat Guide          Video Evidence              ETA Tracking
```

---

## 🗂️ User Roles

| Role | Description |
|------|------------|
| 👤 **General User** | Registered user — triggers personal SOS, reports guest emergencies, gets ambulance ETA |
| 🏥 **Hospital** | Emergency responder — views SOS queue, accepts cases, dispatches ambulances |
| 🛡️ **Admin** | Platform manager — vets & approves hospitals, blacklists violators |

---

## 🔥 Core Features

### 🆘 Personal SOS System

<table>
<tr>
<td width="50%">

**One-tap SOS Button**
- Single press triggers an emergency alert immediately
- Auto-captures GPS coordinates via browser Geolocation API
- Reverse-geocodes coordinates to a readable address using OpenStreetMap / Nominatim
- Emergency dispatched to Firestore in real time

</td>
<td width="50%">

**Emergency Type Selection**
- 8 emergency categories: Heart Attack, Accident, Bleeding, Burns, Stroke, Breathing, Seizure, Panic / Other
- Each type includes step-by-step protocol instructions, Dos, and Don'ts
- Color-coded by severity (Critical → Urgent → Moderate)

</td>
</tr>
</table>

---

### 📍 Real-Time Location & Tracking

- **Live GPS capture** — high-accuracy coordinates from device
- **Ambulance ETA countdown timer** — live countdown from hospital-set ETA
- **TrackingMap** — interactive Google Maps component showing incident location
- **Location update stream** — Firestore listeners push location changes to hospitals instantly

---

### 📹 Video Evidence Recording

- **MediaRecorder-powered** in-browser video capture (no app needed)
- Auto-starts recording when emergency type is selected
- **Front / Rear camera toggle** during recording
- **Mute / Unmute** audio control
- Review mode with **Save or Discard** before uploading
- Evidence stored as a Blob URL and attached to the Firestore emergency document
- Hospitals can view evidence in a **full-screen video modal** with metadata overlay

---

### 🤖 AI Chat Assistant (Gemini-Powered)

- Powered by **Google Gemini API** (`@google/genai`)
- In-app AI assistant answers medical and safety questions in real time
- Provides first-aid guidance, calming advice, protocol suggestions
- Available as a dedicated **"Assistant"** tab in the user dashboard

---

### 👥 Guest Emergency Mode *(Bystander Reporting)*

> **New feature** — allows a logged-in user to report an emergency for someone else (e.g. road accident witnessed on a highway).

<table>
<tr><td>

**Step 1 — Emergency Type Selection**
- Choose the type of emergency witnessed (Road Accident, Medical Emergency, etc.)
- Orange "Guest Mode" UI clearly distinguishes it from personal SOS

</td></tr>
<tr><td>

**Step 2 — Victim Details & Medical Info**
- Toggle victim condition: Conscious / Unconscious, Bleeding / Not, Breathing / Not
- Select number of victims: 1 / 2–5 / Mass Accident
- Optional bystander-provided medical info: Blood Group, Known Conditions, Current Medications, Allergies
- All data synced to Firestore only if provided

</td></tr>
<tr><td>

**Step 3 — Active Tracking + First Aid Guide**
- Live map of the incident GPS location
- Ambulance ETA countdown once a hospital accepts
- Step-by-step First Aid Guide and Do's/Don'ts for the emergency type
- Quick-action buttons: **Notify Community Responders**, **Responder Chat**, **Evidence Camera**

</td></tr>
</table>

---

### 🏥 Hospital Command Dashboard

| View | Features |
|------|----------|
| **Command Center** | Live SOS feed, incident cards, accept/dispatch/arrived workflow |
| **Active SOS Queue** | Full list of open emergencies, search, emergency type + location |
| **Fleet & Beds** | Visual ambulance units and ER bed capacity from hospital profile |
| **Medical Staff Roster** | Personnel table with active status |
| **Data Insights** | Hospital reliability score, average response time, ETA accuracy % |
| **Shift Report** | Auto-generated printable PDF-style shift handover document |

**Live incident cards show:**
- 🟠 `GUEST REPORT` badge for bystander-reported emergencies
- Colour-coded victim condition pills (Conscious / Bleeding / Breathing)
- Access Medical Profile (registered user) or Victim Info (guest-provided data) — hidden if no info available
- Video evidence viewer with duration, timestamp, and patient metadata

---

### 🛡️ Admin Panel

- Secured by username + password (`/admin-panel` route)
- View all registered hospitals with full profile details
- **Approve**, **Reject**, or **Blacklist** hospitals with reason
- Blacklisted hospitals cannot log in to the system

---

### 📊 Hospital Reliability Scoring

CERS+ tracks hospital performance automatically using a weighted formula:

```
Reliability Score = (0.4 × ETA Accuracy) + (0.4 × Response Speed) + (0.2 × Completion Rate)
```

- Scored out of 100
- Calculated from real ambulance arrival times vs promised ETAs
- Rolling average — recent cases have slightly higher weight
- Displayed as a large score card in the Hospital Analytics dashboard

---

### 🔐 Authentication & Security

- **General users** — phone number-based registration and login
- **Hospitals** — email + password with admin approval gate
- **Password reset** — via `/reset-password` route
- **Session persistence** — `sessionStorage` keeps users logged in across page refreshes
- **Blacklist enforcement** — blocked hospitals shown a specific rejection reason on login attempt

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React 19 + Vite                │
│                  TypeScript 5.8                 │
└────────────────┬────────────────────────────────┘
                 │
       ┌─────────▼─────────┐
       │   EmergencyContext  │  ← Global State (React Context)
       │   (Firestore sync)  │  ← Real-time onSnapshot listeners
       └─────────┬───────────┘
                 │
    ┌────────────┼────────────────┐
    ▼            ▼                ▼
GeneralApp   HospitalDashboard  AdminDashboard
    │
    ├── SOSButton
    ├── GuestEmergencyFlow
    ├── ActiveEmergency
    │     ├── TrackingMap
    │     ├── VideoRecorder
    │     └── AmbulanceCountdown
    └── ChatAssistant (Gemini AI)
```

```
Firebase Firestore Collections:
├── emergencies          ← Active & resolved SOS incidents
├── users                ← General user profiles
├── hospitals            ← Hospital profiles + status
├── hospital_stats       ← Reliability scores (live)
└── hospital_response_history  ← Per-case response records
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore enabled
- Google Maps API key
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cers-plus.git
cd cers-plus

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

Create a `firebaseConfig.ts` with your Firebase credentials:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Build for Production

```bash
npm run build
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5.8, Vite 6 |
| **Styling** | Tailwind CSS (utility classes) |
| **Database** | Firebase Firestore (real-time) |
| **Maps** | @react-google-maps/api |
| **AI** | Google Gemini API (`@google/genai`) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Geocoding** | OpenStreetMap Nominatim (free, no API key) |
| **Video** | Browser MediaRecorder API |

---

## 📁 Project Structure

```
CERS/
├── App.tsx                     # Root router & auth state machine
├── types.ts                    # All TypeScript interfaces & enums
├── constants.ts                # Emergency type definitions + protocols
├── firebaseConfig.ts           # Firebase initialization
│
├── contexts/
│   └── EmergencyContext.tsx    # Global state, Firestore sync, all actions
│
└── components/
    ├── LandingPage.tsx          # Public landing page
    ├── AuthScreen.tsx           # Login screen
    ├── SignUpFlow.tsx           # General user registration
    ├── HospitalSignUpFlow.tsx   # Hospital registration
    ├── ResetPassword.tsx        # Password reset
    │
    ├── GeneralApp.tsx           # User dashboard (SOS + Guest + Tabs)
    ├── SOSButton.tsx            # Animated SOS trigger button
    ├── ActiveEmergency.tsx      # Live emergency view (user)
    ├── GuestEmergencyFlow.tsx   # Guest/bystander reporting flow
    │
    ├── TrackingMap.tsx          # Google Maps component
    ├── VideoRecorder.tsx        # MediaRecorder-based video evidence
    ├── AmbulanceCountdown.tsx   # Live ETA countdown timer
    ├── ChatAssistant.tsx        # Gemini AI chat interface
    │
    ├── HospitalDashboard.tsx    # Hospital command center
    └── AdminDashboard.tsx       # Admin vetting panel
```

---

## 👩‍💻 Author

<div align="center">

**Devanshi Vadiya**

Built with ❤️ for hackathon innovation in emergency response systems.

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

*CERS+ — Because every second matters.* 🚑

</div>
