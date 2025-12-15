// @ts-ignore
import { initializeApp } from "firebase/app";
// @ts-ignore
import { getFirestore } from "firebase/firestore";

// Configuration
// Values restored from project screenshot
const firebaseConfig = {
  apiKey: "AIzaSyCLFHS0iq15OzWFKJcOOlD925NhKyu3mOc",
  authDomain: "cers-plus.firebaseapp.com",
  projectId: "cers-plus",
  storageBucket: "cers-plus.firebasestorage.app",
  messagingSenderId: "994111835488",
  appId: "1:994111835488:web:d56db532de4975d50ca205",
  measurementId: "G-4JC1DVST9P"
};

// Initialize Firebase
// @ts-ignore
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and export
// @ts-ignore
export const db = getFirestore(app);