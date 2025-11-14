


// FIX: Changed to a namespace import for `firebase/app` to resolve an issue where `initializeApp`
// was not found as a named export. This can be caused by module resolution inconsistencies.
import * as firebaseApp from "firebase/app";
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

// Initialize Firebase using the v10 modular API
// FIX: Use the namespace import to call initializeApp.
const app = firebaseApp.initializeApp(firebaseConfig);

// Get service instances
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export services and helpers
export { auth, db, storage, GoogleAuthProvider, increment, serverTimestamp };
export type { FieldValue, Timestamp };