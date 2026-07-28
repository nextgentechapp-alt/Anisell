console.log('Firebase Config: Initialization Start');
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACcv4PO4kjECLr0ex9r179mzwuyZ0q-ME",
  authDomain: "anisell-ab8e8.firebaseapp.com",
  projectId: "anisell-ab8e8",
  storageBucket: "anisell-ab8e8.firebasestorage.app",
  messagingSenderId: "989026972047",
  appId: "1:989026972047:web:aa797d933f2fe961581bfa",
  measurementId: "G-9E4QBB4DVJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
