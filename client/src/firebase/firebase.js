import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Debug logs
console.log("ENV LOADED? =>", !!import.meta.env.VITE_FIREBASE_API_KEY);
console.log("PROJECT ID =>", import.meta.env.VITE_FIREBASE_PROJECT_ID);

// Firebase config for Web SDK
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firestore & Auth
export const db = getFirestore(app);
export const auth = getAuth(app);