console.log('Firebase Config: Initialization Start');
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const MOCK = !import.meta.env.FIREBASE_API_KEY || import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';
const API_KEY = import.meta.env.FIREBASE_API_KEY || 'mock-api-key';
const PROJECT_ID = import.meta.env.FIREBASE_PROJECT_ID || 'anisell-mock';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN || `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET || `${PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.FIREBASE_APP_ID || '1:000000000000:web:0000000000000000',
  measurementId: import.meta.env.FIREBASE_MEASUREMENT_ID || 'G-0000000000'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

if (MOCK) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db, googleProvider };
