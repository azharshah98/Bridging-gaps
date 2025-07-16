import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDykPup22rjrnfgDak2diZtI9jBYsISi3w",
  authDomain: "carer-match.firebaseapp.com",
  projectId: "carer-match",
  storageBucket: "carer-match.firebasestorage.app",
  messagingSenderId: "922161902973",
  appId: "1:922161902973:web:aefae248a86fe92348c814",
  measurementId: "G-19236LK34J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 