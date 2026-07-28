import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth, type GoogleAuthProvider as GoogleProviderType } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app: any;
let auth: Auth | null;
let db: Firestore | null;
let googleProvider: GoogleProviderType | null;

try {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your-api-key-here') {
    throw new Error('Firebase API key not configured. Please update your .env file with your Firebase project credentials.');
  }
  
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create mock objects for development when Firebase is not configured
  app = null;
  auth = null;
  db = null;
  googleProvider = null;
}

export { auth, db, googleProvider };
