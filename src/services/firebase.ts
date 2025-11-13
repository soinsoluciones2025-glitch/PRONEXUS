// FIX: Changed import to use firebase/compat/app for initialization
// This resolves the error "Module 'firebase/app' has no exported member 'initializeApp'"
// which can occur in some environments or with certain dependency version conflicts.
// The v9 modular API used in the rest of the app is compatible with this initialization method.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, increment, serverTimestamp } from "firebase/firestore";
import type { FieldValue, Timestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseApiKey = (import.meta as any).env.VITE_FIREBASE_API_KEY;

if (!firebaseApiKey) {
  console.warn("Firebase API Key is missing. Please ensure VITE_FIREBASE_API_KEY is set in your environment variables.");
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase using compat library
const app = firebase.initializeApp(firebaseConfig);

// Get service instances using v9 modular API, which can work with a compat-initialized app
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export services and helpers
export { auth, db, storage, GoogleAuthProvider, increment, serverTimestamp };
export type { FieldValue, Timestamp };
